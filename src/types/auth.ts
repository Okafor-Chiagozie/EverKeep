import { StandardApiResponse } from './common';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone: string;
  full_name: string;
}

export interface LoginResponse extends StandardApiResponse<{
  user: AuthUser;
  session: Session | null;
}> {}

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  isVerified: boolean;
  last_login: string;
  created_at: string;
  isOnboarded?: boolean;
  deadmanTrigger?: number;
  encryptionKey?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}