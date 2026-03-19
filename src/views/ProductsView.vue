<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const router = useRouter();
const route = useRoute();
const products = ref([]);
const loading = ref(true);
const categoryId = computed(() => route.params.id || null);
const isCategoryView = computed(() => Boolean(categoryId.value));
const pageTitle = computed(() => (isCategoryView.value ? 'Category Products' : 'Barcha Mahsulotlar'));
const pageSubtitle = computed(() => {
  if (isCategoryView.value) {
    return `${products.value.length} ta mahsulot`;
  }
  return `${products.value.length} ta mahsulot mavjud`;
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://student.jamshidibodullayev.uz';

watch(categoryId, async () => {
  loading.value = true;
  try {
    const endpoint = categoryId.value
      ? `/api/products/category/${categoryId.value}?page=1&limit=1000`
      : '/api/products?page=1&limit=1000';
    const res = await api.get(endpoint);
    console.log('Products data:', res.data);

    if (res.data.success && res.data.data?.products) {
      products.value = res.data.data.products;
    } else if (res.data.success && Array.isArray(res.data.data)) {
      products.value = res.data.data;
    } else if (Array.isArray(res.data?.products)) {
      products.value = res.data.products;
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error('Products yuklanmadi:', err);
  } finally {
    loading.value = false;
  }
}, { immediate: true });

function goToAddProduct() {
  router.push('/products/add');
}

function goToUploadImage(productId) {
  router.push(`/products/${productId}/upload-image`);
}

function editProduct(productId) {
  router.push(`/products/${productId}/edit`);
}

async function deleteProduct(productId) {
  if (!confirm('Mahsulotni o‘chirmoqchimisiz?')) return;

  try {
    const res = await api.delete(`/api/products/${productId}`);
    if (res.data.success) {
      products.value = products.value.filter(p => p.id !== productId);
      alert('Mahsulot o‘chirildi!');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Mahsulotni o‘chirishda xatolik yuz berdi');
  }
}

function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price) + ' ' + currency;
}

function getImageUrl(image) {
  if (!image) return 'https://via.placeholder.com/300x300?text=No+Image';

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  if (image.startsWith('/')) {
    return `${API_BASE_URL}${image}`;
  }

  return `${API_BASE_URL}/uploads/${image}`;
}
</script>

<template>
  <div class="products-container">
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">Home</router-link>
      <i class="bi bi-chevron-right"></i>
      <template v-if="isCategoryView">
        <router-link to="/categories" class="breadcrumb-link">Categories</router-link>
        <i class="bi bi-chevron-right"></i>
        <span class="breadcrumb-current">Category Products</span>
      </template>
      <template v-else>
        <span class="breadcrumb-current">Mahsulotlar</span>
      </template>
    </div>

    <div class="page-header">
      <div>
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
      <button class="btn-add-product" @click="goToAddProduct">
        <i class="bi bi-plus-circle"></i>
        Yangi Mahsulot
      </button>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Yuklanmoqda...</span>
      </div>
      <p class="loading-text">Mahsulotlar yuklanmoqda...</p>
    </div>

    <div v-else-if="products.length > 0" class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="card-image">
          <Swiper
            :modules="[Navigation, Pagination]"
            :slides-per-view="1"
            :space-between="0"
            :loop="product.images?.length > 1"
            navigation
            pagination
            class="product-swiper"
          >
            <SwiperSlide v-for="(image, index) in product.images || []" :key="index">
              <img
                :src="getImageUrl(image)"
                :alt="`${product.title || 'Mahsulot'} - ${index + 1}`"
                class="swiper-image"
                @error="$event.target.src = 'https://via.placeholder.com/300x300?text=No+Image'"
              />
            </SwiperSlide>

            <SwiperSlide v-if="!(product.images?.length)">
              <img
                src="https://via.placeholder.com/300x300?text=No+Image"
                alt="Rasm mavjud emas"
                class="swiper-image"
              />
            </SwiperSlide>
          </Swiper>

          <div class="card-badges">
            <span v-if="product.oldPrice" class="badge badge-sale">Aksiya</span>
            <span v-if="product.stock < 10" class="badge badge-stock">Kam qoldi</span>
          </div>
        </div>

        <div class="card-body">
          <div class="product-brand">{{ product.brand || 'Brend yo‘q' }}</div>
          <h3 class="product-title">{{ product.title }}</h3>
          <p class="product-description" v-if="product.description">
            {{ product.description.substring(0, 60) }}{{ product.description.length > 60 ? '...' : '' }}
          </p>

          <div class="price-section">
            <div class="price-current">{{ formatPrice(product.price, product.currency) }}</div>
            <div v-if="product.oldPrice" class="price-old">
              {{ formatPrice(product.oldPrice, product.currency) }}
            </div>
          </div>

          <div class="stock-info">
            <i class="bi bi-box-seam"></i>
            <span>Omborda: {{ product.stock || 0 }} dona</span>
          </div>

          <div class="card-actions">
            <button class="btn-action btn-primary" @click="goToUploadImage(product.id)" title="Rasm yuklash">
              <i class="bi bi-image"></i> Rasm
            </button>
            <button class="btn-action btn-secondary" @click="editProduct(product.id)" title="Tahrirlash">
              <i class="bi bi-pencil"></i> Tahrirlash
            </button>
            <button class="btn-action btn-danger" @click="deleteProduct(product.id)" title="O'chirish">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <h3 class="empty-title">Mahsulotlar topilmadi</h3>
      <p class="empty-text">Birinchi mahsulotingizni qo'shing</p>
      <button class="btn-empty-action" @click="goToAddProduct">
        <i class="bi bi-plus-circle"></i> Mahsulot qo'shish
      </button>
    </div>
  </div>
</template>

<style scoped>
.products-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: transparent;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
}

.breadcrumb-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--primary-strong);
}

.breadcrumb i {
  font-size: 0.75rem;
  color: #adb5bd;
}

.breadcrumb-current {
  color: var(--muted);
  font-weight: 500;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: var(--surface-strong);
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-display);
  margin: 0;
}

.page-subtitle {
  color: var(--muted);
  font-size: 1rem;
  margin-top: 0.25rem;
}

.btn-add-product {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(228, 61, 64, 0.25);
}

.btn-add-product:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(228, 61, 64, 0.35);
}

.loading-wrapper {
  text-align: center;
  padding: 6rem 0;
  color: #6c757d;
}

.loading-text {
  margin-top: 1.2rem;
  font-size: 1.1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.75rem;
}

.product-card {
  background: var(--surface-strong);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  transition: all 0.35s ease;
  display: flex;
  flex-direction: column;
  animation: floatIn 0.45s ease both;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, rgba(228, 61, 64, 0.08), rgba(15, 118, 110, 0.08));
  border-bottom: 1px solid var(--border);
}

.product-swiper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}

:deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(31, 27, 22, 0.12);
  transition: transform 0.5s ease;
}

.product-card:hover .swiper-image {
  transform: scale(1.03);
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #1f1b16 !important;
  background: transparent;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
  opacity: 0.75;
  top: 50%;
  margin-top: 0;
  transform: translateY(-50%);
  transition: opacity 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

:deep(.swiper-button-next:after),
:deep(.swiper-button-prev:after) {
  font-size: 24px;
  font-weight: 700;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  opacity: 1;
  color: var(--primary) !important;
  transform: translateY(-50%) scale(1.02);
}

:deep(.swiper-button-disabled) {
  opacity: 0.2;
}

:deep(.swiper-pagination-bullet) {
  background: white !important;
  opacity: 0.65;
}

:deep(.swiper-pagination-bullet-active) {
  background: #ff1744 !important;
  opacity: 1;
}

.card-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  box-shadow: 0 6px 14px rgba(31, 27, 22, 0.18);
}

.badge-sale {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
}

.badge-stock {
  background: #ff9800;
  color: white;
}

/* Card Body */
.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  flex: 1;
}

.product-brand {
  font-size: 0.9rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
}

.product-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Price */
.price-section {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
  margin-top: auto;
}

.price-current {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

.price-old {
  font-size: 1.1rem;
  color: var(--muted);
  text-decoration: line-through;
}

/* Stock */
.stock-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
  background: #fff4e6;
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--text);
}

/* Actions */
.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.btn-action {
  border: none;
  padding: 0.7rem 1.1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: rgba(13, 110, 253, 0.12);
  color: #0d6efd;
}

.btn-primary:hover {
  background: #0d6efd;
  color: white;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(245, 159, 0, 0.15);
  color: #b26a00;
}

.btn-secondary:hover {
  background: #f59f00;
  color: white;
  transform: translateY(-2px);
}

.btn-danger {
  background: rgba(228, 61, 64, 0.12);
  color: var(--primary-strong);
  padding: 0.7rem;
}

.btn-danger:hover {
  background: var(--primary-strong);
  color: white;
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 6rem 2rem;
  background: var(--surface-strong);
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
}

.empty-icon {
  font-size: 6rem;
  margin-bottom: 1.5rem;
  animation: bounce 2.2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.empty-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

.empty-text {
  color: var(--muted);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-empty-action {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
  border: none;
  padding: 1rem 2.2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 24px rgba(228, 61, 64, 0.35);
}

.btn-empty-action:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(228, 61, 64, 0.45);
}

/* Responsive */
@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.2rem;
  }

  .btn-add-product {
    width: 100%;
    justify-content: center;
  }

  .products-grid {
    gap: 1.25rem;
  }

  .card-actions {
    grid-template-columns: 1fr;
  }

  .btn-action {
    width: 100%;
  }

  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 22px;
    height: 22px;
  }

  :deep(.swiper-button-next:after),
  :deep(.swiper-button-prev:after) {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
