import { supabase } from '@/lib/supabase';
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
import { StandardApiResponse } from '@/types/common';
import { NotificationHelper } from '@/utils/notificationHelper';

export const contactService = {
  async getContacts(payload: GetContactsRequest): Promise<GetContactsResponse> {
    const { pageSize, pageNumber, user_id, role, verified, searchParams } = payload;
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (verified !== undefined) {
      query = query.eq('verified', verified);
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
        errors: [{ field: 'contacts', description: error.message }],
        responseMessage: 'Failed to fetch contacts',
        responseCode: 'FETCH_ERROR'
      };
    }

    return {
      data: data as Contact[],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      isSuccessful: true,
      errors: [],
      responseMessage: 'Contacts retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

  async getContactById(contactId: string): Promise<GetContactByIdResponse> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error.message }],
        responseMessage: 'Failed to fetch contact',
        responseCode: 'FETCH_ERROR'
      };
    }

    return {
      data: data as Contact,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Contact retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

  async createContact(userId: string, contactData: CreateContactRequest): Promise<CreateContactResponse> {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...contactData, user_id: userId }])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error.message }],
        responseMessage: 'Failed to create contact',
        responseCode: 'CREATE_ERROR'
      };
    }

    const contact = data as Contact;

    // 🔥 Log activity - Contact Added
    try {
      await NotificationHelper.logContactAdded(
        userId, 
        contact.id, 
        contact.name, 
        contact.role
      );
    } catch (logError) {
      console.warn('Failed to log contact creation activity:', logError);
    }

    return {
      data: contact,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Contact created successfully',
      responseCode: 'SUCCESS'
    };
  },

  async updateContact(contactId: string, contactData: UpdateContactRequest): Promise<UpdateContactResponse> {
    // Get current contact data for logging
    const { data: currentContact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    const { data, error } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', contactId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error.message }],
        responseMessage: 'Failed to update contact',
        responseCode: 'UPDATE_ERROR'
      };
    }

    const updatedContact = data as Contact;

    // 🔥 Log activity - Contact Updated
    if (currentContact) {
      try {
        await NotificationHelper.logActivity(
          currentContact.user_id,
          'contact_updated',
          {
            contactId: updatedContact.id,
            contactName: updatedContact.name
          }
        );
      } catch (logError) {
        console.warn('Failed to log contact update activity:', logError);
      }
    }

    return {
      data: updatedContact,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Contact updated successfully',
      responseCode: 'SUCCESS'
    };
  },

  async deleteContact(contactId: string): Promise<StandardApiResponse<null>> {
    // Get contact data before deletion for logging
    const { data: contactToDelete } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error.message }],
        responseMessage: 'Failed to delete contact',
        responseCode: 'DELETE_ERROR'
      };
    }

    // 🔥 Log activity - Contact Deleted
    if (contactToDelete) {
      try {
        await NotificationHelper.logActivity(
          contactToDelete.user_id,
          'contact_deleted',
          {
            contactName: contactToDelete.name
          }
        );
      } catch (logError) {
        console.warn('Failed to log contact deletion activity:', logError);
      }
    }

    return {
      data: null,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Contact deleted successfully',
      responseCode: 'SUCCESS'
    };
  },

  async verifyContact(payload: VerifyContactRequest): Promise<VerifyContactResponse> {
    const { data, error } = await supabase
      .from('contacts')
      .update({ verified: true })
      .eq('id', payload.contact_id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'contact', description: error.message }],
        responseMessage: 'Failed to verify contact',
        responseCode: 'UPDATE_ERROR'
      };
    }

    const contact = data as Contact;

    // 🔥 Log activity - Contact Verified
    try {
      await NotificationHelper.logActivity(
        contact.user_id,
        'contact_updated',
        {
          contactId: contact.id,
          contactName: contact.name,
          action: 'verified'
        }
      );
    } catch (logError) {
      console.warn('Failed to log contact verification activity:', logError);
    }

    return {
      data: contact,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Contact verified successfully',
      responseCode: 'SUCCESS'
    };
  }
};