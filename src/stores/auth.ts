import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthState, User, LoginRequest } from '@/types/auth';
import { authService } from '@/services/api/auth.service';
import { setToken, removeToken } from '@/utils/storage';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isLoading = ref<boolean>(false);
  const isInitialized = ref<boolean>(false);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (credentials: LoginRequest): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await authService.login(credentials);
      token.value = response.token;
      user.value = response.user;
      setToken(response.token);
    } finally {
      isLoading.value = false;
    }
  };

  const logout = (): void => {
    token.value = null;
    user.value = null;
    removeToken();
  };

  const initializeFromStorage = (): void => {
    const storedToken = localStorage.getItem('impression_token');
    if (storedToken) {
      token.value = storedToken;
    }
    isInitialized.value = true;
  };

  const checkAuth = (): boolean => {
    return isAuthenticated.value;
  };

  return {
    token,
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    login,
    logout,
    initializeFromStorage,
    checkAuth
  };
});