import { defineStore } from 'pinia'
import axios from 'axios'

const API_URl = 'https://student.jamshidibodullayev.uz'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        userId: localStorage.getItem('userId') || null,
        role: localStorage.getItem('role') || null,
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        getUser: (state) => state.user,
        isAdmin: (state) => {
            const role = (state.user?.role || state.role || '').toString().toLowerCase()
            return role.includes('admin')
        }
    },

    actions: {
        setTokens(access, refresh, userId = null) {
            this.accessToken = access
            this.refreshToken = refresh
            if (userId) this.userId = userId

            localStorage.setItem('accessToken', access)
            localStorage.setItem('refreshToken', refresh)
            if (userId) localStorage.setItem('userId', userId)
        },

        clearAuth() {
            this.user = null
            this.accessToken = null
            this.refreshToken = null
            this.userId = null
            this.role = null

            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem("userId")
            localStorage.removeItem('role')
        },

        async register(userData) {
            this.loading = true
            this.error = null

            try {
                const res = await axios.post(`${API_URl}/api/auth/register`, userData)

                if (res.data.success && res.data.data?.tokens) {
                    const { accessToken, refreshToken } = res.data.data.tokens
                    const uid = res.data.data.user?.id

                    this.setTokens(accessToken, refreshToken, uid)

                    await this.fetchUser()
                    return { success: true }
                }
                throw new Error('Registration failed')
            } catch (err) {
                this.error = err.response?.data?.message || 'Ro‘yxatdan o‘tishda xato'
                return { success: false, message: this.error }
            } finally {
                this.loading = false
            }
        },

        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                const res = await axios.post(`${API_URl}/api/auth/login`, credentials)

                if (res.data.success && res.data.data?.tokens) {
                    const { accessToken, refreshToken } = res.data.data.tokens
                    const uid = res.data.data.user?.id

                    this.setTokens(accessToken, refreshToken, uid)

                    await this.fetchUser()
                    return { success: true }
                }
                throw new Error('Login failed')
            } catch (err) {
                this.error = err.response?.data?.message || 'Kirishda xato'
                return { success: false, message: this.error }
            } finally {
                this.loading = false
            }
        },
        async fetchUser() {
            if (!this.accessToken || !this.userId) return

            try {
                const res = await axios.get(`${API_URl}/api/users/${this.userId}`, {
                    headers: { Authorization: `Bearer ${this.accessToken}` }
                })
                if (res.data.success) {
                    this.user = res.data.data
                    const role = this.user?.role ? this.user.role.toString().toLowerCase() : null
                    if (role) {
                        this.role = role
                        localStorage.setItem('role', role)
                    }
                }
            } catch (err) {
                console.warn('User fetch failed', err)
            }
        },

        async logout() {
            try {
                if (this.accessToken) {
                    await axios.post(`${API_URl}/api/auth/logout`, {}, {
                        headers: { Authorization: `Bearer ${this.accessToken}` }
                    })
                }
            } catch (e) {
                console.log('Logout request failed', e);
            } finally {
                this.clearAuth()
            }
        },

        async refreshTokenAction() {
            if (!this.refreshToken) throw new Error('No refresh token')

            try {
                const res = await axios.post(`${API_URl}/api/auth/refresh-token`, {
                    refreshToken: this.refreshToken
                })

                if (res.data.success && res.data.data?.tokens) {
                    const { accessToken, refreshToken } = res.data.data.tokens
                    this.setTokens(accessToken, refreshToken)
                    return accessToken
                }
            } catch (err) {
                this.clearAuth()
                throw err
            }
        }
    }
}) 
