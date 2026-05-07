<template>
  <div class="login-wrapper">
    <h1 class="login-title">Добро пожаловать в Impression</h1>
    <Card class="login-form">
      <template #content>
        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label for="username">Имя пользователя</label>
            <InputText 
              id="username" 
              v-model="formData.username" 
              type="text" 
              placeholder="Введите имя пользователя"
              :class="{ 'p-invalid': errors.username }"
              class="w-full"
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>

          <div class="field">
            <label for="password">Пароль</label>
            <Password 
              id="password"
              v-model="formData.password" 
              placeholder="Введите пароль" 
              :feedback="false"
              toggleMask
              input-autocomplete="current-password"
              :class="{ 'p-invalid': errors.password }"
              class="w-full"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>
          
          <Message v-if="errorMessage" severity="error" class="mt-3">{{ errorMessage }}</Message>

          <Button 
            type="submit" 
            label="Войти"
            :disabled="isLoading" 
            :loading="isLoading"
            class="w-full mt-4"
          />
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { required } from '@/utils/validators';

interface FormData {
  username: string;
  password: string;
}

interface Errors {
  username?: string;
  password?: string;
}

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const formData = reactive<FormData>({
  username: '',
  password: ''
});

const errors = ref<Errors>({});
const errorMessage = ref<string | null>(null);

const isLoading = computed(() => authStore.isLoading);

const validate = (): boolean => {
  errors.value = {};
  const usernameError = required(formData.username);
  if (usernameError !== true) {
    errors.value.username = usernameError;
  }
  
  const passwordError = required(formData.password);
  if (passwordError !== true) {
    errors.value.password = passwordError;
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  try {
    errorMessage.value = null;
    await authStore.login({
      username: formData.username,
      password: formData.password
    });
    
    const redirect = route.query.redirect as string;
    await router.push(redirect || '/');
  } catch (error: any) {
    errorMessage.value = error.message || 'Ошибка авторизации';
  }
};
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.login-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--p-primary-color, #3b82f6);
}

.login-form {
  padding: 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1.25rem;
  width: 100%;
}

.field label {
  font-weight: 500;
  font-size: 0.9rem;
}

.login-form :deep(.p-password),
.login-form :deep(.p-password input) {
  width: 100% !important;
}

.login-form :deep(.p-inputtext) {
  width: 100% !important;
}

.field :deep(input),
.field :deep(.p-password),
.field :deep(.p-inputtext),
.field :deep(.p-button) {
  width: 100% !important;
}
</style>
