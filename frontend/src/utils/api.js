import { getApiUrl } from '../config'

export function authHeaders() {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function authFetch(url, options = {}) {
  return fetch(getApiUrl(url), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  })
}
