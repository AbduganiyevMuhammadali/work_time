import { get, post, put, del } from './index.js'

export const fetchEmployees   = ()        => get('/api/employees')
export const fetchEmployee    = (id)      => get(`/api/employees/${id}`)
export const createEmployee   = (data)    => post('/api/employees', data)
export const updateEmployee   = (id, data) => put(`/api/employees/${id}`, data)
export const deleteEmployee   = (id)      => del(`/api/employees/${id}`)
export const fetchEmpStats    = ()        => get('/api/employees/stats')
