<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li class="section-title">Main</li>
        <li>
          <router-link to="/dashboard" class="link">
            <span class="icon">📊</span>
            <span>Dashboard</span>
          </router-link>
        </li>

        <li class="section-title">User Details</li>
        <li>
          <router-link to="/admins" class="link">
            <span class="icon">👤</span>
            <span>Admin</span>
            <span v-if="adminCount > 0" class="count-badge admin">{{ adminCount }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/users" class="link">
            <span class="icon">👤</span>
            <span>Executive</span>
            <span v-if="userCount > 0" class="count-badge executive">{{ userCount }}</span>
          </router-link>
        </li>

        <li class="section-title">Inventory</li>
        <li>
          <router-link to="/products" class="link">
            <span class="icon">📦</span>
            <span>Products</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const adminCount = ref(0)
const userCount = ref(0)

onMounted(async () => {
  try {
    const adminsRes = await api.get('/api/admins')
    if (adminsRes.data.success && adminsRes.data.data.admins) {
      adminCount.value = adminsRes.data.data.admins.length
    }

    const usersRes = await api.get('/api/users?role=user')
    if (usersRes.data.success && usersRes.data.data.users) {
      userCount.value = usersRes.data.data.users.length
    }
  } catch (err) {
    console.error('Sidebar counts yuklanmadi:', err)
  }
})
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 16px 0;
  min-height: calc(100vh - 60px);
  position: sticky;
  top: 60px;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin: 0;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  padding: 12px 16px 8px;
  letter-spacing: 0.5px;
}

.link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: #555;
  text-decoration: none;
  transition: all 0.2s;
  margin: 2px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  position: relative;
}

.link:hover {
  background: #f8f9fa;
  color: #333;
}

.link.router-link-active {
  background: #e63946;
  color: white;
}

.link.router-link-active .count-badge {
  background: white;
  color: #e63946;
}

.icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.count-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.count-badge.admin {
  background: #e63946;
  color: white;
}

.count-badge.executive {
  background: #2e7d32;
  color: white;
}
</style>