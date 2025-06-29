import { supabase } from '@/lib/supabase';
import {
  Notification,
  CreateNotificationRequest,
  GetNotificationsRequest,
  GetNotificationsResponse,
  CreateNotificationResponse,
  MarkNotificationReadRequest
} from '@/types/notification';
import { StandardApiResponse } from '@/types/common';

export const notificationService = {
  async getNotifications(payload: GetNotificationsRequest): Promise<GetNotificationsResponse> {
    const { pageSize, pageNumber, user_id, searchParams } = payload;
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('timestamp', { ascending: false });

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

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
        errors: [{ field: 'notifications', description: error.message }],
        responseMessage: 'Failed to fetch notifications',
        responseCode: 'FETCH_ERROR'
      };
    }

    return {
      data: data as Notification[],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      isSuccessful: true,
      errors: [],
      responseMessage: 'Notifications retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

  async createNotification(notificationData: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'notification', description: error.message }],
        responseMessage: 'Failed to create notification',
        responseCode: 'CREATE_ERROR'
      };
    }

    return {
      data: data as Notification,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Notification created successfully',
      responseCode: 'SUCCESS'
    };
  },

  async deleteNotification(notificationId: string): Promise<StandardApiResponse<null>> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'notification', description: error.message }],
        responseMessage: 'Failed to delete notification',
        responseCode: 'DELETE_ERROR'
      };
    }

    return {
      data: null,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Notification deleted successfully',
      responseCode: 'SUCCESS'
    };
  },

  async getUserNotificationCount(userId: string): Promise<StandardApiResponse<number>> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      return {
        data: 0,
        isSuccessful: false,
        errors: [{ field: 'notifications', description: error.message }],
        responseMessage: 'Failed to get notification count',
        responseCode: 'FETCH_ERROR'
      };
    }

    return {
      data: count || 0,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Notification count retrieved successfully',
      responseCode: 'SUCCESS'
    };
  }
};