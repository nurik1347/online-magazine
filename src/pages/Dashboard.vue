<template>
  <div class="dashboard-page">
    <div class="breadcrumb">
      Home <span class="arrow">></span> Dashboard <span class="arrow">></span>
    </div>

    <div class="users-section">
      <h2 class="section-title">Statistics</h2>

      <div class="cards-container">
        <div class="stat-card" @click="goToAdmins">
          <div class="card-icon-wrapper red">
            <div class="card-icon">👤</div>
          </div>
          <div class="card-bottom">
            <div class="count red-text">{{ stats.totalAdmins }}</div>
            <div class="label">Total Admin</div>
          </div>
        </div>

        <div class="stat-card" @click="goToUsers">
          <div class="card-icon-wrapper green">
            <div class="card-icon">👤</div>
          </div>
          <div class="card-bottom">
            <div class="count green-text">{{ stats.totalUsers }}</div>
            <div class="label">Total Users</div>
          </div>
        </div>

        <div class="stat-card" @click="goToProducts">
          <div class="card-icon-wrapper blue">
            <div class="card-icon">📦</div>
          </div>
          <div class="card-bottom">
            <div class="count blue-text">{{ stats.totalProducts }}</div>
            <div class="label">Total Products</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const stats = ref({
  totalAdmins: 0,
  totalUsers: 0,
  totalProducts: 0
})

onMounted(async () => {
  await fetchStats()
})

const fetchStats = async () => {
  try {
    const adminsRes = await api.get('/api/admins')
    console.log('Admins API:', adminsRes.data)
    
    if (adminsRes.data.success && adminsRes.data.data.admins) {
      stats.value.totalAdmins = adminsRes.data.data.admins.length
    }

    const usersRes = await api.get('/api/users?role=user')
    console.log('Users API:', usersRes.data)
    
    if (usersRes.data.success && usersRes.data.data.users) {
      stats.value.totalUsers = usersRes.data.data.users.length
    }

    const productsRes = await api.get('/api/products')
    console.log('Products API:', productsRes.data)
    
    if (productsRes.data.success && productsRes.data.data.products) {
      stats.value.totalProducts = productsRes.data.data.products.length
    }

  } catch (err) {
    console.error('Dashboard stats yuklanmadi:', err)
  }
}

const goToAdmins = () => {
  router.push('/admins')
}

const goToUsers = () => {
  router.push('/users')
}

const goToProducts = () => {
  router.push('/products')
}
</script>

<style scoped>
.dashboard-page {
  padding: 20px 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.arrow {
  margin: 0 4px;
  color: #e63946;
  font-weight: bold;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e63946;
  display: inline-block;
}

.cards-container {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-card {
  width: 260px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #e63946;
}

.card-icon-wrapper {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-wrapper.red {
  background: #ffebee;
}

.card-icon-wrapper.green {
  background: #e8f5e9;
}

.card-icon-wrapper.blue {
  background: #e3f2fd;
}

.card-icon {
  font-size: 64px;
  line-height: 1;
}

.card-bottom {
  padding: 16px 20px;
  text-align: center;
  border-top: 1px solid #eee;
}

.count {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.red-text {
  color: #e63946;
}

.green-text {
  color: #2e7d32;
}

.blue-text {
  color: #1976d2;
}

.label {
  font-size: 15px;
  color: #555;
  font-weight: 500;
}
</style>