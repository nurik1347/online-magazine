<template>
  <div class="form-page">
    <div class="breadcrumb">
      <router-link to="/dashboard">Home</router-link>
      <span class="separator">></span>
      <span class="current">Executive > Add</span>
    </div>

    <h2 class="page-title">Add New Executive</h2>

    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label>Executive Name :</label>
        <input v-model="form.name" type="text" placeholder="Enter name" required />
      </div>

      <div class="form-group">
        <label>Email Address :</label>
        <input v-model="form.email" type="email" placeholder="Enter email" required />
      </div>

      <div class="form-group">
        <label>Mobile Number (Login Number) :</label>
        <input v-model="form.phone" type="tel" placeholder="Enter phone number" required />
      </div>

      <div class="form-group">
        <label>Address :</label>
        <input v-model="form.address" type="text" placeholder="Enter address" />
      </div>

      <div class="form-group">
        <label>Remark :</label>
        <input v-model="form.remark" type="text" placeholder="Enter remark" />
      </div>

      <div class="form-group">
        <label>Password :</label>
        <input v-model="form.password" type="password" placeholder="Enter password" required />
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
        {{ loading ? 'Saving...' : 'Save' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  remark: '',
  password: '',
  role: 'user',          
  status: 'active'
})

const handleSubmit = async () => {
  loading.value = true

  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      username: form.value.email.split('@')[0], 
      password: form.value.password,
      role: form.value.role,
      status: form.value.status,
      address: form.value.address,
      remark: form.value.remark
    }

    await api.post('/api/users', payload)
    alert('User muvaffaqiyatli qo‘shildi!')
    router.push('/users')
  } catch (err) {
    console.error('Add user xatosi:', err)
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
