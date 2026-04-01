import { get, post, put, del } from './index.js'

export const fetchDaily        = (date)         => get(`/api/attendance?date=${date}`)
export const fetchCalendar     = (month)        => get(`/api/attendance/calendar?month=${month}`)
export const fetchMonthReport  = (month)        => get(`/api/attendance/report?month=${month}`)
export const fetchRangeReport  = (from, to)     => get(`/api/attendance/summary?from=${from}&to=${to}`)
export const upsertAttendance  = (data)         => post('/api/attendance', data)
export const updateAttendance  = (id, data)     => put(`/api/attendance/${id}`, data)
export const deleteAttendance  = (id)           => del(`/api/attendance/${id}`)
