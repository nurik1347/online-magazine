<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const productId = route.params.id;
const product = ref(null);
const loading = ref(true);
const uploading = ref(false);
const selectedFiles = ref([]);
const previewImages = ref([]);

onMounted(async () => {
    try {
        const res = await api.get(`/api/products/${productId}`);
        if (res.data.success) {
            product.value = res.data.data;
        }
    } catch (err) {
        console.error('Mahsulot yuklanmadi:', err);
    } finally {
        loading.value = false;
    }
});

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    selectedFiles.value = files;

    previewImages.value = [];
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

function removePreview(index) {
    previewImages.value.splice(index, 1);
    selectedFiles.value.splice(index, 1);
}

async function uploadImages() {
    if (!selectedFiles.value.length) {
        alert('Iltimos, kamida bitta rasm tanlang');
        return;
    }

    uploading.value = true;

    const formData = new FormData();
    selectedFiles.value.forEach(file => {
        formData.append('files', file);
    });

    try {
        const uploadRes = await api.post('/api/uploads/images', formData);

        if (!uploadRes.data.success) {
            throw new Error('Yuklash muvaffaqiyatsiz');
        }

        const newImageUrls = uploadRes.data.data?.urls || [];

        if (!newImageUrls.length) {
            alert('URL lar topilmadi');
            return;
        }

        const updatedImages = newImageUrls;


        const updateRes = await api.put(`/api/products/${productId}`, {
            images: updatedImages
        });

        if (updateRes.data.success) {
            alert('Rasmlar yuklandi va mahsulotga to‘g‘ri bog‘landi!');

            const refreshed = await api.get(`/api/products/${productId}`);
            if (refreshed.data.success) {
                product.value = refreshed.data.data;
            }

            router.push('/products');
        } else {
            alert('Mahsulot yangilanmadi');
        }
    } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Xato yuz berdi';
        alert(msg);
        console.error(err);
    } finally {
        uploading.value = false;
    }
}
function goBack() {
    router.push('/products');
}
</script>

<template>
    <div class="upload-container">
        <div class="breadcrumb">
            <router-link to="/" class="breadcrumb-link">Home</router-link>
            <i class="bi bi-chevron-right"></i>
            <router-link to="/products" class="breadcrumb-link">Products</router-link>
            <i class="bi bi-chevron-right"></i>
            <span class="breadcrumb-current">Rasm yuklash</span>
        </div>

        <div v-if="loading" class="loading-wrapper">
            <div class="spinner-border text-primary"></div>
            <p>Mahsulot ma'lumotlari yuklanmoqda...</p>
        </div>

        <div v-else class="upload-card">
            <div class="card-header">
                <div>
                    <h2 class="card-title">Mahsulot Rasmlari</h2>
                    <p class="card-subtitle" v-if="product">{{ product.title }}</p>
                </div>
                <button class="btn-back" @click="goBack">
                    <i class="bi bi-arrow-left"></i>
                    Orqaga
                </button>
            </div>

            <div class="card-body">
                <div v-if="product && product.images && product.images.length > 0" class="current-images">
                    <h3 class="section-title">Hozirgi rasmlar</h3>
                    <div class="preview-grid">
                        <div v-for="(image, index) in product.images" :key="'current-' + index"
                            class="preview-item current">
                            <img :src="image" :alt="`Product image ${index + 1}`">
                            <div class="image-name">{{ image }}</div>
                        </div>
                    </div>
                </div>

                <div class="upload-zone">
                    <input type="file" id="fileInput" multiple accept="image/*" @change="handleFileSelect"
                        style="display: none" />
                    <label for="fileInput" class="upload-label">
                        <i class="bi bi-cloud-upload"></i>
                        <h3>Yangi rasmlarni tanlang</h3>
                        <p>yoki bu yerga tashlang</p>
                        <span class="upload-hint">PNG, JPG, JPEG (max 5MB)</span>
                    </label>
                </div>

                <div v-if="previewImages.length > 0" class="preview-section">
                    <h3 class="preview-title">Qo'shiladigan rasmlar ({{ previewImages.length }})</h3>
                    <div class="preview-grid">
                        <div v-for="(image, index) in previewImages" :key="index" class="preview-item">
                            <img :src="image.url" :alt="image.name">
                            <button class="btn-remove" @click="removePreview(index)">
                                <i class="bi bi-x-circle-fill"></i>
                            </button>
                            <div class="image-name">{{ image.name }}</div>
                        </div>
                    </div>
                </div>

                <div class="info-alert">
                    <i class="bi bi-info-circle"></i>
                    <div>
                        <strong>Diqqat:</strong> Yangi rasmlar qo'shilganda, eski rasmlar o'chiriladi va faqat yangi
                        rasmlar saqlanadi.
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn-upload" @click="uploadImages"
                        :disabled="uploading || selectedFiles.length === 0">
                        <i class="bi bi-upload"></i>
                        {{ uploading ? 'Yuklanmoqda...' : 'Yuklash va Saqlash' }}
                    </button>
                    <button class="btn-cancel" @click="goBack" :disabled="uploading">
                        Bekor qilish
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.upload-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.breadcrumb-link {
    color: #dc3545;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
}

.breadcrumb-link:hover {
    color: #c82333;
}

.breadcrumb i {
    font-size: 0.75rem;
    color: #999;
}

.breadcrumb-current {
    color: #666;
    font-weight: 500;
}

.upload-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    color: white;
}

.card-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
}

.card-subtitle {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 0.95rem;
}

.btn-back {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    font-weight: 500;
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.2);
}

.card-body {
    padding: 2rem;
}

.current-images {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid #f0f0f0;
}

.section-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
}

.upload-zone {
    margin-bottom: 2rem;
}

.upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    border: 3px dashed #ddd;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.upload-label:hover {
    border-color: #ff1744;
    background: #fff5f7;
}

.upload-label i {
    font-size: 4rem;
    color: #ff1744;
    margin-bottom: 1rem;
}

.upload-label h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem 0;
}

.upload-label p {
    color: #666;
    margin: 0 0 1rem 0;
}

.upload-hint {
    font-size: 0.85rem;
    color: #999;
    padding: 0.5rem 1rem;
    background: white;
    border-radius: 6px;
}

/* Preview Section */
.preview-section {
    margin-bottom: 2rem;
}

.preview-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
}

.preview-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #f0f0f0;
    transition: all 0.3s ease;
}

.preview-item.current {
    border-color: #28a745;
}

.preview-item:hover {
    border-color: #ff1744;
    transform: scale(1.05);
}

.preview-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
}

.btn-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(220, 53, 69, 0.9);
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

.btn-remove:hover {
    background: #dc3545;
    transform: scale(1.1);
}

.image-name {
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 0.75rem;
    text-align: center;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.info-alert {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: #e7f3ff;
    border-left: 4px solid #1976d2;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.info-alert i {
    font-size: 1.5rem;
    color: #1976d2;
    flex-shrink: 0;
}

.info-alert strong {
    color: #1565c0;
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

.btn-upload {
    flex: 1;
    background: linear-gradient(135deg, #ff1744 0%, #f50057 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.btn-upload:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 23, 68, 0.4);
}

.btn-upload:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-cancel {
    flex: 1;
    background: white;
    color: #666;
    border: 2px solid #ddd;
    padding: 1rem 2rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancel:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #999;
}

.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading-wrapper {
    text-align: center;
    padding: 5rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
    .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .btn-back {
        width: 100%;
        justify-content: center;
    }

    .preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .action-buttons {
        flex-direction: column;
    }
}
</style>