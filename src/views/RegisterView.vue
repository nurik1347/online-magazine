<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <img src="/logo.png" alt="SPECIFIC" class="logo">
        <h1>Create Account</h1>
      </div>

      <div class="error" v-if="authStore.error">{{ authStore.error }}</div>

      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label>Ism (Firstname) *</label>
          <input v-model="form.firstname" placeholder="John" required />
        </div>

        <div class="input-group">
          <label>Familiya (Name) *</label>
          <input v-model="form.name" placeholder="Doe" required />
        </div>

        <div class="input-group">
          <label>Username *</label>
          <input v-model="form.username" placeholder="johndoe" required />
        </div>

        <div class="input-group">
          <label>Email *</label>
          <input v-model="form.email" type="email" placeholder="user@example.com" required />
        </div>

        <div class="input-group">
          <label>Telefon *</label>
          <input v-model="form.phone" placeholder="+998901234567" required />
        </div>

        <div class="input-group">
          <label>Parol *</label>
          <input v-model="form.password" type="password" placeholder="strongpass123" required />
        </div>

        <!-- Role tanlash -->
        <div class="input-group role-group">
          <label>Rol tanlang *</label>
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
            </label>

            <label class="radio-label">
              <input
                type="radio"
                v-model="form.role"
                value="user"
                name="role"
              />
              <span>User</span>
            </label>
          </div>
        </div>

        <button type="submit" class="login-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Creating...' : 'Register' }}
        </button>
      </form>

      <p class="register-link">
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  firstname: '',
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'user' 
});

const handleRegister = async () => {
  if (!form.value.firstname || !form.value.name || !form.value.username ||
      !form.value.email || !form.value.password || !form.value.role) {
    authStore.error = 'Barcha majburiy maydonlarni to‘ldiring';
    return;
  }

  const payload = {
    firstname: form.value.firstname.trim(),
    name: form.value.name.trim(),
    username: form.value.username.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone.trim(),
    password: form.value.password,
    role: form.value.role 
  };

  const result = await authStore.register(payload);

  if (result.success) {
    router.push('/');
  }
};
</script>

<style scoped>

.role-group {
  margin-bottom: 1.5rem;
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
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
}

.login-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 420px;
    border-top: 4px solid #e63946;
}

.logo-section {
    text-align: center;
    margin-bottom: 2rem;
}

.logo {
    max-width: 180px;
    margin-bottom: 1rem;
}

h1 {
    font-size: 1.5rem;
    color: #333;
    margin: 0;
}

.error {
    color: #e63946;
    text-align: center;
    margin-bottom: 1rem;
}

.input-group {
    margin-bottom: 1.3rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #444;
}

input {
    width: 100%;
    padding: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: #e63946;
    box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.15);
}

.login-btn {
    width: 100%;
    padding: 1rem;
    background: #e63946;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: 0.2s;
}

.login-btn:hover {
    background: #d00000;
}

.login-btn:disabled {
    background: #f48c96;
    cursor: not-allowed;
}

.register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #666;
}

.register-link a {
    color: #e63946;
    text-decoration: none;
    font-weight: 500;
}

.register-link a:hover {
    text-decoration: underline;
}
</style>