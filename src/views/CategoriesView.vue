<template>
  <div class="categories-page">
    <div class="breadcrumb">
      <router-link to="/dashboard">Home</router-link>
      <span class="separator">></span>
      <span class="current">Categories</span>
      <span class="separator">></span>
    </div>

    <div class="page-header">
      <div>
        <h2 class="page-title">Categories</h2>
        <p class="page-subtitle">{{ categories.length }} total</p>
      </div>
    </div>

    <div class="form-card">
      <div class="form-title">{{ isEditing ? 'Edit Category' : 'Add Category' }}</div>
      <div class="form-grid">
        <div class="field">
          <label class="label">Title</label>
          <input
            v-model="form.title"
            class="input"
            type="text"
            placeholder="Category title"
            :disabled="saving"
          />
        </div>
        <div class="field">
          <label class="label">Image URL or filename</label>
          <input
            v-model="form.img"
            class="input"
            type="text"
            placeholder="https://... or filename.png"
            :disabled="saving"
          />
        </div>
        <div class="field actions">
          <button class="btn primary" :disabled="saving" @click="submitForm">
            {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Add') }}
          </button>
          <button v-if="isEditing" class="btn ghost" :disabled="saving" @click="resetForm">
            Cancel
          </button>
        </div>
      </div>

      <div v-if="error" class="form-message error">{{ error }}</div>
      <div v-if="success" class="form-message success">{{ success }}</div>
    </div>

    <div v-if="loading" class="loading">Loading categories...</div>
    <div v-else-if="categories.length === 0" class="empty">
      No categories found. Add your first one above.
    </div>

    <div v-else class="grid">
      <div
        v-for="(cat, index) in categories"
        :key="getCategoryId(cat) || index"
        class="card"
        @click="goToCategory(cat)"
      >
        <div class="card-image">
          <img
            :src="getImageUrl(cat.img)"
            :alt="cat.title || 'Category'"
            @error="onImageError"
          />
        </div>
        <div class="card-body">
          <div class="card-title">{{ cat.title || 'Untitled' }}</div>
          <div class="card-actions">
            <button class="btn small" @click.stop="startEdit(cat)">Edit</button>
            <button class="btn small danger" @click.stop="deleteCategory(cat)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const categories = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const editingId = ref(null)

const form = ref({
  title: '',
  img: ''
})

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://student.jamshidibodullayev.uz'
const placeholderUrl = 'https://via.placeholder.com/400x260?text=Category'

const isEditing = computed(() => editingId.value !== null)

onMounted(async () => {
  await fetchCategories()
})

async function fetchCategories() {
  loading.value = true
  try {
    const res = await api.get('/api/categories')
    const data = res.data?.data
    if (Array.isArray(data?.categories)) {
      categories.value = data.categories
    } else if (Array.isArray(data)) {
      categories.value = data
    } else if (Array.isArray(res.data?.categories)) {
      categories.value = res.data.categories
    } else {
      categories.value = []
    }
  } catch (err) {
    console.error('Categories yuklanmadi:', err)
    error.value = 'Failed to load categories.'
  } finally {
    loading.value = false
  }
}

function getCategoryId(cat) {
  return cat?.id || cat?._id || cat?.uuid || cat?.categoryId
}

function getImageUrl(img) {
  if (!img) return placeholderUrl
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img
  }
  if (img.startsWith('/')) {
    return `${API_BASE_URL}${img}`
  }
  return `${API_BASE_URL}/uploads/${img}`
}

function onImageError(event) {
  event.target.src = placeholderUrl
}

function startEdit(cat) {
  editingId.value = getCategoryId(cat)
  form.value = {
    title: cat?.title || '',
    img: cat?.img || ''
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goToCategory(cat) {
  const id = getCategoryId(cat)
  if (!id) return
  router.push(`/categories/${id}/products`)
}

function resetForm(clearMessages = true) {
  form.value = { title: '', img: '' }
  editingId.value = null
  if (clearMessages) {
    error.value = ''
    success.value = ''
  }
}

async function submitForm() {
  error.value = ''
  success.value = ''

  const title = form.value.title?.trim()
  if (!title) {
    error.value = 'Title is required.'
    return
  }

  const payload = {
    title,
    img: form.value.img?.trim() || ''
  }

  saving.value = true
  const editing = isEditing.value
  try {
    if (editing) {
      await api.put(`/api/categories/${editingId.value}`, payload)
    } else {
      await api.post('/api/categories', payload)
    }
    await fetchCategories()
    resetForm(false)
    success.value = editing ? 'Category updated.' : 'Category added.'
  } catch (err) {
    console.error('Category save error:', err)
    error.value = 'Failed to save category.'
  } finally {
    saving.value = false
  }
}

async function deleteCategory(cat) {
  const id = getCategoryId(cat)
  if (!id) return
  if (!confirm('Delete this category?')) return

  try {
    await api.delete(`/api/categories/${id}`)
    categories.value = categories.value.filter(c => getCategoryId(c) !== id)
  } catch (err) {
    console.error('Delete category error:', err)
    error.value = 'Failed to delete category.'
  }
}
</script>

<style scoped>
.categories-page {
  padding: 20px 24px;
  background: transparent;
  min-height: calc(100vh - 64px);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--muted);
}

.breadcrumb a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  color: #adb5bd;
  font-weight: 700;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-display);
  margin: 0;
}

.page-subtitle {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.form-card {
  background: var(--surface-strong);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.form-title {
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.6fr auto;
  gap: 12px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.input {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(228, 61, 64, 0.12);
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  background: #f1ece4;
  color: var(--text);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.btn.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
}

.btn.ghost {
  background: var(--surface-strong);
  border: 1px solid var(--border);
}

.btn.small {
  padding: 8px 12px;
  font-size: 13px;
}

.btn.danger {
  background: rgba(228, 61, 64, 0.12);
  color: var(--primary-strong);
}

.form-message {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.form-message.error {
  background: rgba(228, 61, 64, 0.12);
  color: var(--primary-strong);
}

.form-message.success {
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
  background: var(--surface-strong);
  border-radius: 12px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  background: var(--surface-strong);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  transition: transform 0.25s, box-shadow 0.25s;
  cursor: pointer;
  animation: floatIn 0.45s ease both;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.card-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  background: linear-gradient(135deg, rgba(228, 61, 64, 0.08), rgba(15, 118, 110, 0.08));
  border-bottom: 1px solid var(--border);
}

.card-image img {
  position: absolute;
  inset: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  object-fit: contain;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 27, 22, 0.12);
}

.card-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-title {
  font-weight: 700;
  color: var(--text);
  font-size: 16px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .categories-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .form-card {
    padding: 14px;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
