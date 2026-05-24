import { supabase } from './supabase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token
}

async function request(path, options = {}) {
  const token = await getToken()

  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Request failed')
  return json.data
}

export const api = {
  courses: {
    list: () => request('/api/courses'),
    get: (id) => request(`/api/courses/${id}`),
    create: (data) => request('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/courses/${id}`, { method: 'DELETE' }),
    createSection: (courseId, data) => request(`/api/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify(data) }),
    updateSection: (id, data) => request(`/api/courses/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSection: (id) => request(`/api/courses/sections/${id}`, { method: 'DELETE' }),
    createLesson: (sectionId, data) => request(`/api/courses/sections/${sectionId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
    updateLesson: (id, data) => request(`/api/courses/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLesson: (id) => request(`/api/courses/lessons/${id}`, { method: 'DELETE' }),
  },
}
