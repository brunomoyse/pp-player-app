import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import type { ApolloLink } from '@apollo/client/link';
import { Observable } from 'rxjs';

import { getAuthActions } from '@/graphql/authActions';
import { captureException } from '@/lib/monitoring';
import { tokens } from '@/lib/tokens';

// Inject the bearer access token on every request.
export const authLink = new SetContextLink((prevContext) => {
  const token = tokens.getAccess();
  return {
    ...prevContext,
    headers: {
      ...(prevContext.headers ?? {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Canonical auth signal is `extensions.code === 'UNAUTHENTICATED'` (set by the
// backend's `auth_error()` helper). The message regex is a fallback for errors
// that predate the code or come from other auth-guard phrasings.
const AUTH_MESSAGE =
  /authentication required|unauthenticated|unauthorized|must be logged|not authenticated|jwt|token expired|invalid or expired|forbidden/i;

function isAuthError(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) return false;
  return error.errors.some(
    (e) => e.extensions?.code === 'UNAUTHENTICATED' || AUTH_MESSAGE.test(e.message ?? '')
  );
}

// On an auth failure, refresh the access token once (single-flight lives in the
// auth store) and transparently retry the operation, so the user never sees the
// error. If refresh fails, sign out — route guards then send them to /login.
// The proactive 14-min timer handles the common case; this is the safety net.
export const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!isAuthError(error)) {
    if (error) {
      captureException(error, { operation: operation.operationName ?? 'operation' });
      if (__DEV__) {
        console.warn(
          `[gql] ${operation.operationName ?? 'operation'} failed: ${
            (error as { message?: string })?.message ?? String(error)
          }`
        );
      }
    }
    return;
  }

  const auth = getAuthActions();
  if (!auth) return;

  // Guard against retry loops: at most one refresh+retry per operation.
  if (operation.getContext().authRetried) {
    void auth.signOut();
    return;
  }

  if (__DEV__) {
    console.warn(
      `[gql] ${operation.operationName ?? 'operation'}: auth error → refreshing token`
    );
  }

  return new Observable<ApolloLink.Result>((observer) => {
    let inner: { unsubscribe: () => void } | undefined;
    let cancelled = false;

    auth
      .refresh()
      .then((ok) => {
        if (cancelled) return;
        if (!ok) {
          void auth.signOut();
          observer.error(error);
          return;
        }
        // authLink re-reads the freshly stored access token on this retry.
        operation.setContext({ authRetried: true });
        inner = forward(operation).subscribe(observer);
      })
      .catch(() => {
        if (cancelled) return;
        void auth.signOut();
        observer.error(error);
      });

    return () => {
      cancelled = true;
      inner?.unsubscribe();
    };
  });
});
