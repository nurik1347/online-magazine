<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import Icon from './components/Icon.vue'

const authStore = useAuthStore()
const initialMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false
const isMobile = ref(initialMobile)
const sidebarOpen = ref(!initialMobile)
const showBackToTop = ref(false)

if (authStore.accessToken && authStore.userId) {
  authStore.fetchUser()
}

const syncLayout = () => {
  const mobile = window.innerWidth < 1024
  if (mobile !== isMobile.value) {
    isMobile.value = mobile
    sidebarOpen.value = !mobile
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const onScroll = () => {
  showBackToTop.value = window.scrollY > 320
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  syncLayout()
  window.addEventListener('resize', syncLayout)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncLayout)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="app-container">
    <Navbar
      v-if="authStore.isAuthenticated"
      :sidebar-open="sidebarOpen"
      :is-mobile="isMobile"
      @toggle-sidebar="toggleSidebar"
    />
    <div class="main-content" v-if="authStore.isAuthenticated">
      <Sidebar :open="sidebarOpen" :is-mobile="isMobile" @close="closeSidebar" />
      <div class="content">
        <router-view />
      </div>
    </div>
    <router-view v-else />
    <button v-show="showBackToTop" class="back-to-top" @click="scrollToTop" aria-label="Back to top">
      <Icon name="arrow-up" :size="18" />
    </button>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: transparent;
}

.main-content {
  display: flex;
  align-items: stretch;
  position: relative;
}

.content {
  flex: 1;
  padding: 1.75rem 2rem;
  box-sizing: border-box;
  min-width: 0;
}

@media (max-width: 1024px) {
  .main-content {
    display: block;
  }

  .content {
    padding: 1.5rem 1.25rem;
  }
}
</style>
