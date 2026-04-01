const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export const get    = (path)         => api(path)
export const post   = (path, body)   => api(path, { method: 'POST',   body })
export const put    = (path, body)   => api(path, { method: 'PUT',    body })
export const del    = (path)         => api(path, { method: 'DELETE' })
