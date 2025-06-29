import { supabase } from '@/lib/supabase';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  AuthUser
} from '@/types/auth';
import { StandardApiResponse } from '@/types/common';
import { NotificationHelper } from '@/utils/notificationHelper';

interface LoginMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export const authService = {
  async login(credentials: LoginRequest, metadata?: LoginMetadata): Promise<LoginResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: error.message }],
        responseMessage: 'Login failed',
        responseCode: 'AUTH_ERROR'
      };
    }

    const response: LoginResponse = {
      data: {
        user: data.user as AuthUser,
        session: data.session
      },
      isSuccessful: true,
      errors: [],
      responseMessage: 'Login successful',
      responseCode: 'SUCCESS'
    };

    // 🔥 Log activity - Successful Login
    if (data.user) {
      try {
        await NotificationHelper.logLogin(
          data.user.id,
          metadata?.ipAddress,
          metadata?.userAgent,
          metadata?.location
        );
      } catch (logError) {
        console.warn('Failed to log login activity:', logError);
      }
    }

    return response;
  },

  async register(userData: RegisterRequest): Promise<StandardApiResponse<AuthUser>> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          phone: userData.phone,
          full_name: userData.full_name
        }
      }
    });

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: error.message }],
        responseMessage: 'Registration failed',
        responseCode: 'AUTH_ERROR'
      };
    }

    const user = data.user as AuthUser;

    // 🔥 Log activity - Account Created
    if (user) {
      try {
        await NotificationHelper.logActivity(
          user.id,
          'system_event',
          {
            title: 'Account created',
            description: 'Welcome! Your EverKeep account has been created successfully.',
            metadata: {
              email: user.email,
              fullName: userData.full_name
            }
          }
        );
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
    };
  },

  async logout(): Promise<StandardApiResponse<null>> {
    // Get current user before logout for logging
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: error.message }],
        responseMessage: 'Logout failed',
        responseCode: 'AUTH_ERROR'
      };
    }

    // 🔥 Log activity - Logout
    if (user) {
      try {
        await NotificationHelper.logActivity(
          user.id,
          'system_event',
          {
            title: 'Account logged out',
            description: 'User session ended successfully',
            metadata: {
              logoutTime: new Date().toISOString()
            }
          }
        );
      } catch (logError) {
        console.warn('Failed to log logout activity:', logError);
      }
    }

    return {
      data: null,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Logout successful',
      responseCode: 'SUCCESS'
    };
  },

  async getCurrentUser(): Promise<StandardApiResponse<AuthUser | null>> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'auth', description: error.message }],
        responseMessage: 'Failed to get current user',
        responseCode: 'AUTH_ERROR'
      };
    }

    return {
      data: user as AuthUser,
      isSuccessful: true,
      errors: [],
      responseMessage: 'User retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

  // Utility method to get client metadata for logging
  getClientMetadata(): LoginMetadata {
    try {
      const metadata: LoginMetadata = {
        userAgent: navigator?.userAgent,
        ipAddress: undefined, // This would need to be provided by your backend
        location: undefined   // This would need geolocation or IP-based detection
      };

      // You can enhance this with additional client detection
      return metadata;
    } catch (error) {
      console.warn('Failed to get client metadata:', error);
      return {};
    }
  }
};