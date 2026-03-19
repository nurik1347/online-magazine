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
  password: ''
});

const handleRegister = async () => {
  if (!form.value.firstname || !form.value.name || !form.value.username ||
      !form.value.email || !form.value.phone || !form.value.password) {
    authStore.error = 'Barcha maydonlarni to‘ldiring';
    return;
  }

  const payload = {
    firstname: form.value.firstname.trim(),
    name: form.value.name.trim(),
    username: form.value.username.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone.trim(),
    password: form.value.password
  };

  console.log('Yuborilayotgan payload:', payload);

  const result = await authStore.register(payload);

  if (result.success) {
    router.push('/');
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(900px 500px at 10% -10%, rgba(228, 61, 64, 0.14), transparent 60%),
    radial-gradient(800px 500px at 90% -10%, rgba(15, 118, 110, 0.14), transparent 60%),
    var(--bg);
}

.login-card {
  background: var(--surface-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border);
  animation: floatIn 0.5s ease both;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  max-width: 180px;
  margin-bottom: 1rem;
  filter: drop-shadow(0 6px 10px rgba(31, 27, 22, 0.12));
}

h1 {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0;
  font-family: var(--font-display);
}

.error {
  color: var(--primary-strong);
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
  color: var(--muted);
}

input {
  width: 100%;
  padding: 0.9rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--surface-strong);
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(228, 61, 64, 0.15);
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover {
  background: linear-gradient(135deg, #f2555a 0%, var(--primary-strong) 100%);
}

.login-btn:disabled {
  background: rgba(228, 61, 64, 0.5);
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--muted);
}

.register-link a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 0 16px;
  }

  .logo {
    max-width: 150px;
  }

  h1 {
    font-size: 1.3rem;
  }
}
</style>
