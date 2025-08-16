import { StandardApiResponse, PaginatedResponse, PaginationRequest, DatabaseRow } from './common';

export interface Vault extends DatabaseRow {
  user_id: string;
  name: string;
  description: string | null;
  timestamp: string;
  delivered_at_date: string | null;
}

export interface VaultEntry extends DatabaseRow {
  vault_id: string;
  type: string;
  content: string | null;
  timestamp: string;
  parent_id?: string | null;
}

export interface VaultItem extends DatabaseRow {
  vault_id: string;
  content_type: string;
  content: string;
}

export interface VaultRecipient extends DatabaseRow {
  vault_id: string;
  contact_id: string;
  timestamp: string;
  contact?: {
    id: string;
    user_id: string;
    fullName: string;
    email: string;
    phone?: string;
    relationship?: string;
    isVerified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateVaultRequest {
  name: string;
  description?: string;
}

export interface UpdateVaultRequest {
  name?: string;
  description?: string;
}

export interface CreateVaultEntryRequest {
  vault_id: string;
  type: string;
  content?: string;
  parent_id?: string;
}

export interface CreateVaultItemRequest {
  vault_id: string;
  content_type: string;
  content: string;
}

export interface AddVaultRecipientRequest {
  vault_id: string;
  contact_id: string;
}

export interface GetVaultsRequest extends PaginationRequest {
  user_id?: string;
}

export interface GetVaultsResponse extends PaginatedResponse<Vault> {}

export interface GetVaultByIdResponse extends StandardApiResponse<Vault> {}

export interface GetVaultEntriesResponse extends StandardApiResponse<VaultEntry[]> {}

export interface GetVaultItemsResponse extends StandardApiResponse<VaultItem[]> {}

export interface GetVaultRecipientsResponse extends StandardApiResponse<VaultRecipient[]> {}

export interface CreateVaultResponse extends StandardApiResponse<Vault> {}

export interface InactiveVaultResult {
  vault_id: string;
  user_id: string;
  days_inactive: number;
}