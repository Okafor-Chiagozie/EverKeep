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
  | 'logout'
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
    title: `Created vault '${data.vaultName}'`,
    description: `New vault "${data.vaultName}" has been created and is ready to store your important documents and messages securely.`,
    metadata: { vaultId: data.vaultId, vaultName: data.vaultName }
  }),
  
  vault_updated: (data) => ({
    type: 'vault_updated',
    title: `Updated vault '${data.vaultName}'`,
    description: `Vault "${data.vaultName}" settings and information have been modified. All encryption settings remain secure.`,
    metadata: { vaultId: data.vaultId, vaultName: data.vaultName }
  }),
  
  vault_deleted: (data) => ({
    type: 'vault_deleted',
    title: `Deleted vault '${data.vaultName}'`,
    description: `Vault "${data.vaultName}" and all its contents have been permanently removed. This action cannot be undone.`,
    metadata: { vaultName: data.vaultName, entriesCount: data.entriesCount }
  }),
  
  entry_added: (data) => ({
    type: 'entry_added',
    title: `Added ${data.entryType || 'text'} to '${data.vaultName}'`,
    description: `A new ${data.entryType || 'text'} entry has been added to vault "${data.vaultName}". The content is encrypted and securely stored.`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName, 
      entryType: data.entryType || 'text',
      entryId: data.entryId 
    }
  }),
  
  entry_deleted: (data) => ({
    type: 'entry_deleted',
    title: `Removed ${data.entryType} from '${data.vaultName}'`,
    description: `The ${data.entryType} entry has been permanently deleted from vault "${data.vaultName}".`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName, 
      entryType: data.entryType 
    }
  }),
  
  contact_added: (data) => ({
    type: 'contact_added',
    title: `Added ${data.contactName} as ${data.role}`,
    description: `Added ${data.contactName} as a ${data.role} to your trusted network. They can now be assigned to vaults.`,
    metadata: { 
      contactId: data.contactId, 
      contactName: data.contactName, 
      role: data.role 
    }
  }),
  
  contact_updated: (data) => ({
    type: 'contact_updated',
    title: `Updated ${data.contactName}'s details`,
    description: `Contact information and settings have been modified for ${data.contactName}.`,
    metadata: { 
      contactId: data.contactId, 
      contactName: data.contactName 
    }
  }),
  
  contact_deleted: (data) => ({
    type: 'contact_deleted',
    title: `Removed ${data.contactName} from contacts`,
    description: `${data.contactName} has been removed from all vaults and deleted from your contacts.`,
    metadata: { contactName: data.contactName }
  }),
  
  recipient_added: (data) => ({
    type: 'recipient_added',
    title: `Added ${data.contactName} to '${data.vaultName}'`,
    description: `${data.contactName} has been assigned as a recipient for vault "${data.vaultName}". They will receive access when the vault is delivered.`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName,
      contactId: data.contactId,
      contactName: data.contactName 
    }
  }),
  
  recipient_removed: (data) => ({
    type: 'recipient_removed',
    title: `Removed ${data.contactName} from '${data.vaultName}'`,
    description: `${data.contactName} is no longer assigned to vault "${data.vaultName}" and will not receive access.`,
    metadata: { 
      vaultId: data.vaultId, 
      vaultName: data.vaultName,
      contactName: data.contactName 
    }
  }),
  
  file_uploaded: (data) => ({
    type: 'file_uploaded',
    title: `Uploaded '${data.fileName}' to '${data.vaultName}'`,
    description: `File "${data.fileName}" (${data.fileType}) has been encrypted and securely stored in vault "${data.vaultName}".`,
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
    description: `Successful login from ${data.location || 'your current location'}. Your account is now active and secure.`,
    metadata: { 
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location 
    }
  }),
  
  logout: (data) => ({
    type: 'logout',
    title: 'Account signed out',
    description: `You have successfully signed out of your account. All sessions have been terminated for security.`,
    metadata: { 
      location: data.location,
      timestamp: data.timestamp 
    }
  }),
  
  security_check: (data) => ({
    type: 'security_check',
    title: data.title || 'Security check performed',
    description: data.description || 'An automated security audit has been performed on your account to ensure everything is secure and up to date.',
    metadata: data.metadata || {}
  }),
  
  system_event: (data) => ({
    type: 'system_event',
    title: data.title || 'System event occurred',
    description: data.description || 'System maintenance or update has been performed to keep your account running smoothly and securely.',
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
      console.log('🔍 NotificationHelper: Logging activity:', {
        userId,
        activityType,
        data
      });
      
      const template = activityTemplates[activityType];
      if (!template) {
        console.warn(`Unknown activity type: ${activityType}`);
        return;
      }

      const activity = template(data);
      console.log('🔍 NotificationHelper: Generated activity template:', activity);
      
      const notification: CreateNotificationRequest = {
        user_id: userId,
        title: activity.title,
        content: JSON.stringify({
          description: activity.description,
          type: activity.type,
          metadata: activity.metadata,
          // Always use the provided timestamp or capture the actual action time
          timestamp: data.timestamp || new Date().toISOString()
        })
      };

      console.log('🔍 NotificationHelper: Sending notification to service:', notification);

      const response = await notificationService.createNotification(notification);
      
      if (!response.isSuccessful) {
        console.error('❌ NotificationHelper: Failed to log activity:', response.errors);
      } else {
        console.log('✅ NotificationHelper: Activity logged successfully:', {
          type: activity.type,
          title: activity.title,
          userId: userId,
          notificationId: response.data?.id
        });
      }
    } catch (error) {
      console.error('❌ NotificationHelper: Error logging activity:', error);
    }
  }

  static getActivityColor(type: ActivityType): string {
    const colorMap = {
      // Vault operations - Blue tones for security
      vault_created: 'blue',
      vault_updated: 'indigo',
      vault_deleted: 'red',
      
      // Entry operations - Green tones for content
      entry_added: 'green',
      entry_deleted: 'red',
      
      // Contact operations - Purple tones for people
      contact_added: 'purple',
      contact_updated: 'violet',
      contact_deleted: 'red',
      
      // Recipient operations - Teal/Green tones for access
      recipient_added: 'teal',
      recipient_removed: 'orange',
      
      // File operations - Blue tones for storage
      file_uploaded: 'blue',
      
      // Security operations - Green/Amber tones for safety
      login: 'green',
      logout: 'orange',
      security_check: 'amber',
      
      // System operations - Slate tones for system
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
  static async logVaultCreated(userId: string, vaultId: string, vaultName: string, timestamp?: string) {
    return this.logActivity(userId, 'vault_created', { 
      vaultId, 
      vaultName, 
      timestamp: timestamp || new Date().toISOString() 
    });
  }

  static async logVaultDeleted(userId: string, vaultName: string, entriesCount: number, timestamp?: string) {
    return this.logActivity(userId, 'vault_deleted', { 
      vaultName, 
      entriesCount, 
      timestamp: timestamp || new Date().toISOString() 
    });
  }

  static async logContactAdded(userId: string, contactId: string, contactName: string, role: string, timestamp?: string) {
    return this.logActivity(userId, 'contact_added', { 
      contactId, 
      contactName, 
      role, 
      timestamp: timestamp || new Date().toISOString() 
    });
  }

  static async logEntryAdded(userId: string, vaultId: string, vaultName: string, entryType: string, entryId: string, timestamp?: string) {
    return this.logActivity(userId, 'entry_added', { 
      vaultId, 
      vaultName, 
      entryType, 
      entryId, 
      timestamp: timestamp || new Date().toISOString() 
    });
  }

  static async logTextEntryAdded(userId: string, vaultId: string, vaultName: string, entryId: string, timestamp?: string) {
    return this.logActivity(userId, 'entry_added', { 
      vaultId, 
      vaultName, 
      entryType: 'text',
      entryId, 
      timestamp: timestamp || new Date().toISOString() 
    });
  }

  static async logMediaEntryAdded(userId: string, vaultId: string, vaultName: string, entryId: string, mediaType: string, timestamp?: string) {
    return this.logActivity(userId, 'entry_added', { 
      vaultId, 
      vaultName, 
      entryType: mediaType,
      entryId, 
      timestamp: timestamp || new Date().toISOString() 
    });
  }

  static async logFileUploaded(userId: string, vaultId: string, vaultName: string, fileName: string, fileType: string, fileSize?: number, timestamp?: string) {
    return this.logActivity(userId, 'file_uploaded', { 
      vaultId, 
      vaultName, 
      fileName, 
      fileType, 
      fileSize, 
      timestamp: timestamp || new Date().toISOString() 
    });
  }

  static async logLogin(userId: string, data: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    timestamp?: string;
  }) {
    return this.logActivity(userId, 'login', data);
  }
}