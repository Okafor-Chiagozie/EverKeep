import { api, setStoredToken } from '@/lib/api';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  AuthUser
} from '@/types/auth';
import { StandardApiResponse } from '@/types/common';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { data } = await api.post('/auth/login', credentials);
      const token = data?.data?.token as string;
      const user = data?.data?.user as AuthUser;
      if (token) setStoredToken(token);
      return {
        data: { user, session: null as any },
        isSuccessful: true,
        errors: [],
        responseMessage: 'Login successful',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: error?.response?.data?.message || 'Login failed' }],
        responseMessage: 'Login failed',
        responseCode: 'AUTH_ERROR'
      };
    }
  },

  async register(userData: RegisterRequest): Promise<StandardApiResponse<AuthUser>> {
    try {
      const { data } = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
        fullName: userData.full_name,
          phone: userData.phone,
      });
      const user = data?.data?.user as AuthUser;
      const token = data?.data?.token as string;
      if (token) setStoredToken(token);
      return {
        data: user,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Registration successful',
        responseCode: 'SUCCESS'
      } as any;
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: error?.response?.data?.message || 'Registration failed' }],
        responseMessage: 'Registration failed',
        responseCode: 'AUTH_ERROR'
      } as any;
    }
  },

  async logout(): Promise<StandardApiResponse<null>> {
    try {
      await api.post('/auth/logout');
      setStoredToken(null);
      return {
        data: null,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Logout successful',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: error?.response?.data?.message || 'Logout failed' }],
        responseMessage: 'Logout failed',
        responseCode: 'AUTH_ERROR'
      };
    }
  },

  async getCurrentUser(): Promise<StandardApiResponse<AuthUser | null>> {
    try {
      const { data } = await api.get('/auth/me');
      return {
        data: data?.data as AuthUser,
        isSuccessful: true,
        errors: [],
        responseMessage: 'User retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      // Handle rate limiting specifically
      if (error?.response?.status === 429) {
        return {
          data: null,
          isSuccessful: false,
          errors: [{ field: 'auth', description: 'Rate limit exceeded. Please try again in a moment.' }],
          responseMessage: 'Rate limit exceeded',
          responseCode: 'RATE_LIMIT_ERROR'
        };
      }
      
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: 'Not authenticated' }],
        responseMessage: 'Not authenticated',
        responseCode: 'AUTH_ERROR'
      };
    }
  },
};