import { notificationService } from '@/services/notification';
import { CreateNotificationRequest } from '@/types/notification';

export type ActivityType = 
  | 'vault_created'
  | 'vault_updated'
  | 'vault_deleted'
  | 'entry_added'
  | 'entry_deleted'
  | 'contact_added'
  | 'contact_updated'
  | 'contact_deleted'
  | 'recipient_added'
  | 'recipient_removed'
  | 'file_uploaded'
  | 'login'
  | 'security_check'
  | 'system_event';

interface ActivityData {
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

const activityTemplates: Record<ActivityType, (data: any) => ActivityData> = {
  vault_created: (data) => ({
    type: 'vault_created',
    title: `Created vault "${data.vaultName}"`,
    description: `New vault created with encryption enabled`,
    metadata: { vaultId: data.vaultId, vaultName: data.vaultName }
  }),
  
  vault_updated: (data) => ({
    type: 'vault_updated',
    title: `Updated vault "${data.vaultName}"`,
    description: `Vault settings and information modified`,
    metadata: { vaultId: data.vaultId, vaultName: data.vaultName }
  }),
  
  vault_deleted: (data) => ({
    type: 'vault_deleted',
    title: `Deleted vault "${data.vaultName}"`,
    description: `Vault and all its contents permanently removed`,
    metadata: { vaultName: data.vaultName, entriesCount: data.entriesCount }
  }),
  
  entry_added: (data) => ({
    type: 'entry_added',
    title: `Added ${data.entryType} to "${data.vaultName}"`,
    description: `New ${data.entryType} entry added to vault`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName, 
      entryType: data.entryType,
      entryId: data.entryId 
    }
  }),
  
  entry_deleted: (data) => ({
    type: 'entry_deleted',
    title: `Deleted ${data.entryType} from "${data.vaultName}"`,
    description: `Entry permanently removed from vault`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName, 
      entryType: data.entryType 
    }
  }),
  
  contact_added: (data) => ({
    type: 'contact_added',
    title: `Added ${data.contactName} as ${data.role}`,
    description: `New trusted contact added to your network`,
    metadata: { 
      contactId: data.contactId, 
      contactName: data.contactName, 
      role: data.role 
    }
  }),
  
  contact_updated: (data) => ({
    type: 'contact_updated',
    title: `Updated contact ${data.contactName}`,
    description: `Contact information and settings modified`,
    metadata: { 
      contactId: data.contactId, 
      contactName: data.contactName 
    }
  }),
  
  contact_deleted: (data) => ({
    type: 'contact_deleted',
    title: `Removed contact ${data.contactName}`,
    description: `Contact removed from all vaults and deleted`,
    metadata: { contactName: data.contactName }
  }),
  
  recipient_added: (data) => ({
    type: 'recipient_added',
    title: `Added ${data.contactName} to "${data.vaultName}"`,
    description: `Contact assigned as recipient for vault delivery`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName,
      contactId: data.contactId,
      contactName: data.contactName 
    }
  }),
  
  recipient_removed: (data) => ({
    type: 'recipient_removed',
    title: `Removed ${data.contactName} from "${data.vaultName}"`,
    description: `Contact no longer assigned to this vault`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName,
      contactName: data.contactName 
    }
  }),
  
  file_uploaded: (data) => ({
    type: 'file_uploaded',
    title: `Uploaded ${data.fileType} to "${data.vaultName}"`,
    description: `File "${data.fileName}" encrypted and stored securely`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize 
    }
  }),
  
  login: (data) => ({
    type: 'login',
    title: 'Account accessed',
    description: `Successful login from ${data.location || 'unknown location'}`,
    metadata: { 
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location 
    }
  }),
  
  security_check: (data) => ({
    type: 'security_check',
    title: 'Security check completed',
    description: data.description || 'Automated security audit performed',
    metadata: data.metadata || {}
  }),
  
  system_event: (data) => ({
    type: 'system_event',
    title: data.title || 'System event',
    description: data.description || 'System maintenance or update performed',
    metadata: data.metadata || {}
  })
};

export class NotificationHelper {
  static async logActivity(
    userId: string, 
    activityType: ActivityType, 
    data: any
  ): Promise<void> {
    try {
      const template = activityTemplates[activityType];
      if (!template) {
        console.warn(`Unknown activity type: ${activityType}`);
        return;
      }

      const activity = template(data);
      
      const notification: CreateNotificationRequest = {
        user_id: userId,
        title: activity.title,
        content: JSON.stringify({
          description: activity.description,
          type: activity.type,
          metadata: activity.metadata,
          timestamp: new Date().toISOString()
        })
      };

      const response = await notificationService.createNotification(notification);
      
      if (!response.isSuccessful) {
        console.error('Failed to log activity:', response.errors);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  static getActivityColor(type: ActivityType): string {
    const colorMap = {
      vault_created: 'blue',
      vault_updated: 'blue',
      vault_deleted: 'red',
      entry_added: 'green',
      entry_deleted: 'red',
      contact_added: 'purple',
      contact_updated: 'purple',
      contact_deleted: 'red',
      recipient_added: 'green',
      recipient_removed: 'orange',
      file_uploaded: 'blue',
      login: 'green',
      security_check: 'amber',
      system_event: 'slate'
    };
    
    return colorMap[type] || 'blue';
  }

  static parseNotificationContent(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      return { description: content, type: 'system_event', metadata: {} };
    }
  }

  // Convenience methods for common activities
  static async logVaultCreated(userId: string, vaultId: string, vaultName: string) {
    return this.logActivity(userId, 'vault_created', { vaultId, vaultName });
  }

  static async logVaultDeleted(userId: string, vaultName: string, entriesCount: number) {
    return this.logActivity(userId, 'vault_deleted', { vaultName, entriesCount });
  }

  static async logContactAdded(userId: string, contactId: string, contactName: string, role: string) {
    return this.logActivity(userId, 'contact_added', { contactId, contactName, role });
  }

  static async logEntryAdded(userId: string, vaultId: string, vaultName: string, entryType: string, entryId: string) {
    return this.logActivity(userId, 'entry_added', { vaultId, vaultName, entryType, entryId });
  }

  static async logFileUploaded(userId: string, vaultId: string, vaultName: string, fileName: string, fileType: string, fileSize?: number) {
    return this.logActivity(userId, 'file_uploaded', { vaultId, vaultName, fileName, fileType, fileSize });
  }

  static async logLogin(userId: string, ipAddress?: string, userAgent?: string, location?: string) {
    return this.logActivity(userId, 'login', { ipAddress, userAgent, location });
  }
}