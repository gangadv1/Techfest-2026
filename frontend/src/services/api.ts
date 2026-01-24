import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const jobsAPI = {
  getAll: (params?: any) => api.get('/jobs', { params }),
  getById: (id: string) => api.get(`/jobs/${id}`),
}

export const resumeAPI = {
  scan: (data: { jobId: string; resumeText: string }) => 
    api.post('/resume/scan', data)
}

export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  create: (data: any) => api.post('/applications', data),
  update: (id: string, data: any) => api.put(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`)
}

export default api
