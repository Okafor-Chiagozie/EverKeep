import type { SupabaseClient } from './supabaseClient';
import type { Database } from './types';

type VaultItem = Database['public']['Tables']['vault_items']['Row'];
type VaultItemInsert = Database['public']['Tables']['vault_items']['Insert'];
type VaultItemUpdate = Database['public']['Tables']['vault_items']['Update'];

export class VaultItemService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createVaultItem(data: Omit<VaultItemInsert, 'id'>): Promise<VaultItem> {
    const { data: item, error } = await this.supabase
      .from('vault_items')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return item;
  }

  async getVaultItems(vaultId: string): Promise<VaultItem[]> {
    const { data: items, error } = await this.supabase
      .from('vault_items')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return items;
  }

  async getVaultItemById(id: string): Promise<VaultItem> {
    const { data: item, error } = await this.supabase
      .from('vault_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return item;
  }

  async updateVaultItem(id: string, data: VaultItemUpdate): Promise<VaultItem> {
    const { data: item, error } = await this.supabase
      .from('vault_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return item;
  }

  async deleteVaultItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('vault_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getVaultItemsByType(
    vaultId: string,
    contentType: VaultItem['content_type']
  ): Promise<VaultItem[]> {
    const { data: items, error } = await this.supabase
      .from('vault_items')
      .select('*')
      .eq('vault_id', vaultId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return items;
  }

  async searchVaultItems(
    vaultId: string,
    searchTerm: string
  ): Promise<VaultItem[]> {
    const { data: items, error } = await this.supabase
      .from('vault_items')
      .select('*')
      .eq('vault_id', vaultId)
      .textSearch('content', searchTerm)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return items;
  }
} 