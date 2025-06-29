import { supabase } from '@/lib/supabase';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  GetAllUsersRequest,
  GetAllUsersResponse,
  GetUserByIdResponse,
  CreateUserResponse,
  UpdateUserResponse,
  UpdateUserActivityRequest
} from '@/types/user';
import { StandardApiResponse } from '@/types/common';

export const userService = {
  async getAllUsers(payload: GetAllUsersRequest): Promise<GetAllUsersResponse> {
    const { pageSize, pageNumber, searchParams } = payload;
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to);

    // Apply search filters if provided
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          query = query.ilike(key, `%${value}%`);
        }
      });
    }

    const { data, error, count } = await query;

    if (error) {
      return {
        data: [],
        totalCount: 0,
        totalPages: 0,
        isSuccessful: false,
        errors: [{ field: 'users', description: error.message }],
        responseMessage: 'Failed to fetch users',
        responseCode: 'FETCH_ERROR'
      };
    }

    return {
      data: data as User[],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      isSuccessful: true,
      errors: [],
      responseMessage: 'Users retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

  async getUserById(userId: string): Promise<GetUserByIdResponse> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'user', description: error.message }],
        responseMessage: 'Failed to fetch user',
        responseCode: 'FETCH_ERROR'
      };
    }

    return {
      data: data as User,
      isSuccessful: true,
      errors: [],
      responseMessage: 'User retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'user', description: error.message }],
        responseMessage: 'Failed to create user',
        responseCode: 'CREATE_ERROR'
      };
    }

    return {
      data: data as User,
      isSuccessful: true,
      errors: [],
      responseMessage: 'User created successfully',
      responseCode: 'SUCCESS'
    };
  },

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'user', description: error.message }],
        responseMessage: 'Failed to update user',
        responseCode: 'UPDATE_ERROR'
      };
    }

    return {
      data: data as User,
      isSuccessful: true,
      errors: [],
      responseMessage: 'User updated successfully',
      responseCode: 'SUCCESS'
    };
  },

  async deleteUser(userId: string): Promise<StandardApiResponse<null>> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'user', description: error.message }],
        responseMessage: 'Failed to delete user',
        responseCode: 'DELETE_ERROR'
      };
    }

    return {
      data: null,
      isSuccessful: true,
      errors: [],
      responseMessage: 'User deleted successfully',
      responseCode: 'SUCCESS'
    };
  },

  async updateUserActivity(payload: UpdateUserActivityRequest): Promise<StandardApiResponse<null>> {
    const { error } = await supabase
      .rpc('update_user_activity', {
        user_uuid: payload.user_uuid,
        activity_type: payload.activity_type,
        activity_details: payload.activity_details
      });

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'activity', description: error.message }],
        responseMessage: 'Failed to update user activity',
        responseCode: 'UPDATE_ERROR'
      };
    }

    return {
      data: null,
      isSuccessful: true,
      errors: [],
      responseMessage: 'User activity updated successfully',
      responseCode: 'SUCCESS'
    };
  }
};