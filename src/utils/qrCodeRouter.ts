export type QRCodeType = 'checkin' | 'tournament' | 'unknown'

export interface ParsedQRCode {
  type: QRCodeType
  payload: string
}

export function parseQRCode(code: string): ParsedQRCode {
  if (code.startsWith('CHECKIN:')) {
    return { type: 'checkin', payload: code.substring('CHECKIN:'.length) }
  }
  if (code.startsWith('TOURNAMENT:')) {
    return { type: 'tournament', payload: code.substring('TOURNAMENT:'.length) }
  }
  return { type: 'unknown', payload: code }
}
