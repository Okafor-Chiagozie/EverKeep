import { api } from '@/lib/api';
import {
  Vault,
  VaultEntry,
  VaultRecipient,
  CreateVaultRequest,
  CreateVaultEntryRequest,
  UpdateVaultRequest,
  AddVaultRecipientRequest,
  GetVaultsRequest,
  GetVaultsResponse,
  GetVaultByIdResponse,
  GetVaultEntriesResponse,
  GetVaultRecipientsResponse,
  CreateVaultResponse
} from '@/types/vault';
import { StandardApiResponse } from '@/types/common';
import EncryptionUtils from '@/utils/encryptionUtils';

interface VaultDeletionStats {
  entriesDeleted: number;
  itemsDeleted: number;
  recipientsDeleted: number;
  cloudinaryFiles: string[];
}

export const vaultService = {
  // ========================================
  // READ OPERATIONS (No logging needed)
  // ========================================
   async getVaults(payload: GetVaultsRequest): Promise<GetVaultsResponse> {
    const params: any = { pageSize: payload.pageSize, pageNumber: payload.pageNumber };
    if (payload.user_id) params.user_id = payload.user_id;
    if (payload.searchParams) Object.assign(params, payload.searchParams);

    try {
      const { data } = await api.get('/vaults', { params });
      return {
        data: data.data as Vault[],
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 0,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vaults retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: [],
        totalCount: 0,
        totalPages: 0,
        isSuccessful: false,
        errors: [{ field: 'vaults', description: error?.response?.data?.message || 'Failed to fetch vaults' }],
        responseMessage: 'Failed to fetch vaults',
        responseCode: 'FETCH_ERROR'
      };
    }
  },

  async getVaultById(vaultId: string): Promise<GetVaultByIdResponse> {
    try {
      const { data } = await api.get(`/vaults/${vaultId}`);
      return {
        data: data.data as Vault,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault', description: error?.response?.data?.message || 'Failed to fetch vault' }],
        responseMessage: 'Failed to fetch vault',
        responseCode: 'FETCH_ERROR'
      };
    }
  },

   async getVaultEntries(vaultId: string): Promise<GetVaultEntriesResponse> {
    try {
      const { data } = await api.get(`/vaults/${vaultId}/entries`);
      return {
        data: data.data as VaultEntry[],
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault entries retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: [],
        isSuccessful: false,
        errors: [{ field: 'vault_entries', description: error?.response?.data?.message || 'Failed to fetch vault entries' }],
        responseMessage: 'Failed to fetch vault entries',
        responseCode: 'FETCH_ERROR'
      };
    }
   },

   // Also add this debugging method to test decryption
   async testDecryption(vaultId: string, userId: string): Promise<void> {
   console.log('🧪 Testing decryption for vault:', vaultId);
   
   // Get a sample entry
   const { data: entries } = await api.get(`/vaults/${vaultId}/entries`);

   if (entries && entries.data && entries.data.length > 0) {
      const entry = entries.data[0];
      console.log('📝 Original entry:', {
         id: entry.id,
         type: entry.type,
         contentLength: entry.content?.length,
         contentPreview: entry.content?.substring(0, 100)
      });

      // Decrypt content safely
      const decrypted = EncryptionUtils.safeDecrypt(entry.content, userId, vaultId);

      console.log('🔓 Decrypted content preview:', decrypted?.substring(0, 100));
   } else {
      console.log('No entries found for this vault');
   }
   },

  async createVault(vaultData: CreateVaultRequest): Promise<CreateVaultResponse> {
    try {
      // Encrypt vault name/description on client before sending (optional; server will also encrypt)
      const payload: any = { ...vaultData };

      const { data } = await api.post('/vaults', payload);
      return {
        data: data.data as Vault,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault created successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault', description: error?.response?.data?.message || 'Failed to create vault' }],
        responseMessage: 'Failed to create vault',
        responseCode: 'CREATE_ERROR'
      };
    }
  },

  async createVaultEntry(entryData: CreateVaultEntryRequest): Promise<StandardApiResponse<VaultEntry>> {
    try {
      const { data } = await api.post(`/vaults/${entryData.vault_id}/entries`, {
        type: entryData.type,
        content: entryData.content,
        parent_id: (entryData as any).parent_id,
      });
      return {
        data: data.data as VaultEntry,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault entry created successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault_entry', description: error?.response?.data?.message || 'Failed to create vault entry' }],
        responseMessage: 'Failed to create vault entry',
        responseCode: 'CREATE_ERROR'
      };
    }
  },

  async deleteVaultEntry(entryId: string): Promise<StandardApiResponse<null>> {
    try {
      await api.delete(`/vaults/entries/${entryId}`);
      return {
        data: null,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault entry deleted successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault_entry', description: error?.response?.data?.message || 'Failed to delete vault entry' }],
        responseMessage: 'Failed to delete vault entry',
        responseCode: 'DELETE_ERROR'
      };
    }
  },

  async getVaultRecipients(vaultId: string): Promise<GetVaultRecipientsResponse> {
    try {
      const { data } = await api.get(`/vaults/${vaultId}/recipients`);
      return {
        data: data.data as VaultRecipient[],
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault recipients retrieved successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: [],
        isSuccessful: false,
        errors: [{ field: 'vault_recipients', description: error?.response?.data?.message || 'Failed to fetch vault recipients' }],
        responseMessage: 'Failed to fetch vault recipients',
        responseCode: 'FETCH_ERROR'
      };
    }
  },

  async addVaultRecipient(recipientData: AddVaultRecipientRequest): Promise<StandardApiResponse<VaultRecipient>> {
    try {
      const { data } = await api.post(`/vaults/${recipientData.vault_id}/recipients`, {
        contact_id: recipientData.contact_id,
      });
      return {
        data: data.data as VaultRecipient,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault recipient added successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault_recipients', description: error?.response?.data?.message || 'Failed to add vault recipient' }],
        responseMessage: 'Failed to add vault recipient',
        responseCode: 'CREATE_ERROR'
      };
    }
  },

  async removeVaultRecipient(recipientId: string): Promise<StandardApiResponse<null>> {
    try {
      await api.delete(`/vaults/recipients/${recipientId}`);
      return {
        data: null,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault recipient removed successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error: any) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault_recipients', description: error?.response?.data?.message || 'Failed to remove vault recipient' }],
        responseMessage: 'Failed to remove vault recipient',
        responseCode: 'DELETE_ERROR'
      };
    }
  },

  async deleteVault(vaultId: string): Promise<StandardApiResponse<VaultDeletionStats>> {
   try {
      // Fetch entries to gather Cloudinary publicIds and counts
      const { data: entries } = await api.get(`/vaults/${vaultId}/entries`);
      const cloudinaryFiles: string[] = [];

      if (entries?.data?.length) {
         for (const entry of entries.data) {
            try {
               const parsed = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
               if (parsed?.publicId) cloudinaryFiles.push(parsed.publicId);
            } catch (_) {
               // ignore JSON parse errors
            }
         }
      }

      // Step 1: Delete Cloudinary files via backend
      for (const publicId of cloudinaryFiles) {
         try {
            await api.delete(`/media/${publicId}`);
         } catch (err) {
            console.warn('Failed to delete Cloudinary asset:', publicId, err);
         }
      }

      // Step 2: Delete vault entries (handled internally by backend)
      // The backend will automatically mark all entries as deleted when deleting the vault

      // Step 3: Delete the vault itself
      try {
        await api.delete(`/vaults/${vaultId}`);
      } catch (deleteVaultError: any) {
         console.error('❌ Failed to delete vault:', deleteVaultError);
         return {
         data: null,
         isSuccessful: false,
         errors: [{ field: 'vault', description: deleteVaultError?.response?.data?.message || 'Failed to delete vault' }],
         responseMessage: 'Failed to delete vault',
         responseCode: 'DELETE_ERROR'
         };
      }

      console.log('✅ Vault deletion completed successfully');

      // Return deletion statistics
      return {
         data: {
         entriesDeleted: entries?.data?.length || 0,
         itemsDeleted: 0, // vault_items table doesn't exist in your schema
         recipientsDeleted: 0, // We don't track this count, but deletion was successful
         cloudinaryFiles
         },
         isSuccessful: true,
         errors: [],
         responseMessage: 'Vault deleted successfully',
         responseCode: 'SUCCESS'
      };

   } catch (error) {
      console.error('❌ Unexpected error during vault deletion:', error);
      return {
         data: null,
         isSuccessful: false,
         errors: [{ field: 'vault', description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
         responseMessage: 'An unexpected error occurred during deletion',
         responseCode: 'UNEXPECTED_ERROR'
      };
   }
   },

   // Also add the missing updateVault method if it doesn't exist
   async updateVault(vaultId: string, vaultData: UpdateVaultRequest): Promise<StandardApiResponse<Vault>> {
   try {
      // Get current vault data for encryption
       const { data: currentVault } = await api.get(`/vaults/${vaultId}`);
       if (!currentVault) {
         return {
         data: null,
         isSuccessful: false,
         errors: [{ field: 'vault', description: 'Vault not found' }],
         responseMessage: 'Vault not found',
         responseCode: 'NOT_FOUND'
         };
      }

      // Encrypt the updated data
      const encryptedData: any = {};
      
      if (vaultData.name) {
         encryptedData.name = EncryptionUtils.encryptText(vaultData.name, currentVault.data.user_id, vaultId);
      }
      
      if (vaultData.description) {
         encryptedData.description = EncryptionUtils.encryptText(vaultData.description, currentVault.data.user_id, vaultId);
      }

      // Update the vault
       const { data } = await api.patch(`/vaults/${vaultId}`, encryptedData);

      // Return decrypted data to client
      const decryptedVault = {
         ...data,
         name: vaultData.name || EncryptionUtils.safeDecrypt(data.name, currentVault.data.user_id, vaultId),
         description: vaultData.description || (data.description ? EncryptionUtils.safeDecrypt(data.description, currentVault.data.user_id, vaultId) : null)
      };

      return {
         data: decryptedVault as Vault,
         isSuccessful: true,
         errors: [],
         responseMessage: 'Vault updated successfully',
         responseCode: 'SUCCESS'
      };

     } catch (error: any) {
      console.error('Error updating vault:', error);
      return {
         data: null,
         isSuccessful: false,
         errors: [{ field: 'vault', description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
         responseMessage: 'Failed to update vault',
         responseCode: 'UNEXPECTED_ERROR'
      };
   }
   }
};