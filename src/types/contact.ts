import { StandardApiResponse, PaginatedResponse, PaginationRequest, DatabaseRow } from './common';

export interface Contact extends DatabaseRow {
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  verified: boolean;
  timestamp: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  verified?: boolean;
}

export interface GetContactsRequest extends PaginationRequest {
  user_id?: string;
  role?: string;
  verified?: boolean;
}

export interface GetContactsResponse extends PaginatedResponse<Contact> {}

export interface GetContactByIdResponse extends StandardApiResponse<Contact> {}

export interface CreateContactResponse extends StandardApiResponse<Contact> {}

export interface UpdateContactResponse extends StandardApiResponse<Contact> {}

export interface VerifyContactRequest {
  contact_id: string;
}

export interface VerifyContactResponse extends StandardApiResponse<Contact> {}