import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://admin-backend-7lwn.onrender.com/api/admin',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('session-expired'))
    }
    return Promise.reject(err)
  },
)

export default axiosInstance
