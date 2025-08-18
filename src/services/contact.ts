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
import { NotificationHelper } from '@/utils/notificationHelper';

export const contactService = {
  async getContacts(payload: GetContactsRequest): Promise<GetContactsResponse> {
    const { pageSize, pageNumber, user_id, relationship, isVerified, searchParams } = payload;
    const params: any = { pageSize, pageNumber, user_id, relationship };
    if (typeof isVerified === 'boolean') params.isVerified = String(isVerified);
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
      // Capture the actual contact creation initiation time BEFORE making the API call
      const contactCreationInitiatedAt = new Date().toISOString();
      console.log('🔍 Contact creation initiated at:', contactCreationInitiatedAt);
      
      const { data } = await api.post('/contacts', { user_id: userId, ...contactData });
      
      // Log contact creation activity with the captured timestamp
      try {
        await NotificationHelper.logContactAdded(
          userId,
          data.data.id || data.data._id,
          contactData.fullName || contactData.email,
          contactData.relationship || 'contact',
          contactCreationInitiatedAt // Use the captured timestamp, not current time
        );
      } catch (logError) {
        console.warn('Failed to log contact creation activity:', logError);
      }
      
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
      // Capture the actual contact update initiation time BEFORE making the API call
      const contactUpdateInitiatedAt = new Date().toISOString();
      console.log('🔍 Contact update initiated at:', contactUpdateInitiatedAt);
      
      const { data } = await api.patch(`/contacts/${contactId}`, contactData);
      
      // Log contact update activity with the captured timestamp
      try {
        await NotificationHelper.logActivity(
          data.data.user_id || 'unknown',
          'contact_updated',
          {
            contactId: contactId,
            contactName: contactData.fullName || data.data.fullName || 'Unknown Contact',
            timestamp: contactUpdateInitiatedAt // Use the captured timestamp, not current time
          }
        );
      } catch (logError) {
        console.warn('Failed to log contact update activity:', logError);
      }
      
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
      // Capture the actual contact deletion initiation time BEFORE making the API call
      const contactDeletionInitiatedAt = new Date().toISOString();
      console.log('🔍 Contact deletion initiated at:', contactDeletionInitiatedAt);
      
      // Fetch contact details before deletion for logging
      let contactName = 'Unknown Contact';
      let userId = 'unknown';
      try {
        const { data: contactData } = await api.get(`/contacts/${contactId}`);
        contactName = contactData?.data?.fullName || contactData?.data?.email || 'Unknown Contact';
        userId = contactData?.data?.user_id || 'unknown';
      } catch (fetchError) {
        console.warn('Failed to fetch contact details for logging:', fetchError);
      }
      
      await api.delete(`/contacts/${contactId}`);
      
      // Log contact deletion activity with the captured timestamp
      try {
        await NotificationHelper.logActivity(
          userId,
          'contact_deleted',
          { 
            contactName,
            timestamp: contactDeletionInitiatedAt // Use the captured timestamp, not current time
          }
        );
      } catch (logError) {
        console.warn('Failed to log contact deletion activity:', logError);
      }
      
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