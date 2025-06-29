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

    return {
      data: data as Vault[],
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

    return {
      data: data as Vault,
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

    return {
      data: data as VaultEntry[],
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault entries retrieved successfully',
      responseCode: 'SUCCESS'
    };
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
    const { data, error } = await supabase
      .from('vaults')
      .insert([{ ...vaultData, user_id: userId }])
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

    // 🔥 Log activity - Vault Created
    try {
      await NotificationHelper.logVaultCreated(userId, vault.id, vault.name);
    } catch (logError) {
      console.warn('Failed to log vault creation activity:', logError);
    }

    return {
      data: vault,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault created successfully',
      responseCode: 'SUCCESS'
    };
  },

  async updateVault(vaultId: string, vaultData: UpdateVaultRequest): Promise<StandardApiResponse<Vault>> {
    // Get current vault data for logging
    const { data: currentVault } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single();

    const { data, error } = await supabase
      .from('vaults')
      .update(vaultData)
      .eq('id', vaultId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault', description: error.message }],
        responseMessage: 'Failed to update vault',
        responseCode: 'UPDATE_ERROR'
      };
    }

    const updatedVault = data as Vault;

    // 🔥 Log activity - Vault Updated
    if (currentVault) {
      try {
        await NotificationHelper.logActivity(
          currentVault.user_id,
          'vault_updated',
          {
            vaultId: updatedVault.id,
            vaultName: updatedVault.name
          }
        );
      } catch (logError) {
        console.warn('Failed to log vault update activity:', logError);
      }
    }

    return {
      data: updatedVault,
      isSuccessful: true,
      errors: [],
      responseMessage: 'Vault updated successfully',
      responseCode: 'SUCCESS'
    };
  },

  async deleteVault(vaultId: string): Promise<StandardApiResponse<VaultDeletionStats>> {
    try {
      console.log('Starting vault deletion process for vault ID:', vaultId);

      // Step 1: Get vault data before deletion
      const { data: vaultToDelete } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', vaultId)
        .single();

      if (!vaultToDelete) {
        return {
          data: null,
          isSuccessful: false,
          errors: [{ field: 'vault', description: 'Vault not found' }],
          responseMessage: 'Vault not found',
          responseCode: 'NOT_FOUND'
        };
      }

      // Step 2: Get all vault entries to track Cloudinary files
      const entriesResponse = await this.getVaultEntries(vaultId);
      const cloudinaryFiles: string[] = [];
      
      if (entriesResponse.isSuccessful) {
        // Extract Cloudinary public IDs from media entries
        entriesResponse.data
          .filter(entry => entry.type !== 'text')
          .forEach(entry => {
            try {
              const contentData = JSON.parse(entry.content || '{}');
              if (contentData.publicId) {
                cloudinaryFiles.push(contentData.publicId);
              }
            } catch {
              // Skip malformed JSON
            }
          });
      }

      console.log('Found Cloudinary files to cleanup:', cloudinaryFiles);

      // Step 3: Get counts for deletion stats
      const [entriesCount, recipientsCount] = await Promise.all([
        supabase.from('vault_entries').select('id', { count: 'exact', head: true }).eq('vault_id', vaultId),
        supabase.from('vault_recipients').select('id', { count: 'exact', head: true }).eq('vault_id', vaultId)
      ]);

      console.log('Deletion counts:', {
        entries: entriesCount.count,
        recipients: recipientsCount.count
      });

      // Step 4: Delete vault entries (messages and media)
      console.log('Deleting vault entries...');
      const { error: entriesError } = await supabase
        .from('vault_entries')
        .delete()
        .eq('vault_id', vaultId);

      if (entriesError) {
        console.error('Failed to delete vault entries:', entriesError);
        return {
          data: null,
          isSuccessful: false,
          errors: [{ field: 'vault_entries', description: entriesError.message }],
          responseMessage: 'Failed to delete vault entries',
          responseCode: 'DELETE_ERROR'
        };
      }

      // Step 5: Delete vault recipients
      console.log('Deleting vault recipients...');
      const { error: recipientsError } = await supabase
        .from('vault_recipients')
        .delete()
        .eq('vault_id', vaultId);

      if (recipientsError) {
        console.error('Failed to delete vault recipients:', recipientsError);
        return {
          data: null,
          isSuccessful: false,
          errors: [{ field: 'vault_recipients', description: recipientsError.message }],
          responseMessage: 'Failed to delete vault recipients',
          responseCode: 'DELETE_ERROR'
        };
      }

      // Step 6: Finally delete the vault itself
      console.log('Deleting vault...');
      const { error: vaultError } = await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultId);

      if (vaultError) {
        console.error('Failed to delete vault:', vaultError);
        return {
          data: null,
          isSuccessful: false,
          errors: [{ field: 'vault', description: vaultError.message }],
          responseMessage: 'Failed to delete vault',
          responseCode: 'DELETE_ERROR'
        };
      }

      // Step 7: Create deletion statistics
      const stats: VaultDeletionStats = {
        entriesDeleted: entriesCount.count || 0,
        itemsDeleted: 0, // Set to 0 since vault_items table doesn't exist
        recipientsDeleted: recipientsCount.count || 0,
        cloudinaryFiles
      };

      console.log('Vault deletion completed successfully:', stats);

      // 🔥 Log activity - Vault Deleted
      try {
        await NotificationHelper.logVaultDeleted(
          vaultToDelete.user_id,
          vaultToDelete.name,
          entriesCount.count || 0
        );
      } catch (logError) {
        console.warn('Failed to log vault deletion activity:', logError);
      }

      return {
        data: stats,
        isSuccessful: true,
        errors: [],
        responseMessage: 'Vault and all related data deleted successfully',
        responseCode: 'SUCCESS'
      };

    } catch (error) {
      console.error('Unexpected error during vault deletion:', error);
      return {
        data: null,
        isSuccessful: false,
        errors: [{ field: 'vault', description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        responseMessage: 'Failed to delete vault due to unexpected error',
        responseCode: 'UNKNOWN_ERROR'
      };
    }
  },

  async createVaultEntry(entryData: CreateVaultEntryRequest): Promise<StandardApiResponse<VaultEntry>> {
    const { data, error } = await supabase
      .from('vault_entries')
      .insert([entryData])
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
    const { data: vault } = await supabase
      .from('vaults')
      .select('name, user_id')
      .eq('id', entry.vault_id)
      .single();

    // 🔥 Log activity - Entry Added
    if (vault) {
      try {
        if (entry.type === 'text') {
          await NotificationHelper.logEntryAdded(
            vault.user_id,
            entry.vault_id,
            vault.name,
            'message',
            entry.id
          );
        } else {
          // For media files, extract filename from content
          let fileName = 'file';
          let fileSize: number | undefined;
          try {
            const contentData = JSON.parse(entry.content || '{}');
            fileName = contentData.filename || 'file';
            fileSize = contentData.size;
          } catch {
            // If parsing fails, use default filename
          }

          await NotificationHelper.logFileUploaded(
            vault.user_id,
            entry.vault_id,
            vault.name,
            fileName,
            entry.type,
            fileSize
          );
        }
      } catch (logError) {
        console.warn('Failed to log entry creation activity:', logError);
      }
    }

    return {
      data: entry,
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
  }
};