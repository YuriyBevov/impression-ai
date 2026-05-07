export interface User {
  id: string;
  username: string;
  role: string;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  loginLoading: boolean;
  isInitialized: boolean;
}