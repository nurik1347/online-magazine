import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import Dashboard from "../pages/Dashboard.vue";
import UsersView from "../views/UsersView.vue";
import AdminsView from "../views/AdminsView.vue";
import ProductsView from "../views/ProductsView.vue";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView,
        meta: { requiresGuest: true }
    },
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/users',
        name: 'Users',
        component: UsersView,
        meta: { requiresAuth: true }
    },
    {
        path: '/admins',
        name: 'Admins',
        component: AdminsView,
        meta: { requiresAuth: true }
    },
    {
        path: '/products',
        name: 'Products',
        component: ProductsView,
        meta: { requiresAuth: true }
    },
    {
        path: '/products/:id/upload-image',
        name: 'UploadProductImage',
        component: () => import('../views/UploadProductImage.vue'),
        meta: {
            requiresAuth: true,
            layout: 'default'
        }
    },
    {
        path: '/users/add',
        name: 'AddUser',
        component: () => import('../views/AddUserView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/users/:id/edit',
        name: 'EditUser',
        component: () => import('../views/EditUserView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/products/add',
        name: 'AddProduct',
        component: () => import('../views/AddProduct.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admins/create',
        name: 'CreateAdmin',
        component: () => import('../views/CreateAdmin.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/products/:id/edit',
        name: 'EditProduct',
        component: () => import('../views/EditProduct.vue')
    },
    {
        path: '/admins/:id/edit',
        name: 'EditAdmin',
        component: () => import('../views/EditAdmin.vue')
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.accessToken && authStore.refreshToken) {
        try {
            await authStore.refreshTokenAction()
        } catch (err) {
            authStore.clearAuth()
        }
    }

    if (authStore.accessToken && !authStore.user) {
        try {
            await authStore.fetchUser()
        } catch (err) {
            authStore.clearAuth()
            if (to.meta.requiresAuth) {
                next({ name: 'Login' })
                return
            }
        }
    }

    const isAuthenticated = authStore.isAuthenticated

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
    }

    if (to.meta.requiresGuest && isAuthenticated) {
        next({ name: 'Dashboard' })
        return
    }

    next()
})

export default router