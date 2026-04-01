import { get, post, del } from './index.js'

export const fetchSalary     = (month)        => get(`/api/salary?month=${month}`)
export const fetchSalaryRpt  = (month)        => get(`/api/salary/report?month=${month}`)
export const addFine         = (data)         => post('/api/salary/fine', data)
export const removeFine      = (id)           => del(`/api/salary/fine/${id}`)
