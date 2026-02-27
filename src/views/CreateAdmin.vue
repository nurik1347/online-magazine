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
        <!-- Username -->
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

        <!-- Email -->
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

        <!-- Firstname -->
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

        <!-- Name (Familiya) -->
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

        <!-- Phone -->
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

        <!-- Password -->
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

        <!-- Role tanlash -->
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

        <!-- Status -->
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="form.status" class="form-control">
            <option value="active">Faol</option>
            <option value="inactive">Faol emas</option>
          </select>
        </div>

        <!-- Tugmalar -->
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
// import DashboardLayout from '@/layouts/DashboardLayout.vue'; // ← yo‘lingizga moslashtiring

const router = useRouter();

const form = ref({
  username: '',
  email: '',
  firstname: '',
  name: '',
  phone: '',
  password: '',
  role: 'admin', // default qiymat
  status: 'active'
});

const submitting = ref(false);
const errorMessage = ref('');

async function createUser() {
  // Majburiy maydonlarni tekshirish
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
      role: form.value.role // "admin" yoki "user"
    };

    // Rolga qarab endpoint tanlash
    let endpoint = '/api/admins';
    if (form.value.role === 'user') {
      endpoint = '/api/users';
    }

    const res = await api.post(endpoint, payload);

    if (res.data.success) {
      alert(`Yangi ${form.value.role.toUpperCase()} muvaffaqiyatli qo'shildi!`);
      router.push('/admins'); // yoki kerak bo'lsa /users ga o'tkazish mumkin
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
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.breadcrumb {
  font-size: 13px;
  margin-bottom: 20px;
}

.breadcrumb a {
  color: #e63946;
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.arrow {
  margin: 0 8px;
  color: #333;
  font-weight: bold;
}

.current {
  color: #333;
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
  color: #333;
  margin: 0;
}

.btn-back {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
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
  background: #e9ecef;
  border-color: #adb5bd;
}

.alert-danger {
  padding: 12px 16px;
  margin-bottom: 20px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
}

.admin-form {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.required {
  color: #e63946;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #e63946;
  outline: none;
  box-shadow: 0 0 0 3px rgba(230,57,70,0.15);
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
  color: #333;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #e63946;
}

.radio-label small {
  color: #6c757d;
  font-size: 13px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.btn-save {
  background: #e63946;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #5a6268;
}
</style>