<template>
  <DashboardLayout>
    <div class="admins-page">
      <div class="breadcrumb">
        <router-link to="/dashboard">Home</router-link>
        <span class="arrow">></span>
        <span class="current">Admin</span>
        <span class="arrow">></span>
      </div>

      <div class="page-header">
        <h2 class="page-title">Users</h2>
        <button class="add-btn" @click="goToCreate">
          <span class="plus">+</span> Add New
        </button>
      </div>

      <div class="tabs">
        <button class="tab active">
          All ({{ admins.length }})
        </button>
      </div>

      <div v-if="loading" class="loading">Loading...</div>

      <div v-else-if="admins.length === 0" class="no-data">No admins found</div>

      <div v-else class="table-container">
        <table class="admins-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USERNAME</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>STATUS</th>
              <th>CREATE DATE</th>
              <th>UPDATE DATE</th>
              <th>MODIFY</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(admin, index) in admins" :key="admin.id">
              <td>{{ index + 1 }}</td>
              <td>{{ admin.username }}</td>
              <td>{{ admin.email }}</td>
              <td>{{ admin.phone }}</td>
              <td>
                <span :class="['status-badge', admin.status]">
                  {{ admin.status }}
                </span>
              </td>
              <td>{{ formatDate(admin.createdAt) }}</td>
              <td>{{ formatDate(admin.updatedAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-btn" title="Edit" @click="editAdmin(admin.id)">
                    <span>✏️</span>
                  </button>
                  <button class="delete-btn" title="Delete" @click="openDeleteModal(admin.id)">
                    <span>🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
          <h3 class="modal-title">Confirm Delete</h3>
          <p class="modal-text">
            Are you sure you want to delete this Admin permanently?<br>
            You can't undo this action.
          </p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeDeleteModal">
              CANCEL
            </button>
            <button class="btn-delete" @click="confirmDelete">
              DELETE
            </button>
          </div>
        </div>
        <div v-if="toast.show" :class="['toast', toast.type]">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const admins = ref([]);
const loading = ref(true);
const router = useRouter();
const toast = ref({
  show: true,
  message: '',
  type: 'success'
});

const showDeleteModal = ref(false);
const selectedAdminId = ref(null);

onMounted(async () => {
  try {
    const res = await api.get('/api/admins');
    if (res.data.success && res.data.data?.admins) {
      admins.value = res.data.data.admins;
    }
  } catch (err) {
    console.error('Admins yuklanmadi:', err);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}\n${hours}:${minutes} AM`;
};

function goToCreate() {
  router.push('/admins/create');
}

function openDeleteModal(adminId) {
  selectedAdminId.value = adminId;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  selectedAdminId.value = null;
}

async function confirmDelete() {
  if (!selectedAdminId.value) return;

  try {
    const res = await api.delete(`/api/admins/${selectedAdminId.value}`);

    if (res.data.success) {
      admins.value = admins.value.filter(admin => admin.id !== selectedAdminId.value);
      alert('Admin muvaffaqiyatli o‘chirildi!');
    } else {
      alert(res.data.message || 'O‘chirishda xatolik yuz berdi');
    }
  } catch (err) {
    console.error('Delete admin xatosi:', err);
    alert(err.response?.data?.message || 'Serverda xatolik yuz berdi');
  } finally {
    closeDeleteModal();
  }
}


function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };

  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

function editAdmin(adminId) {
  router.push(`/admins/${adminId}/edit`);
}
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #212529;
}

.modal-text {
  font-size: 1rem;
  color: #495057;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 14px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  min-width: 280px;
  max-width: 400px;
  animation: slideIn 0.4s ease-out;
  transition: opacity 0.4s ease;
}

.toast.success {
  background: #28a745;
}

.toast.error {
  background: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  font-size: 18px;
  transition: transform 0.2s, color 0.2s;
  color: #dc3545;
}

.delete-btn:hover {
  transform: scale(1.3);
  color: #c82333;
}

.admins-page {
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
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.add-btn {
  background: #003d7a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #002a54;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 61, 122, 0.2);
}

.plus {
  font-size: 18px;
  font-weight: bold;
}

.tabs {
  margin-bottom: 16px;
}

.tab {
  background: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #e63946;
  border-bottom: 3px solid transparent;
}

.tab.active {
  border-bottom-color: #e63946;
}

.loading,
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: white;
  border-radius: 8px;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.admins-table {
  width: 100%;
  border-collapse: collapse;
}

.admins-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
}

.admins-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admins-table tbody tr {
  border-bottom: 1px dotted #ccc;
  transition: background 0.2s;
}

.admins-table tbody tr:hover {
  background: #f8f9fa;
}

.admins-table tbody tr:last-child {
  border-bottom: 2px solid #0066cc;
}

.admins-table td {
  padding: 16px;
  font-size: 13px;
  color: #333;
  vertical-align: middle;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.edit-btn,
.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  font-size: 18px;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  transform: scale(1.2);
}

.delete-btn {
  color: #e63946;
}

.delete-btn:hover {
  transform: scale(1.2);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.page-info {
  font-size: 13px;
  color: #666;
}

.page-buttons {
  display: flex;
  gap: 8px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover {
  border-color: #e63946;
  color: #e63946;
}

.page-btn.active {
  background: #e63946;
  color: white;
  border-color: #e63946;
}

.page-btn.next {
  font-size: 16px;
}
</style>