/* eslint-disable import/first -- jest.mock() must be hoisted above the imports it replaces */
import { describe, expect, it, jest } from '@jest/globals';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

// links.ts pulls in `tokens` (expo-secure-store), which has no native backing
// under jest. We only exercise the pure classifier, so stub the module out.
jest.mock('@/lib/tokens', () => ({
  tokens: { getAccess: jest.fn(() => null) },
}));

import { isAuthError } from '@/graphql/links';

// Build a branded CombinedGraphQLErrors the same way Apollo does internally, so
// `CombinedGraphQLErrors.is()` (which links.ts gates on) returns true.
function combined(errors: { message: string; extensions?: Record<string, unknown> }[]) {
  return new CombinedGraphQLErrors({ errors } as never);
}

describe('isAuthError', () => {
  it('treats the canonical UNAUTHENTICATED extension code as an auth error', () => {
    expect(
      isAuthError(combined([{ message: 'nope', extensions: { code: 'UNAUTHENTICATED' } }]))
    ).toBe(true);
  });

  it('falls back to the message regex for auth-ish phrasings without a code', () => {
    expect(isAuthError(combined([{ message: 'jwt expired' }]))).toBe(true);
    expect(isAuthError(combined([{ message: 'Authentication required' }]))).toBe(true);
    expect(isAuthError(combined([{ message: 'token expired, please retry' }]))).toBe(true);
  });

  it('does NOT treat an ordinary field error as an auth error', () => {
    expect(isAuthError(combined([{ message: 'Tournament not found' }]))).toBe(false);
  });

  it('detects an auth error among a mix of unrelated errors', () => {
    expect(
      isAuthError(
        combined([
          { message: 'Tournament not found' },
          { message: 'whatever', extensions: { code: 'UNAUTHENTICATED' } },
        ])
      )
    ).toBe(true);
  });

  it('is false for non-GraphQL errors (plain Error, null, undefined)', () => {
    expect(isAuthError(new Error('network down'))).toBe(false);
    expect(isAuthError(null)).toBe(false);
    expect(isAuthError(undefined)).toBe(false);
  });
});
