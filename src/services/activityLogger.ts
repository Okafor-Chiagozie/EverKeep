// Central service that wraps all enhanced services for easy import
import { contactService } from './contact';
import { vaultService } from './vault';
import { authService } from './auth';

export const activityLogger = {
  // Contact operations (delegates only; no client-side logging)
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

  // Vault operations (delegates only; no client-side logging)
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

  // Auth operations (delegates only; no client-side logging)
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

  // Stubbed client-side logging methods (no-op to avoid duplicates)
  async logCustomActivity(_userId: string, _title: string, _description: string, _type: string = 'system_event', _metadata?: any) {
    return;
  },

  async logSecurityEvent(_userId: string, _description: string, _metadata?: any) {
    return;
  },

  async logSystemEvent(_userId: string, _title: string, _description: string, _metadata?: any) {
    return;
  }
};

// Export individual services for direct use if needed
export { contactService, vaultService, authService };