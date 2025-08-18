import { api, setStoredToken } from '@/lib/api';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  AuthUser
} from '@/types/auth';
import { StandardApiResponse } from '@/types/common';
import { NotificationHelper } from '@/utils/notificationHelper';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Capture the actual login initiation time BEFORE making the API call
      const loginInitiatedAt = new Date().toISOString();
      console.log('🔍 Login initiated at:', loginInitiatedAt);
      
      const { data } = await api.post('/auth/login', credentials);
      const token = data?.data?.token as string;
      const user = data?.data?.user as AuthUser;
      if (token) setStoredToken(token);
      
      // Log login activity for timeline with the captured timestamp
      if (user?.id) {
        try {
          // Get better location data if possible
          const location = 'Current Location'; // You could enhance this with IP geolocation
          
          await NotificationHelper.logLogin(user.id, {
            ipAddress: 'Current IP',
            userAgent: navigator.userAgent,
            location: location,
            timestamp: loginInitiatedAt // Use the captured timestamp, not current time
          });
        } catch (logError) {
          console.warn('Failed to log login activity:', logError);
        }
      }
      
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
      // Capture the actual registration initiation time BEFORE making the API call
      const registrationInitiatedAt = new Date().toISOString();
      console.log('🔍 Registration initiated at:', registrationInitiatedAt);
      
      const { data } = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        fullName: userData.full_name,
        phone: userData.phone,
      });
      const user = data?.data?.user as AuthUser;
      const token = data?.data?.token as string;
      if (token) setStoredToken(token);
      
      // Log registration activity for timeline
      if (user?.id) {
        try {
          await NotificationHelper.logActivity(user.id, 'system_event', {
            title: 'Account created',
            description: `Your EverKeep account has been successfully created with email ${userData.email}. Welcome to secure digital vault management!`,
            timestamp: registrationInitiatedAt // Use the captured timestamp
          });
        } catch (logError) {
          console.warn('Failed to log registration activity:', logError);
        }
      }
      
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
      // Capture the actual logout initiation time BEFORE making the API call
      const logoutInitiatedAt = new Date().toISOString();
      console.log('🔍 Logout initiated at:', logoutInitiatedAt);
      
      await api.post('/auth/logout');
      setStoredToken(null);
      
      // Log logout activity for timeline with the captured timestamp
      try {
        const currentUser = JSON.parse(localStorage.getItem('everkeep_user') || '{}');
        if (currentUser?.id) {
          await NotificationHelper.logActivity(currentUser.id, 'logout', { 
            location: 'Current Location',
            timestamp: logoutInitiatedAt // Use the captured timestamp, not current time
          });
        }
      } catch (logError) {
        console.warn('Failed to log logout activity:', logError);
      }
      
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