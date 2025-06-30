import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// ===== INTERFACES =====
interface InactiveUser {
  id: string;
  email: string;
  full_name: string;
  last_login: string;
  inactivity_threshold_days: number;
  days_inactive: number;
}

interface VaultToDeliver {
  vault_id: string;
  vault_name: string;
  vault_description?: string;
  user_id: string;
  user_name: string;
  user_email: string;
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  share_link: string;
}

// ===== ENCRYPTION UTILS =====
import CryptoJS from 'npm:crypto-js';

class EncryptionUtils {
  private static generateKey(userId: string, vaultId: string, purpose: 'content' | 'share' = 'content'): string {
    const salt = `everkeep-${purpose}-${vaultId}`;
    const key = CryptoJS.PBKDF2(userId, salt, {
      keySize: 256/32,
      iterations: 1000
    });
    return key.toString();
  }

  static safeDecrypt(content: string, userId: string, vaultId: string): string {
    if (!content || !this.isEncrypted(content)) {
      return content;
    }
    
    try {
      const key = this.generateKey(userId, vaultId, 'content');
      const decrypted = CryptoJS.AES.decrypt(content, key);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!originalText) {
        return content;
      }
      
      return originalText;
    } catch (error) {
      console.warn('Failed to decrypt content:', error);
      return content;
    }
  }

  static generateShareToken(userId: string, vaultId: string): string {
    try {
      const shareKey = this.generateKey(userId, vaultId, 'share');
      const timestamp = Date.now().toString();
      const payload = JSON.stringify({ vaultId, timestamp, userId });
      
      const encrypted = CryptoJS.AES.encrypt(payload, shareKey).toString();
      
      return btoa(encrypted).replace(/[+/=]/g, (char) => {
        switch (char) {
          case '+': return '-';
          case '/': return '_';
          case '=': return '';
          default: return char;
        }
      });
    } catch (error) {
      console.error('Share token generation failed:', error);
      throw new Error('Failed to generate share token');
    }
  }

  static isEncrypted(content: string): boolean {
    return content.length > 50 && /^[A-Za-z0-9+/=]+$/.test(content);
  }
}

// ===== VAULT SERVICE MOCK =====
const vaultService = {
  async getVaultRecipients(vaultId: string) {
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
      .eq('vault_id', vaultId);

    if (error) {
      return {
        isSuccessful: false,
        data: [],
        errors: [{ field: 'vault_recipients', description: error.message }]
      };
    }

    return {
      isSuccessful: true,
      data: data || [],
      errors: []
    };
  }
};

// ===== INACTIVITY CHECKER CLASS =====
class InactivityChecker {
  static async checkAndDeliverVaults(): Promise<{
    success: boolean;
    inactiveUsers: number;
    vaultsDelivered: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let inactiveUsersCount = 0;
    let vaultsDeliveredCount = 0;

    try {
      console.log('🔍 Starting daily inactivity check...');

      const inactiveUsers = await this.findInactiveUsers();
      inactiveUsersCount = inactiveUsers.length;

      if (inactiveUsers.length === 0) {
        console.log('✅ No inactive users found');
        return {
          success: true,
          inactiveUsers: 0,
          vaultsDelivered: 0,
          errors: []
        };
      }

      console.log(`📋 Found ${inactiveUsers.length} inactive users`);

      for (const user of inactiveUsers) {
        try {
          console.log(`👤 Processing user: ${user.full_name} (${user.days_inactive} days inactive)`);
          
          const vaults = await this.getUserVaults(user.id);
          console.log(`📦 Found ${vaults.length} vaults for user ${user.full_name}`);

          for (const vault of vaults) {
            try {
              const delivered = await this.deliverVault(vault, user);
              if (delivered) {
                vaultsDeliveredCount++;
                console.log(`✉️ Vault "${vault.vault_name}" delivered successfully`);
              }
            } catch (vaultError) {
              const errorMsg = `Failed to deliver vault ${vault.vault_id}: ${vaultError}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }

          await this.markUserAsProcessed(user.id);

        } catch (userError) {
          const errorMsg = `Failed to process user ${user.id}: ${userError}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(`🎉 Completed: ${vaultsDeliveredCount} vaults delivered to inactive users`);

      return {
        success: true,
        inactiveUsers: inactiveUsersCount,
        vaultsDelivered: vaultsDeliveredCount,
        errors
      };

    } catch (error) {
      console.error('❌ Critical error in inactivity check:', error);
      return {
        success: false,
        inactiveUsers: inactiveUsersCount,
        vaultsDelivered: vaultsDeliveredCount,
        errors: [...errors, `Critical error: ${error}`]
      };
    }
  }

  private static async findInactiveUsers(): Promise<InactiveUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, last_login, inactivity_threshold_days')
      .not('last_login', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    const inactiveUsers: InactiveUser[] = [];

    for (const user of data || []) {
      const lastLogin = new Date(user.last_login);
      const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLogin >= user.inactivity_threshold_days) {
        const { data: todaysProcessing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', 'Inactivity Processing Complete')
          .gte('timestamp', `${today}T00:00:00Z`)
          .lt('timestamp', `${today}T23:59:59Z`)
          .single();

        if (!todaysProcessing) {
          inactiveUsers.push({
            ...user,
            days_inactive: daysSinceLogin
          });
          console.log(`🔍 Found inactive user: ${user.full_name} (${daysSinceLogin} days)`);
        } else {
          console.log(`⏭️ User ${user.full_name} already processed today, skipping`);
        }
      }
    }

    return inactiveUsers;
  }

  private static async getUserVaults(userId: string): Promise<VaultToDeliver[]> {
    const { data: vaults, error: vaultsError } = await supabase
      .from('vaults')
      .select('id, name, description, user_id')
      .eq('user_id', userId);

    if (vaultsError) {
      throw new Error(`Failed to fetch vaults: ${vaultsError.message}`);
    }

    const vaultsToDeliver: VaultToDeliver[] = [];

    for (const vault of vaults || []) {
      try {
        const recipientsResponse = await vaultService.getVaultRecipients(vault.id);
        
        if (!recipientsResponse.isSuccessful || recipientsResponse.data.length === 0) {
          console.log(`⚠️ Vault "${vault.name}" has no recipients, skipping`);
          continue;
        }

        const recipients = recipientsResponse.data
          .map(r => r.contacts)
          .filter(contact => contact !== null && contact !== undefined)
          .map(contact => ({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            role: contact.role
          }));

        if (recipients.length === 0) {
          console.log(`⚠️ Vault "${vault.name}" has no valid recipients, skipping`);
          continue;
        }

        const shareLink = await this.generateVaultShareLink(userId, vault.id);

        const { data: userData } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        vaultsToDeliver.push({
          vault_id: vault.id,
          vault_name: EncryptionUtils.safeDecrypt(vault.name, userId, vault.id),
          vault_description: vault.description ? EncryptionUtils.safeDecrypt(vault.description, userId, vault.id) : undefined,
          user_id: userId,
          user_name: userData?.full_name || 'Unknown User',
          user_email: userData?.email || '',
          recipients,
          share_link: shareLink
        });

      } catch (error) {
        console.error(`Error processing vault ${vault.id}:`, error);
        continue;
      }
    }

    return vaultsToDeliver;
  }

  private static async generateVaultShareLink(userId: string, vaultId: string): Promise<string> {
    try {
      const token = EncryptionUtils.generateShareToken(userId, vaultId);
      const baseUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://your-app.com';
      return `${baseUrl}/vault/share/${token}`;
    } catch (error) {
      throw new Error(`Failed to generate share link: ${error}`);
    }
  }

  private static async deliverVault(vault: VaultToDeliver, user: InactiveUser): Promise<boolean> {
    try {
      for (const recipient of vault.recipients) {
        await this.sendVaultDeliveryEmail(vault, recipient, user);
      }

      await this.logVaultDelivery(vault.vault_id, user.id, vault.recipients.length);
      return true;
    } catch (error) {
      console.error(`Failed to deliver vault ${vault.vault_id}:`, error);
      return false;
    }
  }

  private static async sendVaultDeliveryEmail(
    vault: VaultToDeliver, 
    recipient: { name: string; email: string; role: string }, 
    user: InactiveUser
  ): Promise<void> {
    const emailData = {
      to: recipient.email,
      subject: `💝 Digital Vault from ${vault.user_name} - EverKeep`,
      html: this.generateEmailTemplate(vault, recipient, user)
    };

    try {
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-vault-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Email service error: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`📧 Email sent successfully to ${recipient.email}`, result);
      
    } catch (error) {
      console.error(`❌ Failed to send email to ${recipient.email}:`, error);
      throw error;
    }
  }

  private static generateEmailTemplate(
    vault: VaultToDeliver,
    recipient: { name: string; email: string; role: string },
    user: InactiveUser
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Digital Vault from ${vault.user_name}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💝 You've Received a Digital Vault</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">from ${vault.user_name}</p>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Dear ${recipient.name},</h2>
            <p>You are receiving this because ${vault.user_name} has been inactive for ${user.days_inactive} days and has designated you as a trusted contact to receive their digital vault.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">📦 Vault: "${vault.vault_name}"</h3>
              ${vault.vault_description ? `<p><strong>Description:</strong> ${vault.vault_description}</p>` : ''}
              <p><strong>Your relationship:</strong> ${recipient.role.charAt(0).toUpperCase() + recipient.role.slice(1)}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${vault.share_link}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              🔓 Access Vault Contents
            </a>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>🔒 Privacy & Security:</strong> This vault contains encrypted personal content that only you and other designated recipients can access. Please treat this information with care and respect.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            <p>This vault was securely delivered by EverKeep Digital Vault Service</p>
            <p>If you have questions, please contact support@everkeep.com</p>
          </div>
        </body>
      </html>
    `;
  }

  private static async logVaultDelivery(vaultId: string, userId: string, recipientCount: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: 'Vault Delivery Completed',
          content: JSON.stringify({
            type: 'vault_delivery',
            description: `${recipientCount} recipients received your vault contents due to inactivity`,
            timestamp: new Date().toISOString(),
            vault_id: vaultId,
            recipient_count: recipientCount
          })
        }]);

      if (error) {
        console.error('Failed to log vault delivery:', error);
      } else {
        console.log(`📋 Logged delivery: Vault ${vaultId} → ${recipientCount} recipients`);
      }
    } catch (error) {
      console.error('Error logging vault delivery:', error);
    }
  }

  private static async markUserAsProcessed(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: 'Inactivity Processing Complete',
          content: JSON.stringify({
            type: 'inactivity_processed',
            description: 'User inactivity check completed and vaults delivered',
            timestamp: new Date().toISOString(),
            processed_date: new Date().toISOString().split('T')[0]
          })
        }]);

      if (error) {
        console.error('Failed to mark user as processed:', error);
      } else {
        console.log(`✅ Marked user ${userId} as processed`);
      }
    } catch (error) {
      console.error('Error marking user as processed:', error);
    }
  }

  static async testInactivityCheck(userId?: string): Promise<any> {
    console.log('🧪 Running test inactivity check...');
    
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (user) {
        const testUser: InactiveUser = {
          ...user,
          days_inactive: 999
        };
        
        const vaults = await this.getUserVaults(userId);
        console.log(`Test user has ${vaults.length} vaults`);
        
        return { user: testUser, vaults };
      }
    } else {
      return await this.checkAndDeliverVaults();
    }
  }
}

// ===== EDGE FUNCTION HANDLER =====
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting scheduled vault delivery check...')
    console.log('⏰ Timestamp:', new Date().toISOString())
    
    const result = await InactivityChecker.checkAndDeliverVaults()
    
    console.log('✅ Vault delivery check completed:', result)
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      result: result
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 200
    })
    
  } catch (error) {
    console.error('❌ Critical error in vault delivery check:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 500
    })
  }
})