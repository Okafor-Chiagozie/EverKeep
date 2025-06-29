import { StandardApiResponse, PaginatedResponse, PaginationRequest, DatabaseRow } from './common';

export interface User extends DatabaseRow {
  email: string;
  phone: string;
  isVerified: boolean;
  full_name: string;
  last_login: string;
  inactivity_threshold_days: number;
}

export interface CreateUserRequest {
  email: string;
  phone: string;
  full_name: string;
  inactivity_threshold_days?: number;
}

export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  full_name?: string;
  inactivity_threshold_days?: number;
}

export interface GetAllUsersRequest extends PaginationRequest {}

export interface GetAllUsersResponse extends PaginatedResponse<User> {}

export interface GetUserByIdResponse extends StandardApiResponse<User> {}

export interface CreateUserResponse extends StandardApiResponse<User> {}

export interface UpdateUserResponse extends StandardApiResponse<User> {}

export interface UpdateUserActivityRequest {
  user_uuid: string;
  activity_type: string;
  activity_details?: Record<string, any>;
}