import { StandardApiResponse, PaginatedResponse, PaginationRequest, DatabaseRow } from './common';

export interface Notification extends DatabaseRow {
  user_id: string;
  title: string;
  content: string;
  timestamp: string; // This field is now properly populated from backend createdAt
}

export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  content: string;
  timestamp?: string; // Optional for creation
}

export interface GetNotificationsRequest extends PaginationRequest {
  user_id?: string;
}

export interface GetNotificationsResponse extends PaginatedResponse<Notification> {}

export interface CreateNotificationResponse extends StandardApiResponse<Notification> {}

export interface MarkNotificationReadRequest {
  notification_id: string;
}