export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ApiError {
  field: string;
  description: string;
}

export interface StandardApiResponse<T = any> {
  data: T;
  isSuccessful: boolean;
  errors: ApiError[];
  responseMessage: string;
  responseCode: string;
}

export interface PaginationRequest {
  pageSize: number;
  pageNumber: number;
  searchParams?: Record<string, string>;
}

export interface PaginatedResponse<T> extends StandardApiResponse<T[]> {
  totalCount: number;
  totalPages: number;
}

export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}