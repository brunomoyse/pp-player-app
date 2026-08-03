import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { describe, expect, it } from '@jest/globals';

import { serverErrorMessage } from '@/lib/errors';

describe('serverErrorMessage', () => {
  it('returns the first GraphQL error message', () => {
    const e = new CombinedGraphQLErrors(
      { data: null },
      [{ message: 'Registration is not open for this tournament' }]
    );
    expect(serverErrorMessage(e)).toBe('Registration is not open for this tournament');
  });

  it('trims surrounding whitespace', () => {
    const e = new CombinedGraphQLErrors({ data: null }, [{ message: '  Tournament not found  ' }]);
    expect(serverErrorMessage(e)).toBe('Tournament not found');
  });

  // Transport failures carry text like "Failed to fetch" that means nothing to
  // a player, so callers must fall back to their own localized copy.
  it('returns null for network and unknown errors', () => {
    expect(serverErrorMessage(new Error('Failed to fetch'))).toBeNull();
    expect(serverErrorMessage(undefined)).toBeNull();
    expect(serverErrorMessage('boom')).toBeNull();
  });

  it('returns null when the server sent an empty message', () => {
    const e = new CombinedGraphQLErrors({ data: null }, [{ message: '   ' }]);
    expect(serverErrorMessage(e)).toBeNull();
  });
});
