import axios from "axios";
import { useAuthStore } from "../stores/auth";
import router from "../router";

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
        const status = error.response?.status

        const redirectToLogin = () => {
            if (typeof window === 'undefined') return
            const current = router.currentRoute.value
            if (current?.name === 'Login') return
            const redirect = current?.fullPath || '/'
            router.push({ name: 'Login', query: { redirect } })
        }

        if (status === 401 && authStore.refreshToken && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                await authStore.refreshTokenAction()
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                authStore.clearAuth()
                redirectToLogin()
                return Promise.reject(refreshError)
            }
        }

        if (status === 401) {
            authStore.clearAuth()
            redirectToLogin()
        }
        return Promise.reject(error)
    }
)

export default api
