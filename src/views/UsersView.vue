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
            <button class="add-btn" @click="goToAdd">+ Add</button>
        </div>

        <div class="tabs">
            <button class="tab active">
                All ({{ users.length }})
            </button>
        </div>

        <div class="table-wrapper">
            <table class="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>USERNAME</th>
                        <th>EMAIL</th>
                        <th>ADDRESS</th>
                        <th>REMARK</th>
                        <th>PHONE</th>
                        <th>ACTIVE BY</th>
                        <th>STATUS</th>
                        <th>CREATE DATE</th>
                        <th>UPDATE DATE</th>
                        <th>MODIFY</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in users" :key="user.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.address || '-' }}</td>
                        <td>{{ user.remark || '-' }}</td>
                        <td>{{ user.phone }}</td>
                        <td>{{ user.activeBy || '-' }}</td>
                        <td>
                            <span :class="['status-badge', user.status?.toLowerCase()]">
                                {{ user.status || 'Unknown' }}
                            </span>
                        </td>
                        <td>{{ formatDate(user.createdAt) }}</td>
                        <td>{{ formatDate(user.updatedAt) }}</td>
                        <td class="actions">
                            <button class="action-btn view" title="View">📖</button>
                            <button class="action-btn edit" title="Edit" @click=goToEdit(user.id)>✏️</button>
                            <button class="action-btn delete" title="Delete">🗑️</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="loading" class="loading">Loading users...</div>
        <div v-if="!loading && users.length === 0" class="no-data">No users found</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const users = ref([])
const loading = ref(true)

onMounted(async () => {
    try {
        const res = await api.get('/api/users?page=1&limit=50')

        if (res.data.success && res.data.data?.users) {
            users.value = res.data.data.users.filter(u =>
                u.role?.toLowerCase() === 'executive' || u.role === 'user'
            )
        }
    } catch (err) {
        console.error('Users yuklanmadi:', err)
    } finally {
        loading.value = false
    }
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
</script>

<style scoped>
.users-page {
    padding: 20px 24px;
    background: #ffffff;
}

.breadcrumb {
    font-size: 13px;
    color: #666666;
    margin-bottom: 12px;
}

.breadcrumb a {
    color: #e63946;
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

.separator {
    margin: 0 6px;
    color: #999;
}

.current {
    color: #e63946;
    font-weight: 500;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    margin: 0;
}

.add-btn {
    background: #003d7a;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
}

.add-btn:hover {
    background: #002a54;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 61, 122, 0.2);
}

.filter-info {
    font-size: 14px;
    color: #444;
    margin-bottom: 16px;
    font-weight: 500;
}

.table-wrapper {
    overflow-x: auto;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    background: white;
}

.users-table thead {
    background: #e63946;
    color: white;
}

.users-table th {
    padding: 10px 12px;
    font-weight: 600;
    text-align: left;
    border-bottom: 2px solid #c62828;
    white-space: nowrap;
}

.users-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
}

.users-table tbody tr:hover {
    background: #f9f9f9;
}
.tabs {
  margin-bottom: 16px;
}

.tab {
  background: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #e63946;
  border-bottom: 3px solid transparent;
}

.tab.active {
  border-bottom-color: #e63946;
}

.status-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
    min-width: 60px;
    text-align: center;
}

.status-badge.active,
.status-badge.actve {
    /* typo uchun */
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.actions {
    white-space: nowrap;
}

.action-btn {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    margin: 0 4px;
    padding: 4px;
}

.action-btn.view {
    color: #007bff;
}

.action-btn.edit {
    color: #28a745;
}

.action-btn.delete {
    color: #dc3545;
}

.action-btn:hover {
    opacity: 0.7;
}

.loading,
.no-data {
    text-align: center;
    padding: 60px 0;
    color: #777;
    font-size: 16px;
}
</style>