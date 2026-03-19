<template>
  <div
    v-if="isMobile"
    class="sidebar-backdrop"
    :class="{ open }"
    @click="closeSidebar"
  ></div>
  <aside class="sidebar" :class="{ 'is-open': open, 'is-mobile': isMobile }" aria-label="Primary">
    <nav>
      <ul>
        <li class="section-title">Main</li>
        <li>
          <router-link to="/dashboard" class="link" @click="handleNavigate">
            <span class="nav-icon">
              <Icon name="dashboard" :size="18" />
            </span>
            <span>Dashboard</span>
          </router-link>
        </li>

        <li class="section-title">User Details</li>
        <li>
          <router-link to="/admins" class="link" @click="handleNavigate">
            <span class="nav-icon">
              <Icon name="admin" :size="18" />
            </span>
            <span>Admin</span>
            <span v-if="adminCount > 0" class="count-badge admin">{{ adminCount }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/users" class="link" @click="handleNavigate">
            <span class="nav-icon">
              <Icon name="users" :size="18" />
            </span>
            <span>Executive</span>
            <span v-if="userCount > 0" class="count-badge executive">{{ userCount }}</span>
          </router-link>
        </li>

        <li class="section-title">Inventory</li>
        <li>
          <router-link to="/products" class="link" @click="handleNavigate">
            <span class="nav-icon">
              <Icon name="products" :size="18" />
            </span>
            <span>Products</span>
          </router-link>
        </li>
        <li>
          <router-link to="/categories" class="link" @click="handleNavigate">
            <span class="nav-icon">
              <Icon name="categories" :size="18" />
            </span>
            <span>Categories</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'
import Icon from './Icon.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: true
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const adminCount = ref(0)
const userCount = ref(0)

const closeSidebar = () => {
  emit('close')
}

const handleNavigate = () => {
  if (props.isMobile) {
    emit('close')
  }
}

onMounted(async () => {
  try {
    const adminsRes = await api.get('/api/admins?page=1&limit=1000')
    if (adminsRes.data.success && adminsRes.data.data.admins) {
      adminCount.value = adminsRes.data.data.admins.length
    }

    const usersRes = await api.get('/api/users?role=user&page=1&limit=1000')
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
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 28px 24px;
  min-height: calc(100vh - var(--navbar-height));
  position: sticky;
  top: var(--navbar-height);
  overflow-y: auto;
  width: var(--sidebar-width);
  flex: 0 0 var(--sidebar-width);
  box-sizing: border-box;
  box-shadow: var(--shadow-soft);
  transition: transform 0.25s ease;
  z-index: 200;
}

.sidebar.is-mobile {
  position: fixed;
  left: 0;
  top: var(--navbar-height);
  height: calc(100vh - var(--navbar-height));
  transform: translateX(-100%);
  border-right: none;
  box-shadow: var(--shadow);
}

.sidebar.is-mobile.is-open {
  transform: translateX(0);
}

.sidebar-backdrop {
  position: fixed;
  inset: var(--navbar-height) 0 0 0;
  background: rgba(15, 13, 10, 0.38);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 150;
}

.sidebar-backdrop.open {
  opacity: 1;
  pointer-events: auto;
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
  color: var(--muted);
  text-transform: uppercase;
  padding: 12px 16px 8px;
  letter-spacing: 0.5px;
}

.link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: var(--text);
  text-decoration: none;
  transition: all 0.2s;
  margin: 2px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  position: relative;
}

.link::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 3px;
  background: transparent;
}

.link:hover {
  background: #fff4e6;
  color: var(--text);
}

.link.router-link-active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
}

.link.router-link-active::before {
  background: rgba(255, 255, 255, 0.85);
}

.link.router-link-active .count-badge {
  background: white;
  color: var(--primary);
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
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
  background: var(--primary);
  color: white;
}

.count-badge.executive {
  background: var(--accent);
  color: white;
}
</style>
