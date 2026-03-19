<template>
  <div class="dashboard-page">
    <div class="breadcrumb">
      Home <span class="arrow">></span> Dashboard <span class="arrow">></span>
    </div>

    <div class="users-section">
      <h2 class="section-title">Statistics</h2>

      <div class="cards-container">
        <div class="stat-card" data-tone="primary" @click="goToAdmins">
          <div class="card-icon-wrapper">
            <Icon name="admin" :size="32" />
          </div>
          <div class="card-bottom">
            <div class="count">{{ stats.totalAdmins }}</div>
            <div class="label">Total Admin</div>
          </div>
        </div>

        <div class="stat-card" data-tone="accent" @click="goToUsers">
          <div class="card-icon-wrapper">
            <Icon name="users" :size="32" />
          </div>
          <div class="card-bottom">
            <div class="count">{{ stats.totalUsers }}</div>
            <div class="label">Total Users</div>
          </div>
        </div>

        <div class="stat-card" data-tone="info" @click="goToProducts">
          <div class="card-icon-wrapper">
            <Icon name="products" :size="32" />
          </div>
          <div class="card-bottom">
            <div class="count">{{ stats.totalProducts }}</div>
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
import Icon from '../components/Icon.vue'

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
    const adminsRes = await api.get('/api/admins?page=1&limit=1000')
    if (adminsRes.data.success && adminsRes.data.data.admins) {
      stats.value.totalAdmins = adminsRes.data.data.admins.length
    }

    const usersRes = await api.get('/api/users?role=user&page=1&limit=1000')
    if (usersRes.data.success && usersRes.data.data.users) {
      stats.value.totalUsers = usersRes.data.data.users.length
    }

    const productsRes = await api.get('/api/products?page=1&limit=1000')
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
  background: transparent;
  min-height: 100vh;
}

.breadcrumb {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 16px;
}

.arrow {
  margin: 0 4px;
  color: var(--primary);
  font-weight: bold;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-display);
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary);
  display: inline-block;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.stat-card {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: floatIn 0.5s ease both;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow);
  border-color: rgba(228, 61, 64, 0.5);
}

.card-icon-wrapper {
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.stat-card[data-tone="primary"] .card-icon-wrapper {
  background: rgba(228, 61, 64, 0.12);
  color: var(--primary);
}

.stat-card[data-tone="accent"] .card-icon-wrapper {
  background: rgba(15, 118, 110, 0.12);
  color: var(--accent);
}

.stat-card[data-tone="info"] .card-icon-wrapper {
  background: rgba(13, 110, 253, 0.12);
  color: #0d6efd;
}

.card-bottom {
  padding: 16px 20px;
  text-align: center;
  border-top: 1px solid var(--border);
}

.count {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
  font-family: var(--font-display);
}

.label {
  font-size: 15px;
  color: var(--muted);
  font-weight: 500;
}

.stat-card:nth-child(2) {
  animation-delay: 0.05s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.1s;
}
</style>
