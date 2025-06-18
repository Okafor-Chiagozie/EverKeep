export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          isVerified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          isVerified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          isVerified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vaults: {
        Row: {
          id: string
          user_id: string
          encryption_key: string | null
          deadman_trigger: number | null
          name: string
          description: string | null
          status: 'active' | 'sealed' | 'delivered'
          created_at: string
          last_modified: string
          delivery_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          encryption_key?: string | null
          deadman_trigger?: number | null
          name: string
          description?: string | null
          status?: 'active' | 'sealed' | 'delivered'
          created_at?: string
          last_modified?: string
          delivery_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          encryption_key?: string | null
          deadman_trigger?: number | null
          name?: string
          description?: string | null
          status?: 'active' | 'sealed' | 'delivered'
          created_at?: string
          last_modified?: string
          delivery_date?: string | null
        }
      }
      vault_folders: {
        Row: {
          id: string
          vault_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vault_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vault_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vault_entries: {
        Row: {
          id: string
          folder_id: string
          type: 'text' | 'file' | 'audio' | 'video'
          title: string
          content: string | null
          encrypted: boolean
          attachments: string[] | null
          timestamp: string
        }
        Insert: {
          id?: string
          folder_id: string
          type: 'text' | 'file' | 'audio' | 'video'
          title: string
          content?: string | null
          encrypted?: boolean
          attachments?: string[] | null
          timestamp?: string
        }
        Update: {
          id?: string
          folder_id?: string
          type?: 'text' | 'file' | 'audio' | 'video'
          title?: string
          content?: string | null
          encrypted?: boolean
          attachments?: string[] | null
          timestamp?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string | null
          role: 'next-of-kin' | 'witness' | 'executor' | 'friend' | 'family'
          verified: boolean
          vault_count: number
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          role: 'next-of-kin' | 'witness' | 'executor' | 'friend' | 'family'
          verified?: boolean
          vault_count?: number
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'next-of-kin' | 'witness' | 'executor' | 'friend' | 'family'
          verified?: boolean
          vault_count?: number
          added_at?: string
        }
      }
      vault_recipients: {
        Row: {
          vault_id: string
          contact_id: string
          created_at: string
        }
        Insert: {
          vault_id: string
          contact_id: string
          created_at?: string
        }
        Update: {
          vault_id?: string
          contact_id?: string
          created_at?: string
        }
      }
      vault_deadman_settings: {
        Row: {
          id: string
          vault_id: string
          check_in_frequency: number
          last_check_in: string
          next_check_in: string
          is_active: boolean
          auto_deliver: boolean
          delivery_delay: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vault_id: string
          check_in_frequency: number
          last_check_in?: string
          next_check_in?: string
          is_active?: boolean
          auto_deliver?: boolean
          delivery_delay?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vault_id?: string
          check_in_frequency?: number
          last_check_in?: string
          next_check_in?: string
          is_active?: boolean
          auto_deliver?: boolean
          delivery_delay?: number
          created_at?: string
          updated_at?: string
        }
      }
      vault_check_in_history: {
        Row: {
          id: string
          vault_id: string
          check_in_time: string
          check_in_method: string
          ip_address: string | null
          user_agent: string | null
          status: 'success' | 'missed' | 'late'
        }
        Insert: {
          id?: string
          vault_id: string
          check_in_time?: string
          check_in_method: string
          ip_address?: string | null
          user_agent?: string | null
          status: 'success' | 'missed' | 'late'
        }
        Update: {
          id?: string
          vault_id?: string
          check_in_time?: string
          check_in_method?: string
          ip_address?: string | null
          user_agent?: string | null
          status?: 'success' | 'missed' | 'late'
        }
      }
      vault_items: {
        Row: {
          id: string
          vault_id: string
          content_type: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vault_id: string
          content_type: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vault_id?: string
          content_type?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 