import axios from "axios";
import { useAuthStore } from "../stores/auth";

const api = axios.create({
    baseURL: 'https://student.jamshidibodullayev.uz'
})

api.interceptors.request.use(config => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
})

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config
        const authStore = useAuthStore()

        if (error.response?.status === 401 && !originalRequest._retry && authStore.refreshToken) {
            originalRequest._retry = true

            try {
                await authStore.refreshTokenAction()
                originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                authStore.clearAuth()
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api