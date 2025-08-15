import { api } from '@/lib/api';
import {
  Notification,
  CreateNotificationRequest,
  GetNotificationsRequest,
  GetNotificationsResponse,
  CreateNotificationResponse
} from '@/types/notification';
import { StandardApiResponse } from '@/types/common';

export const notificationService = {
  async getNotifications(payload: GetNotificationsRequest): Promise<GetNotificationsResponse> {
    const params: any = { pageSize: payload.pageSize, pageNumber: payload.pageNumber };
    if (payload.user_id) params.user_id = payload.user_id;
    if (payload.searchParams) Object.assign(params, payload.searchParams);

    try {
      const { data } = await api.get('/notifications', { params });
      return {
        data: data.data as Notification[],
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 0,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Notifications retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: [],
        totalCount: 0,
        totalPages: 0,
        isSuccessful: false,
        errors: [{ field: 'notifications', description: error?.response?.data?.message || 'Failed to fetch notifications' }],
        responseMessage: 'Failed to fetch notifications',
        responseCode: 'FETCH_ERROR'
      };
    }
  },

  async createNotification(notificationData: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    try {
      const { data } = await api.post('/notifications', notificationData);
      return {
        data: data.data as Notification,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Notification created successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'notification', description: error?.response?.data?.message || 'Failed to create notification' }],
        responseMessage: 'Failed to create notification',
        responseCode: 'CREATE_ERROR'
      };
    }
  },

  async deleteNotification(notificationId: string): Promise<StandardApiResponse<null>> {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return {
        data: null,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Notification deleted successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'notification', description: error?.response?.data?.message || 'Failed to delete notification' }],
        responseMessage: 'Failed to delete notification',
        responseCode: 'DELETE_ERROR'
      };
    }
  },

  async getUserNotificationCount(userId: string): Promise<StandardApiResponse<number>> {
    try {
      const { data } = await api.get('/notifications/count', { params: { user_id: userId } });
      return {
        data: data.data as number,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Notification count retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: 0,
        isSuccessful: false,
        errors: [{ field: 'notifications', description: error?.response?.data?.message || 'Failed to get notification count' }],
        responseMessage: 'Failed to get notification count',
        responseCode: 'FETCH_ERROR'
      };
    }
  }
};