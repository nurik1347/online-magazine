<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="/logo.png" alt="SPECIFIC" class="logo">
    </div>
    
    <div class="navbar-right">
      <button class="notification-btn">
        <span class="bell-icon">🔔</span>
        <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
      </button>
      
      <div class="user-menu" @click="toggleDropdown">
        <div class="user-button">
          <span class="user-icon">👤</span>
          <span class="user-name">User {{ authStore.user?.name || 'ABC' }}</span>
          <span class="arrow">▼</span>
        </div>
        
        <div v-if="showDropdown" class="dropdown">
          <a href="#" class="dropdown-item" @click.prevent="logout">
            <span class="logout-icon">🚪</span> Logout
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const notificationCount = ref(3)
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  height: 60px;
  background: white;
  border-bottom: 2px solid #e63946;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-btn {
  position: relative;
  background: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-btn:hover {
  background: #f5f5f5;
  border-color: #e63946;
}

.bell-icon {
  font-size: 18px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #e63946;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e63946;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
  font-weight: 500;
}

.user-button:hover {
  background: #d00000;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(230, 57, 70, 0.2);
}

.user-icon {
  font-size: 16px;
}

.user-name {
  font-weight: 600;
}

.arrow {
  font-size: 10px;
  transition: transform 0.2s;
}

.dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 150px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.logout-icon {
  font-size: 16px;
}
</style>