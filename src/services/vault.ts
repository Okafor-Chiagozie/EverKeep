import { supabase } from '@/lib/supabase';
import {
  Vault,
  VaultEntry,
  VaultItem,
  VaultRecipient,
  CreateVaultRequest,
  UpdateVaultRequest,
  CreateVaultEntryRequest,
  CreateVaultItemRequest,
  AddVaultRecipientRequest,
  GetVaultsRequest,
  GetVaultsResponse,
  GetVaultByIdResponse,
  GetVaultEntriesResponse,
  GetVaultItemsResponse,
  GetVaultRecipientsResponse,
  CreateVaultResponse,
  InactiveVaultResult
} from '@/types/vault';
import { StandardApiResponse } from '@/types/common';
import { NotificationHelper } from '@/utils/notificationHelper';
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
    const { pageSize, pageNumber, user_id, searchParams } = payload;
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('vaults')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('timestamp', { ascending: false });

    if (user_id) {
      query = query.eq('user_id', user_id);
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
        errors: [{ field: 'vaults', description: error.message }],
        responseMessage: 'Failed to fetch vaults',
        responseCode: 'FETCH_ERROR'
      };
    }

    // Decrypt vault data
    const decryptedVaults = data?.map(vault => ({
      ...vault,
      name: user_id ? EncryptionUtils.safeDecrypt(vault.name, user_id, vault.id) : vault.name,
      description: vault.description && user_id ? EncryptionUtils.safeDecrypt(vault.description, user_id, vault.id) : vault.description
    })) || [];

    return {
      data: decryptedVaults as Vault[],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vaults retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

  async getVaultById(vaultId: string): Promise<GetVaultByIdResponse> {
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault', description: error.message }],
        responseMessage: 'Failed to fetch vault',
        responseCode: 'FETCH_ERROR'
      };
    }

    // Decrypt vault data
    const decryptedVault = {
      ...data,
      name: EncryptionUtils.safeDecrypt(data.name, data.user_id, vaultId),
      description: data.description ? EncryptionUtils.safeDecrypt(data.description, data.user_id, vaultId) : data.description
    };

    return {
      data: decryptedVault as Vault,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },

   async getVaultEntries(vaultId: string): Promise<GetVaultEntriesResponse> {
   const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('vault_id', vaultId)
      .order('timestamp', { ascending: false });

   if (error) {
      return {
         data: [],
         isSuccessful: false,
         errors: [{ field: 'vault_entries', description: error.message }],
         responseMessage: 'Failed to fetch vault entries',
         responseCode: 'FETCH_ERROR'
      };
   }

   // Get vault info to get user_id for decryption
   const { data: vault } = await supabase
      .from('vaults')
      .select('user_id')
      .eq('id', vaultId)
      .single();

   if (!vault) {
      return {
         data: [],
         isSuccessful: false,
         errors: [{ field: 'vault', description: 'Vault not found' }],
         responseMessage: 'Vault not found',
         responseCode: 'NOT_FOUND'
      };
   }

   // Decrypt entries with better error handling
   const decryptedEntries = data?.map(entry => {
      let decryptedContent = entry.content;
      
      if (entry.content) {
         try {
         // For text entries, decrypt directly
         if (entry.type === 'text') {
            decryptedContent = EncryptionUtils.safeDecrypt(entry.content, vault.user_id, vaultId);
            console.log(`🔓 Decrypted text entry ${entry.id}:`, {
               original: entry.content.substring(0, 50) + '...',
               decrypted: decryptedContent.substring(0, 50) + '...'
            });
         } 
         // For media entries, the content might be JSON with Cloudinary URLs
         else {
            try {
               // Try to parse as JSON first (media entries)
               const parsedContent = JSON.parse(entry.content);
               if (parsedContent.cloudinaryUrl) {
               // This is already decrypted media metadata
               decryptedContent = entry.content;
               } else {
               // This might be encrypted JSON, try to decrypt
               decryptedContent = EncryptionUtils.safeDecrypt(entry.content, vault.user_id, vaultId);
               }
            } catch (parseError) {
               // Not JSON, treat as encrypted text
               decryptedContent = EncryptionUtils.safeDecrypt(entry.content, vault.user_id, vaultId);
            }
            
            console.log(`🔓 Processed media entry ${entry.id}:`, {
               type: entry.type,
               contentLength: entry.content.length,
               hasCloudinaryUrl: entry.content.includes('cloudinary')
            });
         }
         } catch (decryptionError) {
         console.error(`❌ Failed to decrypt entry ${entry.id}:`, decryptionError);
         // Keep original content if decryption fails
         decryptedContent = entry.content;
         }
      }

      return {
         ...entry,
         content: decryptedContent
      };
   }) || [];

   console.log(`📋 Retrieved ${decryptedEntries.length} entries for vault ${vaultId}`);

   return {
      data: decryptedEntries as VaultEntry[],
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault entries retrieved successfully',
      responseCode: 'SUCCESS'
   };
   },

   // Also add this debugging method to test decryption
   async testDecryption(vaultId: string, userId: string): Promise<void> {
   console.log('🧪 Testing decryption for vault:', vaultId);
   
   // Get a sample entry
   const { data: entries } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('vault_id', vaultId)
      .limit(1);

   if (entries && entries.length > 0) {
      const entry = entries[0];
      console.log('📝 Original entry:', {
         id: entry.id,
         type: entry.type,
         contentLength: entry.content?.length,
         contentPreview: entry.content?.substring(0, 100)
      });

      if (entry.content) {
         try {
         const decrypted = EncryptionUtils.safeDecrypt(entry.content, userId, vaultId);
         console.log('🔓 Decrypted content:', {
            success: true,
            decryptedLength: decrypted.length,
            decryptedPreview: decrypted.substring(0, 100),
            isEncrypted: EncryptionUtils.isEncrypted(entry.content)
         });
         } catch (error) {
         console.error('❌ Decryption test failed:', error);
         }
      }
   }
   },

  async getVaultItems(vaultId: string): Promise<GetVaultItemsResponse> {
    // Return empty array since vault_items table doesn't exist in current schema
    return {
      data: [],
      isSuccessful: true,
      errors: [],
      responseMessage: 'No vault items (table does not exist in current schema)',
      responseCode: 'SUCCESS'
    };
  },

  async getVaultRecipients(vaultId: string): Promise<GetVaultRecipientsResponse> {
    const { data, error } = await supabase
      .from('vault_recipients')
      .select(`
        *,
        contacts:contact_id (
          id,
          name,
          email,
          phone,
          role,
          verified
        )
      `)
      .eq('vault_id', vaultId)
      .order('timestamp', { ascending: false });

    if (error) {
      return {
        data: [],
        isSuccessful: false,
        errors: [{ field: 'vault_recipients', description: error.message }],
        responseMessage: 'Failed to fetch vault recipients',
        responseCode: 'FETCH_ERROR'
      };
    }

    return {
      data: data as VaultRecipient[],
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault recipients retrieved successfully',
      responseCode: 'SUCCESS'
    };
  },
  

  // ========================================
  // WRITE OPERATIONS (With activity logging)
  // ========================================

  async createVault(userId: string, vaultData: CreateVaultRequest): Promise<CreateVaultResponse> {
    // Encrypt vault data before storing
    const encryptedData = {
      ...vaultData,
      name: EncryptionUtils.encryptText(vaultData.name, userId, 'temp-id'), // We'll update this after getting real ID
      description: vaultData.description ? EncryptionUtils.encryptText(vaultData.description, userId, 'temp-id') : undefined,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('vaults')
      .insert([{ ...encryptedData, user_id: userId }])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault', description: error.message }],
        responseMessage: 'Failed to create vault',
        responseCode: 'CREATE_ERROR'
      };
    }

    const vault = data as Vault;

    // Re-encrypt with proper vault ID
    const properlyEncryptedData = {
      name: EncryptionUtils.encryptText(vaultData.name, userId, vault.id),
      description: vaultData.description ? EncryptionUtils.encryptText(vaultData.description, userId, vault.id) : undefined
    };

    // Update with properly encrypted data
    const { data: updatedData } = await supabase
      .from('vaults')
      .update(properlyEncryptedData)
      .eq('id', vault.id)
      .select()
      .single();

    const finalVault = updatedData || vault;

    // 🔥 Log activity - Vault Created
    try {
      await NotificationHelper.logVaultCreated(userId, finalVault.id, vaultData.name);
    } catch (logError) {
      console.warn('Failed to log vault creation activity:', logError);
    }

    // Return decrypted data to client
    return {
      data: {
        ...finalVault,
        name: vaultData.name, // Return original unencrypted name
        description: vaultData.description
      } as Vault,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault created successfully',
      responseCode: 'SUCCESS'
    };
  },

  async createVaultEntry(entryData: CreateVaultEntryRequest): Promise<StandardApiResponse<VaultEntry>> {
  // Get vault info to get user_id for encryption
  const { data: vault } = await supabase
    .from('vaults')
    .select('user_id')
    .eq('id', entryData.vault_id)
    .single();

  if (!vault) {
    return {
      data: null,
      isSuccessful: false,
      errors: [{ field: 'vault', description: 'Vault not found' }],
      responseMessage: 'Vault not found',
      responseCode: 'NOT_FOUND'
    };
  }

  // 🔥 FIXED: Only encrypt if content is not already encrypted
  let processedContent = entryData.content;
  
  if (entryData.content) {
    console.log('🔍 Processing content for encryption:', {
      contentLength: entryData.content.length,
      contentPreview: entryData.content.substring(0, 100),
      isAlreadyEncrypted: EncryptionUtils.isEncrypted(entryData.content)
    });

    // Only encrypt if the content is not already encrypted
    if (!EncryptionUtils.isEncrypted(entryData.content)) {
      processedContent = EncryptionUtils.encryptText(entryData.content, vault.user_id, entryData.vault_id);
      console.log('🔒 Content encrypted:', {
        originalLength: entryData.content.length,
        encryptedLength: processedContent.length
      });
    } else {
      console.log('⚠️ Content already encrypted, skipping encryption');
      processedContent = entryData.content;
    }
  }

  const { data, error } = await supabase
    .from('vault_entries')
    .insert([{
      ...entryData,
      content: processedContent // Use processed content
    }])
    .select()
    .single();

  if (error) {
    return {
      data: null,
      isSuccessful: false,
      errors: [{ field: 'vault_entry', description: error.message }],
      responseMessage: 'Failed to create vault entry',
      responseCode: 'CREATE_ERROR'
    };
  }

  const entry = data as VaultEntry;

  // Get vault info for logging
  const { data: vaultInfo } = await supabase
    .from('vaults')
    .select('name, user_id')
    .eq('id', entry.vault_id)
    .single();

  // 🔥 Log activity - Entry Added
  if (vaultInfo) {
    try {
      if (entry.type === 'text') {
        await NotificationHelper.logEntryAdded(
          vaultInfo.user_id,
          entry.vault_id,
          EncryptionUtils.safeDecrypt(vaultInfo.name, vaultInfo.user_id, entry.vault_id),
          'message',
          entry.id
        );
      } else {
        // For media files, extract filename from content
        let fileName = 'file';
        let fileSize: number | undefined;
        try {
          // 🔥 FIXED: Safely decrypt content before parsing
          const decryptedContent = EncryptionUtils.safeDecrypt(entry.content || '{}', vault.user_id, entry.vault_id);
          const contentData = JSON.parse(decryptedContent);
          fileName = contentData.filename || 'file';
          fileSize = contentData.size;
        } catch {
          // If parsing fails, use default filename
        }

        await NotificationHelper.logFileUploaded(
          vaultInfo.user_id,
          entry.vault_id,
          EncryptionUtils.safeDecrypt(vaultInfo.name, vaultInfo.user_id, entry.vault_id),
          fileName,
          entry.type,
          fileSize
        );
      }
    } catch (logError) {
      console.warn('Failed to log entry creation activity:', logError);
    }
  }

  // 🔥 FIXED: Return with ORIGINAL unencrypted content for immediate display
  return {
    data: {
      ...entry,
      content: entryData.content // Return original unencrypted content to the UI
    } as VaultEntry,
    isSuccessful: true,
    errors: [],
    responseMessage: 'Vault entry created successfully',
    responseCode: 'SUCCESS'
  };
},

  async deleteVaultEntry(entryId: string): Promise<StandardApiResponse<null>> {
    // Get entry data before deletion for logging
    const { data: entryToDelete } = await supabase
      .from('vault_entries')
      .select(`
        *,
        vaults!inner(
          name,
          user_id
        )
      `)
      .eq('id', entryId)
      .single();

    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault_entry', description: error.message }],
        responseMessage: 'Failed to delete vault entry',
        responseCode: 'DELETE_ERROR'
      };
    }

    // 🔥 Log activity - Entry Deleted
    if (entryToDelete && entryToDelete.vaults) {
      try {
        await NotificationHelper.logActivity(
          entryToDelete.vaults.user_id,
          'entry_deleted',
          {
            vaultId: entryToDelete.vault_id,
            vaultName: entryToDelete.vaults.name,
            entryType: entryToDelete.type
          }
        );
      } catch (logError) {
        console.warn('Failed to log entry deletion activity:', logError);
      }
    }

    return {
      data: null,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault entry deleted successfully',
      responseCode: 'SUCCESS'
    };
  },

  async createVaultItem(itemData: CreateVaultItemRequest): Promise<StandardApiResponse<VaultItem>> {
    // This table doesn't exist in your schema, so return an error
    return {
      data: null,
      isSuccessful: false,
      errors: [{ field: 'vault_item', description: 'vault_items table does not exist in current schema' }],
      responseMessage: 'Cannot create vault item - table does not exist',
      responseCode: 'TABLE_NOT_EXISTS'
    };
  },

  async addVaultRecipient(recipientData: AddVaultRecipientRequest): Promise<StandardApiResponse<VaultRecipient>> {
    const { data, error } = await supabase
      .from('vault_recipients')
      .insert([recipientData])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault_recipient', description: error.message }],
        responseMessage: 'Failed to add vault recipient',
        responseCode: 'CREATE_ERROR'
      };
    }

    const recipient = data as VaultRecipient;

    // Get vault and contact info for logging
    const [vaultResponse, contactResponse] = await Promise.all([
      supabase.from('vaults').select('name, user_id').eq('id', recipientData.vault_id).single(),
      supabase.from('contacts').select('name').eq('id', recipientData.contact_id).single()
    ]);

    // 🔥 Log activity - Recipient Added
    if (vaultResponse.data && contactResponse.data) {
      try {
        await NotificationHelper.logActivity(
          vaultResponse.data.user_id,
          'recipient_added',
          {
            vaultId: recipientData.vault_id,
            vaultName: vaultResponse.data.name,
            contactId: recipientData.contact_id,
            contactName: contactResponse.data.name
          }
        );
      } catch (logError) {
        console.warn('Failed to log recipient addition activity:', logError);
      }
    }

    return {
      data: recipient,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault recipient added successfully',
      responseCode: 'SUCCESS'
    };
  },

  async removeVaultRecipient(recipientId: string): Promise<StandardApiResponse<null>> {
    // Get recipient data before deletion for logging
    const { data: recipientToRemove } = await supabase
      .from('vault_recipients')
      .select(`
        *,
        vaults!inner(
          name,
          user_id
        ),
        contacts!inner(
          name
        )
      `)
      .eq('id', recipientId)
      .single();

    const { error } = await supabase
      .from('vault_recipients')
      .delete()
      .eq('id', recipientId);

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault_recipient', description: error.message }],
        responseMessage: 'Failed to remove vault recipient',
        responseCode: 'DELETE_ERROR'
      };
    }

    // 🔥 Log activity - Recipient Removed
    if (recipientToRemove && recipientToRemove.vaults && recipientToRemove.contacts) {
      try {
        await NotificationHelper.logActivity(
          recipientToRemove.vaults.user_id,
          'recipient_removed',
          {
            vaultId: recipientToRemove.vault_id,
            vaultName: recipientToRemove.vaults.name,
            contactName: recipientToRemove.contacts.name
          }
        );
      } catch (logError) {
        console.warn('Failed to log recipient removal activity:', logError);
      }
    }

    return {
      data: null,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault recipient removed successfully',
      responseCode: 'SUCCESS'
    };
  },

  async checkInactiveUsersAndTriggerDelivery(): Promise<StandardApiResponse<InactiveVaultResult[]>> {
    const { data, error } = await supabase
      .rpc('check_inactive_users_and_trigger_delivery');

    if (error) {
      return {
        data: [],
        isSuccessful: false,
        errors: [{ field: 'inactive_check', description: error.message }],
        responseMessage: 'Failed to check inactive users',
        responseCode: 'RPC_ERROR'
      };
    }

    // 🔥 Log activity - System Check
    try {
      if (data && data.length > 0) {
        // Log system activity for inactive user detection
        for (const result of data) {
          await NotificationHelper.logActivity(
            result.user_id,
            'system_event',
            {
              title: 'Vault delivery triggered',
              description: `Vault delivery initiated due to ${result.days_inactive} days of inactivity`,
              metadata: {
                vaultId: result.vault_id,
                daysInactive: result.days_inactive,
                triggerReason: 'user_inactivity'
              }
            }
          );
        }
      }
    } catch (logError) {
      console.warn('Failed to log inactive user check activity:', logError);
    }

    return {
      data: data as InactiveVaultResult[],
      isSuccessful: true,
      errors: [],
      responseMessage: 'Inactive users check completed successfully',
      responseCode: 'SUCCESS'
    };
  },

  // ========================================
  // SHARE LINK OPERATIONS
  // ========================================

  async generateShareLink(vaultId: string, userId: string): Promise<StandardApiResponse<string>> {
    try {
      const token = EncryptionUtils.generateShareToken(userId, vaultId);
      const shareLink = `${window.location.origin}/vault/share/${token}`;
      
      return {
        data: shareLink,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Share link generated successfully',
        responseCode: 'SUCCESS'
      };
    } catch (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'share', description: 'Failed to generate share link' }],
        responseMessage: 'Failed to generate share link',
        responseCode: 'SHARE_ERROR'
      };
    }
  },

  async getSharedVault(token: string, vaultId: string, userId: string): Promise<GetVaultByIdResponse> {
    try {
      // Verify token (simplified - in production you'd want more robust verification)
      const tokenData = EncryptionUtils.verifyShareToken(token);
      if (!tokenData) {
        return {
          data: null,
          isSuccessful: false,
          errors: [{ field: 'token', description: 'Invalid share token' }],
          responseMessage: 'Invalid share token',
          responseCode: 'INVALID_TOKEN'
        };
      }

      // Get vault data
      const vaultResponse = await this.getVaultById(vaultId);
      return vaultResponse;
    } catch (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'share', description: 'Failed to access shared vault' }],
        responseMessage: 'Failed to access shared vault',
        responseCode: 'SHARE_ERROR'
      };
    }
  },

  // ... (include all other existing methods like updateVault, deleteVault, etc.)
  // For brevity, I'm showing the key encrypted methods. The rest remain the same.
};