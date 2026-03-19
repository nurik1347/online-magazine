<template>
  <DashboardLayout>
    <div class="create-admin-page">
      <div class="breadcrumb">
        <router-link to="/dashboard">Home</router-link>
        <span class="arrow">></span>
        <router-link to="/admins">Adminlar</router-link>
        <span class="arrow">></span>
        <span class="current">Yangi foydalanuvchi qo'shish</span>
      </div>

      <div class="page-header">
        <h2 class="page-title">Yangi Foydalanuvchi Qo'shish</h2>
        <button class="btn-back" @click="goBack">
          <i class="bi bi-arrow-left"></i> Orqaga
        </button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="createUser" class="admin-form">
        <div class="form-group">
          <label for="username">Username <span class="required">*</span></label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-control"
            placeholder="nurik1347"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email <span class="required">*</span></label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            placeholder="nurikmirzaev1747@gmail.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="firstname">Ism <span class="required">*</span></label>
          <input
            id="firstname"
            v-model="form.firstname"
            type="text"
            class="form-control"
            placeholder="Nuraziz"
            required
          />
        </div>

        <div class="form-group">
          <label for="name">Familiya <span class="required">*</span></label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            placeholder="Mirzayev"
            required
          />
        </div>
        <div class="form-group">
          <label for="phone">Telefon raqami</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="form-control"
            placeholder="+998998185003"
          />
        </div>

        <div class="form-group">
          <label for="password">Parol <span class="required">*</span></label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="Kamida 6 ta belgidan iborat"
            required
          />
        </div>

        <div class="form-group">
          <label>Rol tanlang <span class="required">*</span></label>
          <div class="role-options">
            <label class="radio-label">
              <input
                type="radio"
                v-model="form.role"
                value="admin"
                name="role"
                required
              />
              <span>Admin</span>
              <small>(Adminlar ro'yxatiga qo'shiladi)</small>
            </label>

            <label class="radio-label">
              <input
                type="radio"
                v-model="form.role"
                value="user"
                name="role"
              />
              <span>User</span>
              <small>(Oddiy foydalanuvchilar ro'yxatiga qo'shiladi)</small>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="form.status" class="form-control">
            <option value="active">Faol</option>
            <option value="inactive">Faol emas</option>
          </select>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-save"
            :disabled="submitting"
          >
            <span v-if="submitting">Saqlanmoqda...</span>
            <span v-else>
              <i class="bi bi-person-plus"></i> Qo'shish
            </span>
          </button>

          <button type="button" class="btn btn-cancel" @click="goBack">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
// import DashboardLayout from '@/layouts/DashboardLayout.vue';

const router = useRouter();

const form = ref({
  username: '',
  email: '',
  firstname: '',
  name: '',
  phone: '',
  password: '',
  role: 'admin', 
  status: 'active'
});

const submitting = ref(false);
const errorMessage = ref('');

async function createUser() {
  if (!form.value.username || !form.value.email || !form.value.firstname ||
      !form.value.name || !form.value.password || !form.value.role) {
    alert('Majburiy maydonlarni to‘ldiring: Username, Email, Ism, Familiya, Parol, Rol');
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      username: form.value.username.trim(),
      email: form.value.email.trim(),
      firstname: form.value.firstname.trim(),
      name: form.value.name.trim(),
      phone: form.value.phone.trim() || undefined,
      password: form.value.password,
      status: form.value.status,
      role: form.value.role
    };

    let endpoint = '/api/admins';
    if (form.value.role === 'user') {
      endpoint = '/api/users';
    }

    const res = await api.post(endpoint, payload);

    if (res.data.success) {
      alert(`Yangi ${form.value.role.toUpperCase()} muvaffaqiyatli qo'shildi!`);
      router.push('/admins'); 
    } else {
      errorMessage.value = res.data.message || 'Foydalanuvchi qo‘shishda xatolik';
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message 
      || err.response?.data?.error 
      || err.message 
      || 'Serverda xatolik yuz berdi';
    console.error('Qo‘shish xatosi:', err);
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push('/admins');
}
</script>

<style scoped>
.create-admin-page {
  padding: 24px 32px;
  background: transparent;
  min-height: calc(100vh - var(--navbar-height));
}

.breadcrumb {
  font-size: 13px;
  margin-bottom: 20px;
}

.breadcrumb a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.arrow {
  margin: 0 8px;
  color: var(--primary);
  font-weight: bold;
}

.current {
  color: var(--text);
  font-weight: 500;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-display);
  margin: 0;
}

.btn-back {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #fff4e6;
  border-color: var(--primary);
}

.alert-danger {
  padding: 12px 16px;
  margin-bottom: 20px;
  background: rgba(228, 61, 64, 0.12);
  color: var(--primary-strong);
  border: 1px solid rgba(228, 61, 64, 0.3);
  border-radius: 6px;
}

.admin-form {
  background: var(--surface-strong);
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}

.required {
  color: var(--primary);
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(228, 61, 64, 0.15);
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: var(--text);
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.radio-label small {
  color: var(--muted);
  font-size: 13px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.btn-save {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: linear-gradient(135deg, #f2555a 0%, var(--primary-strong) 100%);
  transform: translateY(-1px);
}

.btn-cancel {
  background: #6b6b6b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #5a5a5a;
}
</style>
