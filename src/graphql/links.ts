import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';

import { getAuthActions } from '@/graphql/authActions';
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

const AUTH_ERROR = /unauthorized|unauthenticated|must be logged|not authenticated|jwt|token expired|forbidden/i;

// On an auth failure, try a token refresh; if that fails, sign the user out.
// (Proactive refresh on a 14-min timer handles the common case.)
export const errorLink = new ErrorLink(({ error }) => {
  const message =
    (error as { message?: string })?.message ??
    (typeof error === 'string' ? error : '') ??
    '';
  if (AUTH_ERROR.test(message)) {
    const auth = getAuthActions();
    if (auth) {
      auth.refresh().then((ok) => {
        if (!ok) auth.signOut();
      });
    }
  }
});
