const BASE = '/api/v1'

function getToken() {
  return localStorage.getItem('wt_token')
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || 'Xatolik yuz berdi')
  return data
}

export const api = {
  // ── Auth ────────────────────────────────────────────────
  login:   (username, password) => request('POST', '/users/login', { username, password }),
  whoami:  ()                   => request('GET',  '/users/whoami'),

  // ── Users / Xodimlar (bitta API) ────────────────────────
  getUsers:    ()        => request('GET',    '/users'),
  getUser:     (id)      => request('GET',    `/users/id/${id}`),
  createUser:  (data)    => request('POST',   '/users', data),
  updateUser:  (id, data)=> request('PATCH',  `/users/id/${id}`, data),
  deleteUser:  (id)      => request('DELETE', `/users/id/${id}`),

  // ── Davomat ─────────────────────────────────────────────
  getAttendance:    (date)        => request('GET',   `/attendance?date=${date}`),
  saveAttendance:   (data)        => request('POST',  '/attendance', data),
  updateAttendance: (id, data)    => request('PATCH', `/attendance/${id}`, data),
}
