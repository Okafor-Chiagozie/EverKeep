import { api } from '@/lib/api';
import {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  GetContactsRequest,
  GetContactsResponse,
  GetContactByIdResponse,
  CreateContactResponse,
  UpdateContactResponse,
  VerifyContactRequest,
  VerifyContactResponse
} from '@/types/contact';

export const contactService = {
  async getContacts(payload: GetContactsRequest): Promise<GetContactsResponse> {
    const { pageSize, pageNumber, user_id, role, verified, searchParams } = payload;
    const params: any = { pageSize, pageNumber, user_id, role };
    if (typeof verified === 'boolean') params.verified = String(verified);
    if (searchParams) Object.assign(params, searchParams);

    try {
      const { data } = await api.get('/contacts', { params });
      return {
        data: data.data as Contact[],
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 0,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Contacts retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: [],
        totalCount: 0,
        totalPages: 0,
        isSuccessful: false,
        errors: [{ field: 'contacts', description: error?.response?.data?.message || 'Failed to fetch contacts' }],
        responseMessage: 'Failed to fetch contacts',
        responseCode: 'FETCH_ERROR'
      };
    }
  },

  async getContactById(contactId: string): Promise<GetContactByIdResponse> {
    try {
      const { data } = await api.get(`/contacts/${contactId}`);
      return {
        data: data.data as Contact,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Contact retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error?.response?.data?.message || 'Failed to fetch contact' }],
        responseMessage: 'Failed to fetch contact',
        responseCode: 'FETCH_ERROR'
      };
    }
  },

  async createContact(userId: string, contactData: CreateContactRequest): Promise<CreateContactResponse> {
    try {
      const { data } = await api.post('/contacts', { user_id: userId, ...contactData });
      return {
        data: data.data as Contact,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Contact created successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error?.response?.data?.message || 'Failed to create contact' }],
        responseMessage: 'Failed to create contact',
        responseCode: 'CREATE_ERROR'
      };
    }
  },

  async updateContact(contactId: string, contactData: UpdateContactRequest): Promise<UpdateContactResponse> {
    try {
      const { data } = await api.patch(`/contacts/${contactId}`, contactData);
      return {
        data: data.data as Contact,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Contact updated successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error?.response?.data?.message || 'Failed to update contact' }],
        responseMessage: 'Failed to update contact',
        responseCode: 'UPDATE_ERROR'
      };
    }
  },

  async deleteContact(contactId: string) {
      try {
      await api.delete(`/contacts/${contactId}`);
    return {
        data: null,
      isSuccessful: true,
      errors: [],
        responseMessage: 'Contact deleted successfully',
      responseCode: 'SUCCESS'
    };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error?.response?.data?.message || 'Failed to delete contact' }],
        responseMessage: 'Failed to delete contact',
        responseCode: 'DELETE_ERROR'
      };
    }
  },

  async verifyContact(payload: VerifyContactRequest): Promise<VerifyContactResponse> {
    try {
      const { data } = await api.post(`/contacts/${payload.contact_id}/verify`);
      return {
        data: data.data as Contact,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Contact verified successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error?.response?.data?.message || 'Failed to verify contact' }],
        responseMessage: 'Failed to verify contact',
        responseCode: 'UPDATE_ERROR'
      };
    }
  }
};