import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CryptoJS from 'npm:crypto-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// --- Encryption Utils (copied from check-inactive-vaults) ---
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
      return content;
    }
  }

  static isEncrypted(content: string): boolean {
    return content.length > 50 && /^[A-Za-z0-9+/=]+$/.test(content);
  }

  static tryDecodeShareToken(token: string, userId: string, vaultId: string): { vaultId: string, userId: string } | null {
    try {
      const base64 = token.replace(/[-_]/g, (char) => char === '-' ? '+' : '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const encrypted = atob(padded);
      const shareKey = this.generateKey(userId, vaultId, 'share');
      const decrypted = CryptoJS.AES.decrypt(encrypted, shareKey);
      const payload = decrypted.toString(CryptoJS.enc.Utf8);
      if (!payload) return null;
      const parsed = JSON.parse(payload);
      if (parsed && parsed.vaultId === vaultId && parsed.userId === userId) {
        return { vaultId, userId };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  try {
    const { token } = await req.json()
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing share token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Brute-force: Try all vaults and users to decode the token
    const { data: vaults } = await supabase.from('vaults').select('id, user_id');
    let found = null;
    for (const vault of vaults || []) {
      const decoded = EncryptionUtils.tryDecodeShareToken(token, vault.user_id, vault.id);
      if (decoded) {
        found = decoded;
        break;
      }
    }
    if (!found) {
      return new Response(JSON.stringify({ error: 'Invalid or expired share token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
    const { vaultId, userId } = found;

    // Fetch vault
    const { data: vault, error: vaultError } = await supabase.from('vaults').select('*').eq('id', vaultId).single();
    if (vaultError || !vault) {
      return new Response(JSON.stringify({ error: 'Vault not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
    // Decrypt vault fields
    const decryptedVault = {
      ...vault,
      name: EncryptionUtils.safeDecrypt(vault.name, userId, vaultId),
      description: vault.description ? EncryptionUtils.safeDecrypt(vault.description, userId, vaultId) : vault.description
    };

    // Fetch and decrypt entries
    const { data: entries } = await supabase.from('vault_entries').select('*').eq('vault_id', vaultId);
    const decryptedEntries = (entries || []).map(entry => {
      let decryptedContent = entry.content;
      if (entry.content) {
        try {
          if (entry.type === 'text') {
            decryptedContent = EncryptionUtils.safeDecrypt(entry.content, userId, vaultId);
          } else {
            try {
              const parsedContent = JSON.parse(entry.content);
              if (parsedContent.cloudinaryUrl) {
                decryptedContent = entry.content;
              } else {
                decryptedContent = EncryptionUtils.safeDecrypt(entry.content, userId, vaultId);
              }
            } catch {
              decryptedContent = EncryptionUtils.safeDecrypt(entry.content, userId, vaultId);
            }
          }
        } catch {
          decryptedContent = entry.content;
        }
      }
      return { ...entry, content: decryptedContent };
    });

    // Fetch recipients
    const { data: recipients } = await supabase
      .from('vault_recipients')
      .select('*, contacts:contact_id (id, name, email, phone, role, verified)')
      .eq('vault_id', vaultId);

    return new Response(JSON.stringify({
      vault: decryptedVault,
      entries: decryptedEntries,
      recipients: recipients || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
}) 