export function isTokenExpired(token: string): boolean {
  if (!token) return true

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    const payloadBase64 = parts[1]
    if (!payloadBase64) return true

    const decodedPayload = JSON.parse(
      window.atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')),
    )

    if (!decodedPayload.exp) return false

    const currentTime = Math.floor(Date.now() / 1000)
    return decodedPayload.exp < currentTime + 10
  } catch {
    return true
  }
}
