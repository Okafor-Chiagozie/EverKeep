import { StandardApiResponse, PaginatedResponse, PaginationRequest, DatabaseRow } from './common';

export interface Contact extends DatabaseRow {
  user_id: string;
  fullName: string;
  email: string;
  phone: string | null;
  relationship: string;
  isVerified: boolean;
  timestamp: string;
}

export interface CreateContactRequest {
  fullName: string;
  email: string;
  phone?: string;
  relationship: string;
}

export interface UpdateContactRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  isVerified?: boolean;
}

export interface GetContactsRequest extends PaginationRequest {
  user_id?: string;
  relationship?: string;
  isVerified?: boolean;
}

export interface GetContactsResponse extends PaginatedResponse<Contact> {}

export interface GetContactByIdResponse extends StandardApiResponse<Contact> {}

export interface CreateContactResponse extends StandardApiResponse<Contact> {}

export interface UpdateContactResponse extends StandardApiResponse<Contact> {}

export interface VerifyContactRequest {
  contact_id: string;
}

export interface VerifyContactResponse extends StandardApiResponse<Contact> {}