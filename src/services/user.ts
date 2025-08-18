import { api } from '@/lib/api';
import {
  User,
  UpdateUserRequest,
  GetUserByIdResponse,
  UpdateUserResponse
} from '@/types/user';


export const userService = {
  async getUserById(userId: string): Promise<GetUserByIdResponse> {
    try {
      const { data } = await api.get(`/users/${userId}`);
      return {
        data: data.data as any as User,
      isSuccessful: true,
      errors: [],
        responseMessage: 'User retrieved successfully',
      responseCode: 'SUCCESS'
    };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'user', description: error?.response?.data?.message || 'Failed to fetch user' }],
        responseMessage: 'Failed to fetch user',
        responseCode: 'FETCH_ERROR'
      };
    }
  },

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      const payload: any = {};
      if (userData.full_name !== undefined) payload.full_name = userData.full_name;
      if (userData.phone !== undefined) payload.phone = userData.phone;
      if (userData.inactivity_threshold_days !== undefined) payload.inactivity_threshold_days = userData.inactivity_threshold_days;

      const { data } = await api.patch(`/users/${userId}`, payload);
      return {
        data: data.data as any as User,
      isSuccessful: true,
      errors: [],
      responseMessage: 'User updated successfully',
      responseCode: 'SUCCESS'
    };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'user', description: error?.response?.data?.message || 'Failed to update user' }],
        responseMessage: 'Failed to update user',
        responseCode: 'UPDATE_ERROR'
      };
    }
  },
};