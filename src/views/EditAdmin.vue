<template>
  <DashboardLayout>
    <div class="edit-admin-page">
      <div class="breadcrumb">
        <router-link to="/dashboard">Home</router-link>
        <span class="arrow">></span>
        <router-link to="/admins">Adminlar</router-link>
        <span class="arrow">></span>
        <span class="current">Adminni tahrirlash</span>
      </div>

      <div class="page-header">
        <h2 class="page-title">Adminni Tahrirlash</h2>
        <button class="btn-back" @click="goBack">
          <i class="bi bi-arrow-left"></i> Orqaga
        </button>
      </div>

      <div v-if="loading" class="loading">Ma'lumotlar yuklanmoqda...</div>

      <div v-else-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div v-else class="edit-form-container">
        <form @submit.prevent="updateAdmin" class="admin-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="firstname">Ism</label>
            <input
              id="firstname"
              v-model="form.firstname"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="name">Familiya</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-control"
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
            />
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
                <i class="bi bi-save"></i> Saqlash
              </span>
            </button>

            <button type="button" class="btn btn-cancel" @click="goBack">
              Bekor qilish
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const adminId = route.params.id;

const form = ref({
  username: '',
  email: '',
  firstname: '',
  name: '',
  phone: '',
  status: 'active'
});

const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const res = await api.get(`/api/admins/${adminId}`);
    if (res.data.success && res.data.data) {
      const admin = res.data.data;
      form.value = {
        username: admin.username || '',
        email: admin.email || '',
        firstname: admin.firstname || '',
        name: admin.name || '',
        phone: admin.phone || '',
        status: admin.status || 'active'
      };
    } else {
      errorMessage.value = 'Admin ma\'lumotlari topilmadi';
    }
  } catch (err) {
    console.error('Admin yuklanmadi:', err);
    errorMessage.value = 'Admin ma\'lumotlarini yuklashda xatolik';
  } finally {
    loading.value = false;
  }
});

async function updateAdmin() {
  if (!form.value.username || !form.value.email || !form.value.firstname || !form.value.name) {
    alert('Majburiy maydonlarni to‘ldiring');
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
      status: form.value.status
    };

    const res = await api.put(`/api/admins/${adminId}`, payload);

    if (res.data.success) {
      alert('Admin ma\'lumotlari muvaffaqiyatli yangilandi!');
      router.push('/admins');
    } else {
      errorMessage.value = res.data.message || 'Yangilashda xatolik';
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message 
      || 'Serverda xatolik yuz berdi';
    console.error('Update xatosi:', err);
  } finally {
    submitting.value = false;
  }
}

function goToCreate() {
  router.push('/admins/create');
}

function goBack() {
  router.push('/admins');
}
</script>

<style scoped>
.edit-admin-page {
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

.loading {
  text-align: center;
  padding: 60px;
  color: #999;
}

.alert-danger {
  padding: 12px 16px;
  margin-bottom: 20px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
}

.edit-form-container {
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