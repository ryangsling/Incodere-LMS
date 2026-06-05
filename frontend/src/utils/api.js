import { supabase } from './supabase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token
}

// Authed blob download. The session token lives in localStorage and
// is NOT sent on a plain <a href> navigation, so we must fetch the
// file with the Bearer header and trigger a download from a blob URL.
async function downloadBlob(path) {
  const token = await getToken()
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    let msg = 'Download failed'
    try {
      const json = await res.json()
      msg = json.error || msg
    } catch {}
    throw new Error(msg)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const cd = res.headers.get('Content-Disposition') || ''
  const match = cd.match(/filename="?([^";]+)"?/)
  a.download = match?.[1] || 'download'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function buildUrl(path, params) {
  if (!params || Object.keys(params).length === 0) return path
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (filtered.length === 0) return path
  const qs = new URLSearchParams(filtered).toString()
  return `${path}?${qs}`
}

async function request(path, { method = 'GET', body, params } = {}) {
  const token = await getToken()

  const res = await fetch(`${API}${buildUrl(path, params)}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Request failed')
  return json.data
}

export const api = {
  courses: {
    list: (params) => request('/api/courses', { params }),
    get: (id) => request(`/api/courses/${id}`),
    create: (data) => request('/api/courses', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/courses/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/api/courses/${id}`, { method: 'DELETE' }),
    createSection: (courseId, data) => request(`/api/courses/${courseId}/sections`, { method: 'POST', body: data }),
    updateSection: (id, data) => request(`/api/courses/sections/${id}`, { method: 'PUT', body: data }),
    deleteSection: (id) => request(`/api/courses/sections/${id}`, { method: 'DELETE' }),
    createLesson: (sectionId, data) => request(`/api/courses/sections/${sectionId}/lessons`, { method: 'POST', body: data }),
    updateLesson: (id, data) => request(`/api/courses/lessons/${id}`, { method: 'PUT', body: data }),
    deleteLesson: (id) => request(`/api/courses/lessons/${id}`, { method: 'DELETE' }),
  },
  organisations: {
    list: (params) => request('/api/organisations', { params }),
    create: (data) => request('/api/organisations', { method: 'POST', body: data }),
    createCompanyAdmin: (orgId, data) => request(`/api/organisations/${orgId}/company-admin`, { method: 'POST', body: data }),
    listUsers: (orgId, params) => request(`/api/organisations/${orgId}/users`, { params }),
    createLearner: (orgId, data) => request(`/api/organisations/${orgId}/learners`, { method: 'POST', body: data }),
    deactivateUser: (userId) => request(`/api/organisations/users/${userId}/deactivate`, { method: 'PUT' }),
    activateUser: (userId) => request(`/api/organisations/users/${userId}/activate`, { method: 'PUT' }),
    deleteUser: (userId) => request(`/api/organisations/users/${userId}`, { method: 'DELETE' }),
    resendInvite: (userId) => request(`/api/organisations/users/${userId}/resend-invite`, { method: 'POST' }),
  },
  enrolments: {
    list: (params) => request('/api/enrolments', { params }),
    create: (data) => request('/api/enrolments', { method: 'POST', body: data }),
    delete: (id) => request(`/api/enrolments/${id}`, { method: 'DELETE' }),
    myEnrolments: () => request('/api/enrolments/me'),
    getEnrolledCourse: (courseId) => request(`/api/enrolments/me/${courseId}`),
    report: (params) => request('/api/enrolments/report', { params }),
  },
  progress: {
    markComplete: (data) => request('/api/progress', { method: 'POST', body: data }),
    getCourseProgress: (courseId) => request(`/api/progress/${courseId}`),
  },
  certificates: {
    generate: (data) => request('/api/certificates', { method: 'POST', body: data }),
    mine: (params) => request('/api/certificates/mine', { params }),
    list: (params) => request('/api/certificates', { params }),
    download: (id) => downloadBlob(`/api/certificates/${id}/download`),
  },
  verify: {
    certificate: (id) => request(`/api/verify/${id}`),
  },
  auth: {
    me: () => request('/api/auth/me'),
    forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (data) => request('/api/auth/reset-password', { method: 'POST', body: data }),
    acceptInvite: (data) => request('/api/auth/accept-invite', { method: 'POST', body: data }),
    acceptInviteInfo: (data) => request('/api/auth/accept-invite-info', { method: 'POST', body: data }),
  },
  stats: {
    platform: () => request('/api/stats'),
  },
}
