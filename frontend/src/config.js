const API_BASE = import.meta.env.VITE_API_URL || ''
const WS_BASE = import.meta.env.VITE_WS_URL || ''

export function getApiUrl(path) {
  return `${API_BASE}${path}`
}

export function getWsUrl() {
  if (WS_BASE) return WS_BASE
  if (typeof window === 'undefined') return ''
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  if (API_BASE) {
    const url = new URL(API_BASE)
    return `${protocol}//${url.host}`
  }
  return `${protocol}//${window.location.host}`
}
