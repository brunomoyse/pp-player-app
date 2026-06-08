export type QRCodeType = 'checkin' | 'tournament' | 'drinkCard' | 'unknown'

export interface ParsedQRCode {
  type: QRCodeType
  payload: string
}

/** Pull a `token` value out of a URL-shaped string (`...?token=abc` or `.../claim/abc`). */
function tokenFromUrl(code: string): string | null {
  const queryMatch = code.match(/[?&]token=([^&\s]+)/i)
  if (queryMatch) return decodeURIComponent(queryMatch[1])
  const pathMatch = code.match(/\/(?:claim|drink)\/([A-Za-z0-9]+)/i)
  if (pathMatch) return pathMatch[1]
  return null
}

export function parseQRCode(code: string): ParsedQRCode {
  if (code.startsWith('CHECKIN:')) {
    return { type: 'checkin', payload: code.substring('CHECKIN:'.length) }
  }
  if (code.startsWith('TOURNAMENT:')) {
    return { type: 'tournament', payload: code.substring('TOURNAMENT:'.length) }
  }
  if (code.startsWith('DRINK:')) {
    return { type: 'drinkCard', payload: code.substring('DRINK:'.length) }
  }
  const urlToken = tokenFromUrl(code)
  if (urlToken) {
    return { type: 'drinkCard', payload: urlToken }
  }
  return { type: 'unknown', payload: code }
}

/**
 * Resolve a drink-card credential token from a scanned/typed code. Tolerant of a
 * `DRINK:` prefix, a URL with a token param, or a bare credential string. Returns
 * null when the value can't plausibly be a credential (too short / not alphanumeric).
 */
export function extractDrinkToken(input: string | ParsedQRCode): string | null {
  const parsed = typeof input === 'string' ? parseQRCode(input.trim()) : input
  if (parsed.type === 'drinkCard') return parsed.payload
  if (parsed.type === 'unknown' && /^[A-Za-z0-9]{16,}$/.test(parsed.payload)) {
    return parsed.payload
  }
  return null
}
