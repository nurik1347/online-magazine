<template>
  <div class="form-page">
    <div class="breadcrumb">
      <router-link to="/dashboard">Home</router-link>
      <span class="separator">></span>
      <span class="current">Executive > Edit</span>
    </div>

    <h2 class="page-title">Edit User</h2>

    <div v-if="loading" class="loading">Loading...</div>

    <form v-else @submit.prevent="handleUpdate" class="user-form">
      <div class="form-group">
        <label>Name :</label>
        <input v-model="form.name" type="text" required />
      </div>

      <div class="form-group">
        <label>Email Address :</label>
        <input v-model="form.email" type="email" required />
      </div>

      <div class="form-group">
        <label>Mobile Number (Login Number) :</label>
        <input v-model="form.phone" type="tel" required />
      </div>

      <div class="form-group">
        <label>Address :</label>
        <input v-model="form.address" type="text" />
      </div>

      <div class="form-group">
        <label>Remark :</label>
        <input v-model="form.remark" type="text" />
      </div>

      <div class="form-group">
        <label>Password :</label>
        <input v-model="form.password" type="password" placeholder="Yangi parol kiriting (ixtiyoriy)" />
      </div>

      <div class="form-group status-group">
        <label>Status :</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="form.status" value="active" />
            <span class="status-active">Active</span>
          </label>
          <label>
            <input type="radio" v-model="form.status" value="inactive" />
            <span class="status-inactive">Inactive</span>
          </label>
        </div>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  remark: '',
  password: '', 
  status: 'active'
})

onMounted(async () => {
  const userId = route.params.id 
  if (!userId) return router.push('/users')

  try {
    const res = await api.get(`/api/users/${userId}`)
    if (res.data.success && res.data.data) {
      const user = res.data.data
      form.value = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        remark: user.remark || '',
        status: user.status || 'active'
      }
    }
  } catch (err) {
    console.error('User yuklanmadi:', err)
  } finally {
    loading.value = false
  }
})

const handleUpdate = async () => {
  loading.value = true
  const userId = route.params.id

  try {
    const payload = { ...form.value }
    if (!payload.password) delete payload.password

    await api.put(`/api/users/${userId}`, payload)
    alert('User yangilandi!')
    router.push('/users')
  } catch (err) {
    console.error('Update xatosi:', err)
    alert('Xato: ' + (err.response?.data?.message || 'Server xatosi'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-page {
  padding: 20px 24px;
  background: transparent;
}

.breadcrumb {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 12px;
}

.breadcrumb a {
  color: var(--primary);
  text-decoration: none;
}

.separator {
  margin: 0 6px;
  color: var(--muted);
}

.current {
  color: var(--primary);
  font-weight: 500;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-display);
  margin-bottom: 24px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
  display: inline-block;
}

.user-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background: var(--surface-strong);
}

.form-group input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(228, 61, 64, 0.2);
}

.status-group {
  margin-top: 16px;
}

.radio-group {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text);
  font-size: 14px;
}

.radio-group input[type="radio"] {
  margin-right: 8px;
}

.status-active {
  color: var(--accent);
  font-weight: 600;
}

.status-inactive {
  color: var(--primary-strong);
  font-weight: 600;
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 20px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #f2555a 0%, var(--primary-strong) 100%);
}

.submit-btn:disabled {
  background: rgba(228, 61, 64, 0.5);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-page {
    padding: 16px;
  }

  .user-form {
    max-width: 100%;
  }

  .radio-group {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
