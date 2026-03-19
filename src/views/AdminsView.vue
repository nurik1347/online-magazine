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
              <th>ROLE</th>
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
                <span :class="['role-badge', admin.role?.toLowerCase()]">
                  {{ admin.role || 'Unknown' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="edit-btn" title="Edit" @click="editAdmin(admin.id)">
                    <span>✏️</span>
                  </button>
                  <button class="delete-btn" title="Delete" @click="openDeleteModal(admin.id)">
                    <span>🗑️</span>
                  </button>

                  <button
                    v-if="admin.role?.toLowerCase() === 'admin'"
                    class="action-btn make-user"
                    title="Make User"
                    @click="makeUser(admin.id)"
                  >
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
      </div>

      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.message }}
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

const showDeleteModal = ref(false);
const selectedAdminId = ref(null);

const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

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
  return `${year}-${month}-${day} ${hours}:${minutes}`;
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
      showToast('Admin muvaffaqiyatli o‘chirildi!', 'success');
    } else {
      showToast(res.data.message || 'O‘chirishda xatolik', 'error');
    }
  } catch (err) {
    console.error('Delete admin xatosi:', err);
    showToast(err.response?.data?.message || 'Serverda xatolik', 'error');
  } finally {
    closeDeleteModal();
  }
}

function editAdmin(adminId) {
  router.push(`/admins/${adminId}/edit`);
}

async function makeUser(adminId) {
  if (!confirm('Ushbu adminni oddiy userga aylantirmoqchimisiz?')) return;

  try {
    const res = await api.put(`/api/admins/${adminId}`, {
      role: 'user' 
    });

    if (res.data.success) {
      const adminIndex = admins.value.findIndex(a => a.id === adminId);
      if (adminIndex !== -1) {
        admins.value[adminIndex].role = 'user';
      }
      showToast('Admin oddiy userga aylantirildi!', 'success');
    } else {
      showToast(res.data.message || 'Aylantirishda xatolik', 'error');
    }
  } catch (err) {
    console.error('Make user xatosi:', err);
    showToast(err.response?.data?.message || 'Serverda xatolik', 'error');
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}
</script>
<style scoped>
.role-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
  min-width: 90px;
  text-align: center;
  border: 1px solid;
}

.role-badge.admin {
  background: rgba(245, 159, 0, 0.16);
  color: #a16207;
  border-color: rgba(245, 159, 0, 0.35);
}

.role-badge.user {
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  border-color: rgba(15, 118, 110, 0.3);
}

/* Make User tugmasi */
.action-btn.make-user {
  color: #0f766e;
  font-size: 20px;
}

.action-btn.make-user:hover {
  transform: scale(1.35);
  color: #0d6b63;
}

/* Toast */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  padding: 14px 24px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  box-shadow: var(--shadow-soft);
  min-width: 280px;
  animation: slideIn 0.4s ease-out;
}

.toast.success {
  background: #16a34a;
}

.toast.error {
  background: var(--primary-strong);
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
  background: var(--surface-strong);
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow);
  text-align: center;
  border: 1px solid var(--border);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text);
}

.modal-text {
  font-size: 1rem;
  color: var(--muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-cancel {
  background: #6b6b6b;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #5a5a5a;
}

.btn-delete {
  background: var(--primary-strong);
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
  box-shadow: var(--shadow-soft);
  min-width: 280px;
  max-width: 400px;
  animation: slideIn 0.4s ease-out;
  transition: opacity 0.4s ease;
}

.toast.success {
  background: #16a34a;
}

.toast.error {
  background: var(--primary-strong);
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
  color: var(--primary-strong);
}

.delete-btn:hover {
  transform: scale(1.3);
  color: var(--primary);
}

.admins-page {
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
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-display);
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
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
  background: linear-gradient(135deg, #f2555a 0%, var(--primary-strong) 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(228, 61, 64, 0.28);
}

.plus {
  font-size: 18px;
  font-weight: bold;
}

.tabs {
  margin-bottom: 16px;
}

.tab {
  background: var(--surface-strong);
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--primary);
  border-bottom: 3px solid transparent;
}

.tab.active {
  border-bottom-color: var(--primary);
}

.loading,
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
  background: var(--surface-strong);
  border-radius: 8px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.table-container {
  background: var(--surface-strong);
  border-radius: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
}

.admins-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.admins-table thead {
  background: #fff4e6;
  border-bottom: 2px solid var(--border);
}

.admins-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admins-table tbody tr {
  border-bottom: 1px dotted #ccc;
  transition: background 0.2s;
}

.admins-table tbody tr:hover {
  background: #fff4e6;
}

.admins-table tbody tr:last-child {
  border-bottom: 2px solid #0066cc;
}

.admins-table td {
  padding: 16px;
  font-size: 13px;
  color: var(--text);
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
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  border: 1px solid rgba(15, 118, 110, 0.3);
}

.status-badge.inactive {
  background: rgba(228, 61, 64, 0.12);
  color: var(--primary-strong);
  border: 1px solid rgba(228, 61, 64, 0.3);
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
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
  color: var(--primary);
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

@media (max-width: 768px) {
  .admins-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    margin: 0 -16px;
    border-radius: 0;
  }

  .admins-table th,
  .admins-table td {
    padding: 10px 12px;
    font-size: 12px;
  }

  .toast {
    right: 16px;
    left: 16px;
    min-width: 0;
  }

  .modal {
    margin: 0 16px;
    padding: 24px;
  }
}
</style>
