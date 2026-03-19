<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button
        v-if="isMobile"
        class="menu-btn"
        type="button"
        :aria-expanded="sidebarOpen"
        aria-label="Toggle navigation"
        @click="toggleSidebar"
      >
        <Icon name="menu" :size="20" />
      </button>
      <img src="/logo.png" alt="SPECIFIC" class="logo">
    </div>
    
    <div class="navbar-right">
      <button class="notification-btn" type="button" aria-label="Notifications">
        <Icon name="bell" :size="18" />
        <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
      </button>
      
      <div ref="menuRef" class="user-menu" :class="{ open: showDropdown }">
        <button
          class="user-button"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="showDropdown"
          @click="toggleDropdown"
        >
          <span class="user-icon">
            <Icon name="user" :size="18" />
          </span>
          <span class="user-name">User {{ authStore.user?.name || 'ABC' }}</span>
          <span class="arrow">
            <Icon name="chevron-down" :size="14" />
          </span>
        </button>
        
        <div v-if="showDropdown" class="dropdown" role="menu">
          <button class="dropdown-item" type="button" role="menuitem" @click="logout">
            <Icon name="logout" :size="16" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from './Icon.vue'

defineProps({
  sidebarOpen: {
    type: Boolean,
    default: true
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const router = useRouter()

const notificationCount = ref(3)
const showDropdown = ref(false)
const menuRef = ref(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const onDocumentClick = (event) => {
  if (!menuRef.value) return
  if (menuRef.value.contains(event.target)) return
  showDropdown.value = false
}

const onEscape = (event) => {
  if (event.key === 'Escape') {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onEscape)
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  height: var(--navbar-height);
  background: rgba(255, 249, 241, 0.9);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(8px);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  height: 40px;
  filter: drop-shadow(0 6px 10px rgba(31, 27, 22, 0.12));
}

.menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text);
}

.menu-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 6px 14px rgba(31, 27, 22, 0.12);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-btn {
  position: relative;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text);
}

.notification-btn:hover {
  background: #fff4e6;
  border-color: var(--primary);
  color: var(--primary);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary);
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
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
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
  background: linear-gradient(135deg, #f2555a 0%, var(--primary-strong) 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(228, 61, 64, 0.28);
}

.user-name {
  font-weight: 600;
}

.arrow {
  display: inline-flex;
  transition: transform 0.2s;
}

.user-menu.open .arrow {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-soft);
  min-width: 150px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: #333;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.2s;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #fff4e6;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }

  .user-name {
    display: none;
  }

  .user-button {
    padding: 8px 12px;
  }
}
</style>
