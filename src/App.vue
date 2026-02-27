<script setup>
import { useAuthStore } from './stores/auth';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';

const authStore = useAuthStore();

if (authStore.accessToken && authStore.userId) {
  authStore.fetchUser();
}
</script>

<template>
  <div class="app-container">
    <Navbar v-if="authStore.isAuthenticated" />
    <div class="main-content" v-if="authStore.isAuthenticated">
      <Sidebar />
      <div class="content">
        <router-view />
      </div>
    </div>
    <router-view v-else />
  </div>
</template>
<style scoped>
.app-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.main-content {
  display: flex;
}

.content {
  flex: 1;
  padding: 2rem;
}
</style>
