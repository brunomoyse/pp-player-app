import { CombinedGraphQLErrors } from '@apollo/client/errors';

/**
 * The first message the GraphQL server sent back, or `null` for network and
 * transport failures — their raw text ("Failed to fetch") means nothing to a
 * player. Callers match on the returned string to pick localized copy, and
 * fall back to their own generic message when it's `null` or unrecognised, so
 * raw server/database text never reaches the UI.
 */
export function serverErrorMessage(e: unknown): string | null {
  if (!CombinedGraphQLErrors.is(e)) return null;
  return e.errors[0]?.message?.trim() || null;
}
