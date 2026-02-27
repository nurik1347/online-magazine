<template>
  <div class="form-page">
    <!-- Breadcrumb -->
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
  role: 'user',          // executive uchun 'user' yoki backendda executive role bo'lsa o'zgartiring
  status: 'active'
})

const handleSubmit = async () => {
  loading.value = true

  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      username: form.value.email.split('@')[0], // yoki alohida username maydoni qo'shsa bo'ladi
      password: form.value.password,
      role: form.value.role,
      status: form.value.status,
      address: form.value.address,
      remark: form.value.remark
    }

    await api.post('/api/users', payload)
    alert('User muvaffaqiyatli qo‘shildi!')
    router.push('/users') // yoki /executive ga
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
  background: #fff;
}

.breadcrumb {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.breadcrumb a {
  color: #e63946;
  text-decoration: none;
}

.separator {
  margin: 0 6px;
  color: #999;
}

.current {
  color: #e63946;
  font-weight: 500;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  border-bottom: 2px solid #e63946;
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
  color: #e63946;
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  border-color: #e63946;
  outline: none;
  box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.2);
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
  color: #333;
  font-size: 14px;
}

.radio-group input[type="radio"] {
  margin-right: 8px;
}

.status-active {
  color: #2e7d32;
  font-weight: 600;
}

.status-inactive {
  color: #d32f2f;
  font-weight: 600;
}

.submit-btn {
  background: #e63946;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 20px;
}

.submit-btn:hover {
  background: #c62828;
}

.submit-btn:disabled {
  background: #f48c96;
  cursor: not-allowed;
}
</style>