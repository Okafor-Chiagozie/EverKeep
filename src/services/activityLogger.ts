// Central service that wraps all enhanced services for easy import
import { contactService } from './contact';
import { vaultService } from './vault';
import { authService } from './auth';
import { NotificationHelper } from '@/utils/notificationHelper';

export const activityLogger = {
  // Contact operations with logging
  contacts: {
    async create(userId: string, contactData: any) {
      return contactService.createContact(userId, contactData);
    },

    async update(contactId: string, contactData: any) {
      return contactService.updateContact(contactId, contactData);
    },

    async delete(contactId: string) {
      return contactService.deleteContact(contactId);
    },

    async verify(payload: any) {
      return contactService.verifyContact(payload);
    },

    // Non-logged operations (just reading data)
    async getAll(payload: any) {
      return contactService.getContacts(payload);
    },

    async getById(contactId: string) {
      return contactService.getContactById(contactId);
    }
  },

  // Vault operations with logging
  vaults: {
    async create(userId: string, vaultData: any) {
      return vaultService.createVault(userId, vaultData);
    },

    async update(vaultId: string, vaultData: any) {
      return vaultService.updateVault(vaultId, vaultData);
    },

    async delete(vaultId: string) {
      return vaultService.deleteVault(vaultId);
    },

    async createEntry(entryData: any) {
      return vaultService.createVaultEntry(entryData);
    },

    async deleteEntry(entryId: string) {
      return vaultService.deleteVaultEntry(entryId);
    },

    async addRecipient(recipientData: any) {
      return vaultService.addVaultRecipient(recipientData);
    },

    async removeRecipient(recipientId: string) {
      return vaultService.removeVaultRecipient(recipientId);
    },

    // Non-logged operations (just reading data)
    async getAll(payload: any) {
      return vaultService.getVaults(payload);
    },

    async getById(vaultId: string) {
      return vaultService.getVaultById(vaultId);
    },

    async getEntries(vaultId: string) {
      return vaultService.getVaultEntries(vaultId);
    },

    async getRecipients(vaultId: string) {
      return vaultService.getVaultRecipients(vaultId);
    }
  },

  // Auth operations with logging
  auth: {
    async login(credentials: any, metadata?: any) {
      return authService.login(credentials, metadata);
    },

    async register(userData: any) {
      return authService.register(userData);
    },

    async logout() {
      return authService.logout();
    },

    async getCurrentUser() {
      return authService.getCurrentUser();
    },

    getClientMetadata() {
      return authService.getClientMetadata();
    }
  },

  // Custom activity logging
  async logCustomActivity(userId: string, title: string, description: string, type: string = 'system_event', metadata?: any) {
    try {
      await NotificationHelper.logActivity(userId, type as any, {
        title,
        description,
        metadata
      });
    } catch (error) {
      console.warn('Failed to log custom activity:', error);
    }
  },

  // Security event logging
  async logSecurityEvent(userId: string, description: string, metadata?: any) {
    try {
      await NotificationHelper.logActivity(userId, 'security_check', {
        description,
        metadata
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  },

  // System event logging
  async logSystemEvent(userId: string, title: string, description: string, metadata?: any) {
    try {
      await NotificationHelper.logActivity(userId, 'system_event', {
        title,
        description,
        metadata
      });
    } catch (error) {
      console.warn('Failed to log system event:', error);
    }
  }
};

// Export individual services for direct use if needed
export { contactService, vaultService, authService };