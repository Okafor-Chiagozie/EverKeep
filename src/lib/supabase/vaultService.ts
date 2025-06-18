import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type Vault = Database['public']['Tables']['vaults']['Row'];
type VaultInsert = Database['public']['Tables']['vaults']['Insert'];
type VaultUpdate = Database['public']['Tables']['vaults']['Update'];

export class VaultService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getVaults(): Promise<{ data: Vault[] | null; error: any }> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    return await this.supabase
      .from('vaults')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
  }

  async createVault(name: string, description: string, folders?: { name: string; icon: string }[]): Promise<{ data: Vault | null; error: any }> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const vaultData = {
      name,
      description,
      user_id: user.user.id,
      folders: folders || []
    };

    return await this.supabase
      .from('vaults')
      .insert([vaultData])
      .select()
      .single();
  }

  async updateVault(id: string, updates: Partial<Vault>): Promise<{ data: Vault | null; error: any }> {
    return await this.supabase
      .from('vaults')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  async deleteVault(id: string): Promise<{ error: any }> {
    return await this.supabase
      .from('vaults')
      .delete()
      .eq('id', id);
  }

  async getVaultById(id: string): Promise<Vault> {
    const { data: vault, error } = await this.supabase
      .from('vaults')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return vault;
  }

  async updateLastAccessed(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('vaults')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async logVaultAccess(
    vaultId: string,
    action: string,
    metadata?: { ip_address?: string; user_agent?: string }
  ): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser();
    
    const { error } = await this.supabase
      .from('vault_access_logs')
      .insert({
        vault_id: vaultId,
        user_id: user.user?.id,
        action,
        ip_address: metadata?.ip_address,
        user_agent: metadata?.user_agent,
      });

    if (error) throw error;
  }
} 