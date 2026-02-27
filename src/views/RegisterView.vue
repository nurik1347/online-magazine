<template>
    <div class="login-container">
        <div class="login-card">
            <div class="logo-section">
                <img src="/logo.png" alt="SPECIFIC" class="logo">
                <h1>Create Account</h1>
            </div>

            <div class="error" v-if="useAuthStore.error">{{ useAuthStore.error }}</div>
            <form @submit.prevent="handleRegister">
                <div class="input-group">
                    <label>Full Name</label>
                    <input v-model="form.name" placeholder="John Doe" required />
                </div>

                <div class="input-group">
                    <label>Username</label>
                    <input v-model="form.username" placeholder="johndoe" required />
                </div>

                <div class="input-group">
                    <label>Email</label>
                    <input v-model="form.email" placeholder="user@example.com" required />
                </div>

                <div class="input-group">
                    <label>Phone</label>
                    <input v-model="form.phone" placeholder="+998901234567" required />
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input v-model="form.password" placeholder="strongpass123" required />
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

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: ''
})

const handleRegister = async () => {
    const result = await authStore.register(form.value)
    if (result.success) {
        router.push('/')
    }
}
</script>

<style scoped>
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