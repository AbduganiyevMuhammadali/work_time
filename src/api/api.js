const BASE = '/api/v1'

function getToken() {
  return localStorage.getItem('wt_token')
}

function logout() {
  localStorage.removeItem('wt_token')
  localStorage.removeItem('wt_user')
  window.location.href = '/login'
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

  // Token muddati tugagan yoki yaroqsiz → login sahifasiga qaytarish
  if (res.status === 401 && path !== '/users/login') {
    logout()
    return
  }

  if (!res.ok) throw new Error(data.error || data.message || 'Xatolik yuz berdi')
  return data
}

export const api = {
  // ── Auth ────────────────────────────────────────────────
  login:   (username, password) => request('POST', '/users/login', { username, password }),
  whoami:  ()                   => request('GET',  '/users/whoami'),

  // ── Users / Xodimlar (bitta API) ────────────────────────
  getUsers:    ()         => request('GET',    '/users'),
  getUser:     (id)       => request('GET',    `/users/id/${id}`),
  createUser:  (data)     => request('POST',   '/users', data),
  updateUser:  (id, data) => request('PATCH',  `/users/id/${id}`, data),
  deleteUser:  (id)       => request('DELETE', `/users/id/${id}`),
  uploadPhoto: (id, formData) => {
    const token = localStorage.getItem('wt_token')
    return fetch(`/api/v1/users/id/${id}/photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json())
  },
  deletePhoto: (id) => request('DELETE', `/users/id/${id}/photo`),

  // ── Davomat (manual) ────────────────────────────────────
  getAttendance:    (date)       => request('GET',   `/attendance?date=${date}`),
  saveAttendance:   (data)       => request('POST',  '/attendance', data),
  updateAttendance: (id, data)   => request('PATCH', `/attendance/${id}`, data),

  // ── Face ID davomat ──────────────────────────────────────
  getFaceIdAttendance: (date)       => request('GET', `/face-id/attendance?date=${date}`),
  getFaceIdRange:      (start, end) => request('GET', `/face-id/range?start=${start}&end=${end}`),

  // ── Jarimalar (penalties_and_bonus) ──────────────────────
  getPenalties:   ()         => request('GET',    '/face-id/penalties'),
  createPenalty:  (data)     => request('POST',   '/face-id/penalties', data),
  updatePenalty:  (id, data) => request('PATCH',  `/face-id/penalties/${id}`, data),
  deletePenalty:  (id)       => request('DELETE', `/face-id/penalties/${id}`),

  // ── Avanslar ─────────────────────────────────────────────
  getAdvances:          ()              => request('GET',    '/advances'),
  getAdvanceBalances:   ()              => request('GET',    '/advances/balances'),
  createAdvance:        (data)          => request('POST',   '/advances', data),
  updateAdvance:        (id, data)      => request('PATCH',  `/advances/${id}`, data),
  deleteAdvance:        (id)            => request('DELETE', `/advances/${id}`),
  repayAdvance:         (id, data)      => request('POST',   `/advances/${id}/repay`, data),
  deleteRepayment:      (id, rpId)      => request('DELETE', `/advances/${id}/repayments/${rpId}`),
  repayForUser:         (data)          => request('POST',   '/advances/repay-for-user', data),

  // ── Ta'tillar ────────────────────────────────────────────
  getLeaves:    (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v != null && v !== ''))).toString()
    return request('GET', `/leaves${qs ? '?' + qs : ''}`)
  },
  createLeave:  (data)       => request('POST',   '/leaves', data),
  updateLeave:  (id, data)   => request('PATCH',  `/leaves/${id}`, data),
  deleteLeave:  (id)         => request('DELETE', `/leaves/${id}`),

  // ── Chat ─────────────────────────────────────────────────
  getChatHistory:    (peerId, me, limit, before) => {
    const qs = new URLSearchParams({ me, ...(limit ? { limit } : {}), ...(before ? { before } : {}) }).toString()
    return request('GET', `/chat/history/${peerId}?${qs}`)
  },
  getChatUnreadCounts: (me)             => request('GET',   `/chat/unread-counts?me=${me}`),
  sendChatMessage:     (data)           => request('POST',  '/chat/send', data),
  markChatRead:        (peerId, me)     => request('PATCH', `/chat/read/${peerId}?me=${me}`),

  // ── Oylik ────────────────────────────────────────────────
  getSalaries:  (month, year)         => request('GET',    `/oylik?month=${month}&year=${year}`),
  updateSalary: (userId, data)        => request('PATCH',  `/oylik/${userId}`, data),
  addFine:      (userId, data)        => request('POST',   `/oylik/${userId}/fine`, data),
  resetFine:    (userId, month, year) => request('DELETE', `/oylik/${userId}/fine?month=${month}&year=${year}`),
}
