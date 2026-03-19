<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const productId = route.params.id;
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
const currentImages = ref([]); 
const selectedFiles = ref([]); 
const previewImages = ref([]); 
const maxImages = 10;
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const productRes = await api.get(`/api/products/${productId}`);
    if (productRes.data.success) {
      const prod = productRes.data.data;
      form.value = {
        title: prod.title || '',
        description: prod.description || '',
        price: prod.price,
        oldPrice: prod.oldPrice,
        currency: prod.currency || 'USD',
        categoryId: prod.categoryId || '',
        brand: prod.brand || ''
      };
      currentImages.value = prod.images || [];
    }

    const catRes = await api.get('/api/categories');
    if (catRes.data.success && catRes.data.data?.categories) {
      categories.value = catRes.data.data.categories;
    }
  } catch (err) {
    console.error('Ma\'lumotlar yuklanmadi:', err);
    errorMessage.value = 'Mahsulot yoki kategoriyalarni yuklashda xato';
  } finally {
    loading.value = false;
  }
});

function handleFileSelect(event) {
  const files = Array.from(event.target.files || []);
  const total = currentImages.value.length + selectedFiles.value.length + files.length;

  if (total > maxImages) {
    alert(`Jami ${maxImages} tagacha rasm qo‘yish mumkin. Hozir ${currentImages.value.length} ta bor.`);
    return;
  }

  selectedFiles.value.push(...files);

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value.push({
        url: e.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  });
}

function removeCurrentImage(index) {
  currentImages.value.splice(index, 1);
}

function removePreview(index) {
  previewImages.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
}

async function submitEdit() {
  if (!form.value.title || !form.value.price || !form.value.categoryId) {
    alert('Majburiy maydonlarni to‘ldiring');
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    let updatedImages = [...currentImages.value];

    if (selectedFiles.value.length > 0) {
      const formData = new FormData();
      selectedFiles.value.forEach(file => {
        formData.append('files', file);
      });

      const uploadRes = await api.post('/api/uploads/images', formData);
      if (uploadRes.data.success) {
        const newUrls = uploadRes.data.data?.urls || [];
        updatedImages.push(...newUrls);
      } else {
        throw new Error('Rasmlar yuklanmadi');
      }
    }

    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      price: Number(form.value.price),
      oldPrice: form.value.oldPrice ? Number(form.value.oldPrice) : null,
      currency: form.value.currency,
      categoryId: form.value.categoryId,
      brand: form.value.brand.trim() || undefined,
      images: updatedImages 
    };

    const updateRes = await api.put(`/api/products/${productId}`, payload);

    if (updateRes.data.success) {
      alert('Mahsulot muvaffaqiyatli tahrirlandi!');
      router.push('/products');
    } else {
      errorMessage.value = updateRes.data.message || 'Yangilashda xato';
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Xatolik yuz berdi';
    console.error(err);
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push('/products');
}
</script>

<template>
  <div class="edit-product-container">
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">Home</router-link>
      <i class="bi bi-chevron-right"></i>
      <router-link to="/products" class="breadcrumb-link">Mahsulotlar</router-link>
      <i class="bi bi-chevron-right"></i>
      <span class="breadcrumb-current">Tahrirlash</span>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <div class="spinner-border text-primary"></div>
      <p>Mahsulot ma'lumotlari yuklanmoqda...</p>
    </div>

    <div v-else class="edit-card">
      <div class="card-header">
        <h2>Mahsulotni Tahrirlash</h2>
        <button class="btn-back" @click="goBack">
          <i class="bi bi-arrow-left"></i> Orqaga
        </button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="submitEdit" class="edit-form">
        <div class="form-group">
          <label>Sarlavha *</label>
          <input v-model="form.title" type="text" class="form-control" required />
        </div>

        <div class="form-group">
          <label>Tavsif</label>
          <textarea v-model="form.description" class="form-control" rows="4"></textarea>
        </div>

        <div class="row">
          <div class="col-md-6 form-group">
            <label>Narx *</label>
            <input v-model.number="form.price" type="number" min="0" class="form-control" required />
          </div>
          <div class="col-md-6 form-group">
            <label>Eski narx</label>
            <input v-model.number="form.oldPrice" type="number" min="0" class="form-control" />
          </div>
        </div>

        <div class="form-group">
          <label>Valyuta *</label>
          <select v-model="form.currency" class="form-control" required>
            <option value="USD">USD ($)</option>
            <option value="UZS">UZS (so‘m)</option>
            <option value="EUR">EUR (€)</option>
            <option value="RUB">RUB (₽)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Kategoriya *</label>
          <select v-model="form.categoryId" class="form-control" required>
            <option value="" disabled>Tanlang</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.title }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Brend</label>
          <input v-model="form.brand" type="text" class="form-control" />
        </div>

        <div class="form-group">
          <label>Rasmlar ({{ currentImages.length + previewImages.length }} / {{ maxImages }})</label>
          
          <div v-if="currentImages.length" class="current-images-grid">
            <div v-for="(img, idx) in currentImages" :key="idx" class="image-preview">
              <img :src="img" alt="Current image" />
              <button type="button" class="btn-remove" @click="removeCurrentImage(idx)">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <div v-if="previewImages.length" class="preview-grid">
            <div v-for="(prev, idx) in previewImages" :key="idx" class="image-preview">
              <img :src="prev.url" :alt="prev.name" />
              <button type="button" class="btn-remove" @click="removePreview(idx)">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            @change="handleFileSelect"
            style="display: none"
            id="imageInput"
          />
          <label for="imageInput" class="upload-label">
            <i class="bi bi-cloud-upload"></i>
            <span>Rasmlarni tanlang yoki bu yerga sudrab tashlang</span>
            <small>Maksimum {{ maxImages }} ta</small>
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-save" :disabled="submitting">
            <span v-if="submitting">Saqlanmoqda...</span>
            <span v-else><i class="bi bi-save"></i> Saqlash</span>
          </button>
          <button type="button" class="btn btn-cancel" @click="goBack">Bekor qilish</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-product-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.breadcrumb-link {
  color: var(--primary);
  text-decoration: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 {
  margin: 0;
  font-size: 1.8rem;
  font-family: var(--font-display);
  color: var(--text);
}

.edit-card {
  background: var(--surface-strong);
  border-radius: 16px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--surface-strong);
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(228, 61, 64, 0.15);
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

.current-images-grid, .preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.image-preview img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(228, 61, 64, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 2px dashed var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.upload-label:hover {
  border-color: var(--primary);
  background: #fff4e6;
}

.upload-label i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-save {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 600;
}

.btn-cancel {
  background: #6b6b6b;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 600;
}

@media (max-width: 576px) {
  .form-actions {
    flex-direction: column;
  }
}
</style>
