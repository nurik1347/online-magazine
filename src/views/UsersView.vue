<template>
    <div class="users-page">
        <div class="breadcrumb">
            <router-link to="/dashboard">Home</router-link>
            <span class="separator">></span>
            <span class="current">Executive</span>
            <span class="separator">></span>
        </div>

        <div class="header-row">
            <h2 class="section-title">Users</h2>
            <div class="header-actions">
                <input
                    v-model="search"
                    class="search-input"
                    type="search"
                    placeholder="Search users..."
                />
                <button class="btn-outline" :disabled="loading" @click="fetchUsers">
                    <Icon name="refresh" :size="16" />
                    Yangilash
                </button>
                <button v-if="isAdmin && filteredUsers.length" class="export-btn" @click="exportUsers">
                    <i class="bi bi-download"></i>
                    CSV
                </button>
                <button v-if="isAdmin" class="add-btn" @click="goToAdd">+ Add</button>
            </div>
        </div>

        <div class="tabs">
            <button class="tab active">
                All ({{ filteredUsers.length }})
            </button>
        </div>

        <div v-if="loading" class="table-wrapper table-skeleton" aria-hidden="true">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>USERNAME</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                        <th>STATUS</th>
                        <th>ROLE</th>
                        <th>CREATE DATE</th>
                        <th v-if="isAdmin">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="n in 8" :key="`skeleton-${n}`">
                        <td v-for="c in skeletonCols" :key="c">
                            <div class="skeleton skeleton-line"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="no-data">No users found</div>

        <div v-else class="table-wrapper">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>USERNAME</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                        <th>STATUS</th>
                        <th>ROLE</th>
                        <th>CREATE DATE</th>
                        <th v-if="isAdmin">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in filteredUsers" :key="user.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ user.username || '-' }}</td>
                        <td>{{ user.email || '-' }}</td>
                        <td>{{ user.phone || '-' }}</td>
                        <td>
                            <span :class="['status-badge', user.status?.toLowerCase()]">
                                {{ user.status || 'Unknown' }}
                            </span>
                        </td>
                        <td>
                            <span :class="['role-badge', user.role?.toLowerCase()]">
                                {{ user.role || 'Unknown' }}
                            </span>
                        </td>
                        <td>{{ formatDate(user.createdAt) }}</td>
                        <td v-if="isAdmin" class="actions">
                            <button class="action-btn edit" title="Edit" @click="goToEdit(user.id)">
                                <Icon name="edit" :size="16" />
                            </button>
                            <button class="action-btn delete" title="Delete" @click="deleteUser(user.id)">
                                <Icon name="trash" :size="16" />
                            </button>

                            <button
                                v-if="user.role?.toLowerCase() !== 'admin'"
                                class="action-btn make-admin"
                                title="Make Admin"
                                @click="makeAdmin(user.id)"
                            >
                                <Icon name="admin" :size="16" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="toast.show" :class="['toast', toast.type]">
            {{ toast.message }}
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import Icon from '../components/Icon.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])
const loading = ref(true)
const search = ref('')
const isAdmin = computed(() => authStore.isAdmin)
const skeletonCols = computed(() => (isAdmin.value ? 8 : 7))

const toast = ref({
    show: false,
    message: '',
    type: 'success'
})

onMounted(async () => {
    await fetchUsers()
})

async function fetchUsers() {
    loading.value = true
    try {
        const res = await api.get('/api/users?page=1&limit=1000')
        if (res.data.success && res.data.data?.users) {
            users.value = res.data.data.users.filter(u =>
                u.role?.toLowerCase() === 'executive' || u.role?.toLowerCase() === 'user'
            )
        }
    } catch (err) {
        console.error('Users yuklanmadi:', err)
    } finally {
        loading.value = false
    }
}

const filteredUsers = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) return users.value

    return users.value.filter((user) => {
        const haystack = [
            user.username,
            user.email,
            user.phone,
            user.status,
            user.role,
            user.createdAt
        ]
            .map(value => (value ?? '').toString().toLowerCase())
            .join(' ')

        return haystack.includes(query)
    })
})

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    }).replace(',', '')
}

const goToAdd = () => {
    router.push('/users/add')
}

const goToEdit = (userId) => {
    router.push(`/users/${userId}/edit`)
}

async function deleteUser(userId) {
    if (!confirm('Haqiqatan ham ushbu foydalanuvchini o\'chirmoqchimisiz?')) return

    try {
        const res = await api.delete(`/api/users/${userId}`)
        if (res.data.success) {
            users.value = users.value.filter(u => u.id !== userId)
            showToast('Foydalanuvchi o\'chirildi!', 'success')
        } else {
            showToast(res.data.message || 'O\'chirishda xatolik', 'error')
        }
    } catch (err) {
        console.error('Delete xatosi:', err)
        showToast('Serverda xatolik yuz berdi', 'error')
    }
}

async function makeAdmin(userId) {
    if (!confirm('Ushbu foydalanuvchini admin qilmoqchimisiz?')) return

    try {
        const res = await api.put(`/api/users/${userId}`, {
            role: 'admin'
        })

        if (res.data.success) {
            const userIndex = users.value.findIndex(u => u.id === userId)
            if (userIndex !== -1) {
                users.value[userIndex].role = 'admin'
            }
            showToast('Foydalanuvchi admin qilib belgilandi!', 'success')
        } else {
            showToast(res.data.message || 'Admin qilishda xatolik', 'error')
        }
    } catch (err) {
        console.error('Make admin xatosi:', err)
        showToast(err.response?.data?.message || 'Serverda xatolik', 'error')
    }
}

function showToast(message, type = 'success') {
    toast.value = { show: true, message, type }
    setTimeout(() => {
        toast.value.show = false
    }, 3000)
}

function csvEscape(value) {
    const str = (value ?? '').toString()
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function exportUsers() {
    if (!filteredUsers.value.length) return

    const headers = [
        'Username',
        'Email',
        'Phone',
        'Status',
        'Role',
        'Create Date'
    ]

    const rows = filteredUsers.value.map(user => [
        user.username,
        user.email,
        user.phone,
        user.status,
        user.role,
        user.createdAt
    ])

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(csvEscape).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `users_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
}
</script>

<style scoped>
.users-page {
    padding: 20px 24px;
    background: transparent;
    min-height: calc(100vh - 64px);
    font-family: var(--font-sans);
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--muted);
}

.breadcrumb a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.breadcrumb a:hover {
    color: var(--primary-strong);
    text-decoration: underline;
}

.separator {
    color: #adb5bd;
    font-weight: bold;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 16px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.section-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
    font-family: var(--font-display);
    margin: 0;
}

.add-btn {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
    color: white;
    border: none;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 8px 16px rgba(228, 61, 64, 0.25);
}

.add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(228, 61, 64, 0.35);
}

.export-btn {
    background: var(--surface-strong);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 9px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.export-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    box-shadow: var(--shadow-soft);
    transform: translateY(-2px);
}

.tabs {
    margin-bottom: 16px;
    display: flex;
    gap: 4px;
}

.tab {
    background: transparent;
    border: none;
    padding: 8px 18px;
    font-size: 15px;
    font-weight: 600;
    color: var(--primary);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.25s ease;
}

.tab.active {
    border-bottom-color: var(--primary);
    font-weight: 700;
    background: rgba(228, 61, 64, 0.08);
    border-radius: 8px 8px 0 0;
}

.table-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    border-radius: 12px;
    box-shadow: var(--shadow-soft);
    background: var(--surface-strong);
    border: 1px solid var(--border);
}

.table-skeleton .skeleton-line {
    height: 12px;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
    min-width: 760px;
    table-layout: auto;
}

.users-table thead {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
    color: white;
}

.users-table th {
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.6px;
    white-space: nowrap;
    border-bottom: 2px solid rgba(0, 0, 0, 0.08);
}

.users-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
    color: var(--text);
    vertical-align: middle;
}

.users-table tbody tr:hover {
    background: #fff4e6;
    transition: background 0.2s ease;
}

.users-table tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.6);
}

.users-table th:nth-child(1),
.users-table td:nth-child(1),
.users-table th:nth-child(5),
.users-table td:nth-child(5),
.users-table th:nth-child(6),
.users-table td:nth-child(6),
.users-table th:nth-child(7),
.users-table td:nth-child(7) {
    text-align: center;
}

.users-table td:not(:nth-child(3)) {
    white-space: nowrap;
}

.users-table td:nth-child(3) {
    white-space: normal;
    word-break: break-word;
    line-height: 1.35;
}

.status-badge {
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 70px;
    text-align: center;
    border: 1px solid;
}

.status-badge.active {
    background: rgba(15, 118, 110, 0.12);
    color: #0f766e;
    border-color: rgba(15, 118, 110, 0.3);
}

.status-badge.inactive {
    background: rgba(228, 61, 64, 0.12);
    color: var(--primary-strong);
    border-color: rgba(228, 61, 64, 0.3);
}

.actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: flex-start;
}

.action-btn {
    background: transparent;
    border: 1px solid transparent;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    font-size: 0;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.users-table td.actions {
    white-space: nowrap;
    padding-left: 8px;
    padding-right: 8px;
}

.action-btn:hover {
    transform: translateY(-1px);
}

.action-btn.view {
    color: #0d6efd;
}

.action-btn.edit {
    color: #0f766e;
    background: rgba(15, 118, 110, 0.12);
    border-color: rgba(15, 118, 110, 0.18);
}

.action-btn.delete {
    color: var(--primary-strong);
    background: rgba(228, 61, 64, 0.12);
    border-color: rgba(228, 61, 64, 0.18);
}

.loading,
.no-data {
    text-align: center;
    padding: 64px 20px;
    color: var(--muted);
    font-size: 16px;
    font-weight: 500;
}

@media (max-width: 1024px) {
    .users-page {
        padding: 20px 24px;
    }
}

@media (max-width: 768px) {
    .users-page {
        padding: 16px;
    }

    .header-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .header-actions {
        width: 100%;
    }

    .search-input {
        min-width: 0;
        width: 100%;
    }

    .add-btn {
        width: 100%;
        justify-content: center;
    }

    .export-btn {
        width: 100%;
        justify-content: center;
    }

    .tabs {
        flex-wrap: wrap;
    }

    .table-wrapper {
        margin: 0 -16px;
        border-radius: 0;
    }

    .users-table th,
    .users-table td {
        padding: 8px 10px;
        font-size: 12px;
    }

    .action-btn {
        width: 28px;
        height: 28px;
    }

    .toast {
        right: 16px;
        left: 16px;
        min-width: 0;
    }
}

.role-badge {
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 70px;
    text-align: center;
    border: 1px solid;
}

.role-badge.admin {
    background: rgba(245, 159, 0, 0.16);
    color: #a16207;
    border-color: rgba(245, 159, 0, 0.35);
}

.role-badge.user {
    background: rgba(15, 118, 110, 0.12);
    color: #0f766e;
    border-color: rgba(15, 118, 110, 0.3);
}

.action-btn.make-admin {
    color: #f59f00;
    background: rgba(245, 159, 0, 0.15);
    border-color: rgba(245, 159, 0, 0.25);
}

.action-btn.make-admin:hover {
    background: #f59f00;
    color: #ffffff;
}

.action-btn.edit:hover {
    background: #0f766e;
    color: #ffffff;
}

.action-btn.delete:hover {
    background: var(--primary-strong);
    color: #ffffff;
}

.toast {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 1000;
    padding: 14px 24px;
    border-radius: 10px;
    color: white;
    font-weight: 500;
    box-shadow: var(--shadow-soft);
    min-width: 280px;
    animation: slideIn 0.4s ease-out;
}

.toast.success {
    background: #16a34a;
}

.toast.error {
    background: var(--primary-strong);
}

@keyframes slideIn {
    from {
        transform: translateX(120%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
