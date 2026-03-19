<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const form = ref({
  title: '',
  description: '',
  price: null,
  oldPrice: null,
  currency: 'USD',
  categoryId: '',
  brand: ''
});

const categories = ref([]);
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const res = await api.get('/api/categories');
    
    if (res.data.success && res.data.data?.categories) {
      categories.value = res.data.data.categories;
    } else {
      console.warn('Kategoriyalar topilmadi yoki format noto‘g‘ri');
      errorMessage.value = 'Kategoriyalar ro‘yxati bo‘sh yoki noto‘g‘ri formatda';
    }
  } catch (err) {
    console.error('Kategoriyalar yuklanmadi:', err);
    errorMessage.value = 'Kategoriyalarni yuklashda xatolik yuz berdi';
  }
});

async function submitProduct() {
  if (!form.value.title || !form.value.price || !form.value.categoryId) {
    alert('Majburiy maydonlarni to‘ldiring: Sarlavha, Narx, Kategoriya');
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      price: Number(form.value.price),
      oldPrice: form.value.oldPrice ? Number(form.value.oldPrice) : null,
      currency: form.value.currency,
      categoryId: form.value.categoryId,
      brand: form.value.brand.trim() || undefined
    };

    const res = await api.post('/api/products', payload);

    if (res.data.success) {
      alert('Yangi mahsulot muvaffaqiyatli qo‘shildi!');
      router.push('/products');
    } else {
      errorMessage.value = res.data.message || 'Mahsulot qo‘shishda xatolik';
    }
  } catch (err) {
    console.error('Mahsulot qo‘shish xatosi:', err);
    errorMessage.value = err.response?.data?.message 
      || 'Serverda xatolik yuz berdi. Qayta urinib ko‘ring.';
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push('/products');
}
</script>


<template>
  <div class="add-product-container">
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">Home</router-link>
      <i class="bi bi-chevron-right"></i>
      <router-link to="/products" class="breadcrumb-link">Mahsulotlar</router-link>
      <i class="bi bi-chevron-right"></i>
      <span class="breadcrumb-current">Yangi mahsulot</span>
    </div>

    <div class="page-header">
      <h1 class="page-title">Yangi Mahsulot Qo‘shish</h1>
      <button class="btn-back" @click="goBack">
        <i class="bi bi-arrow-left"></i> Orqaga
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="submitProduct" class="add-product-form">
      <!-- Sarlavha -->
      <div class="form-group">
        <label for="title">Sarlavha <span class="text-danger">*</span></label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-control"
          placeholder="Masalan: MacBook Pro"
          required
        />
      </div>

      <!-- Tavsif -->
      <div class="form-group">
        <label for="description">Tavsif</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="4"
          placeholder="Mahsulot haqida batafsil ma'lumot..."
        ></textarea>
      </div>

      <!-- Narx va Eski narx -->
      <div class="row">
        <div class="col-md-6 form-group">
          <label for="price">Narx <span class="text-danger">*</span></label>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            class="form-control"
            placeholder="2500"
            required
          />
        </div>
        <div class="col-md-6 form-group">
          <label for="oldPrice">Eski narx (agar aksiya bo‘lsa)</label>
          <input
            id="oldPrice"
            v-model.number="form.oldPrice"
            type="number"
            min="0"
            step="0.01"
            class="form-control"
            placeholder="2700"
          />
        </div>
      </div>

      <!-- Valyuta -->
      <div class="form-group">
        <label for="currency">Valyuta <span class="text-danger">*</span></label>
        <select id="currency" v-model="form.currency" class="form-control" required>
          <option value="USD">USD ($)</option>
          <option value="UZS">UZS (so‘m)</option>
          <option value="EUR">EUR (€)</option>
          <option value="RUB">RUB (₽)</option>
        </select>
      </div>

      <!-- Kategoriya -->
      <div class="form-group">
        <label for="category">Kategoriya <span class="text-danger">*</span></label>
        <select
          id="category"
          v-model="form.categoryId"
          class="form-control"
          :disabled="categories.length === 0"
          required
        >
          <option value="" disabled>Kategoriyani tanlang</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.title || cat.name }}
          </option>
        </select>
        <small v-if="categories.length === 0" class="text-muted">
          Kategoriyalar yuklanmoqda...
        </small>
      </div>

      <!-- Brend -->
      <div class="form-group">
        <label for="brand">Brend</label>
        <input
          id="brand"
          v-model="form.brand"
          type="text"
          class="form-control"
          placeholder="Apple, Samsung, Xiaomi..."
        />
      </div>

      <!-- Tugmalar -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          :disabled="submitting"
        >
          <span v-if="submitting">
            <i class="bi bi-arrow-clockwise spinner"></i> Saqlanmoqda...
          </span>
          <span v-else>
            <i class="bi bi-save"></i> Saqlash
          </span>
        </button>

        <button type="button" class="btn btn-secondary btn-lg" @click="goBack">
          Bekor qilish
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-product-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  background: var(--surface-strong);
  border-radius: 16px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  color: var(--muted);
}

.breadcrumb-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--primary-strong);
  text-decoration: underline;
}

.breadcrumb i {
  font-size: 0.8rem;
  color: #adb5bd;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-display);
  margin: 0;
}

.btn-back {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.25s ease;
}

.btn-back:hover {
  background: #fff4e6;
  border-color: var(--primary);
  color: var(--text);
  transform: translateY(-1px);
}

.alert-danger {
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  border-radius: 10px;
  background: rgba(228, 61, 64, 0.12);
  color: var(--primary-strong);
  border-left: 5px solid var(--primary);
  font-weight: 500;
}

/* Form styling */
.add-product-form {
  display: grid;
  gap: 1.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
}

.form-control,
.form-control:focus {
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-size: 1rem;
  transition: all 0.25s ease;
  background: var(--surface-strong);
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(228, 61, 64, 0.15);
  outline: none;
}

.form-control::placeholder {
  color: #adb5bd;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .row {
    grid-template-columns: 1fr;
  }
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23343a40' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 12px;
  padding-right: 2.5rem;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.85rem 2rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  border: none;
  color: white;
  box-shadow: 0 6px 16px rgba(228, 61, 64, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f2555a 0%, var(--primary-strong) 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(228, 61, 64, 0.4);
}

.btn-secondary {
  background: var(--surface-strong);
  border: 2px solid var(--border);
  color: var(--muted);
}

.btn-secondary:hover:not(:disabled) {
  background: #fff4e6;
  border-color: var(--primary);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Spinner */
.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .add-product-container {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
