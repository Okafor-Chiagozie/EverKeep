import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/supabaseClient';
import { VaultService } from '@/lib/supabase/vaultService';

export interface VaultFolder {
  id: string;
  name: string;
  icon: string;
  entries: VaultEntry[];
}

export interface VaultEntry {
  id: string;
  type: 'text' | 'file' | 'audio' | 'video';
  title: string;
  content: string;
  encrypted: boolean;
  timestamp: Date;
  attachments?: string[];
}

export interface Vault {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'sealed' | 'delivered';
  recipients: string[];
  folders: VaultFolder[];
  createdAt: Date;
  lastModified: Date;
  deliveryDate?: Date;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  vaultCount: number;
  addedAt: Date;
}

interface VaultContextType {
  vaults: Vault[];
  contacts: Contact[];
  addVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'lastModified'>) => void;
  updateVault: (id: string, updates: Partial<Vault>) => void;
  deleteVault: (id: string) => void;
  addContact: (contact: Omit<Contact, 'id' | 'addedAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addVaultEntry: (vaultId: string, folderId: string, entry: Omit<VaultEntry, 'id' | 'timestamp'>) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const vaultService = new VaultService(getSupabaseClient());

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      const { data, error } = await vaultService.getVaults();
      if (error) throw error;
      
      // Transform Supabase vault data to match our Vault interface
      const transformedVaults: Vault[] = (data || []).map(vault => ({
        id: vault.id,
        name: vault.name,
        description: vault.description || '',
        status: 'active',
        recipients: [],
        folders: [],
        createdAt: new Date(vault.created_at),
        lastModified: new Date(vault.updated_at)
      }));
      
      setVaults(transformedVaults);
    } catch (error) {
      console.error('Error fetching vaults:', error);
    }
  };

  const addVault = async (vaultData: Omit<Vault, 'id' | 'createdAt' | 'lastModified'>) => {
    try {
      const { data, error } = await vaultService.createVault(vaultData.name, vaultData.description);
      if (error) throw error;

      const newVault: Vault = {
        ...vaultData,
        id: data!.id,
        createdAt: new Date(data!.created_at),
        lastModified: new Date(data!.updated_at)
      };
      setVaults(prev => [...prev, newVault]);
    } catch (error) {
      console.error('Error creating vault:', error);
      throw error;
    }
  };

  const updateVault = async (id: string, updates: Partial<Vault>) => {
    try {
      const { data, error } = await vaultService.updateVault(id, {
        name: updates.name,
        description: updates.description
      });
      if (error) throw error;

      setVaults(prev => prev.map(vault => 
        vault.id === id 
          ? { ...vault, ...updates, lastModified: new Date() }
          : vault
      ));
    } catch (error) {
      console.error('Error updating vault:', error);
      throw error;
    }
  };

  const deleteVault = async (id: string) => {
    try {
      const { error } = await vaultService.deleteVault(id);
      if (error) throw error;
      setVaults(prev => prev.filter(vault => vault.id !== id));
    } catch (error) {
      console.error('Error deleting vault:', error);
      throw error;
    }
  };

  // Keep contact management in localStorage for now
  useEffect(() => {
    const savedContacts = localStorage.getItem('everkeep_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('everkeep_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (contactData: Omit<Contact, 'id' | 'addedAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Math.random().toString(36),
      addedAt: new Date()
    };
    setContacts(prev => [...prev, newContact]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const addVaultEntry = (vaultId: string, folderId: string, entryData: Omit<VaultEntry, 'id' | 'timestamp'>) => {
    const newEntry: VaultEntry = {
      ...entryData,
      id: Math.random().toString(36),
      timestamp: new Date()
    };

    setVaults(prev => prev.map(vault => 
      vault.id === vaultId 
        ? {
            ...vault,
            folders: vault.folders.map(folder =>
              folder.id === folderId
                ? { ...folder, entries: [...folder.entries, newEntry] }
                : folder
            ),
            lastModified: new Date()
          }
        : vault
    ));
  };

  return (
    <VaultContext.Provider value={{
      vaults,
      contacts,
      addVault,
      updateVault,
      deleteVault,
      addContact,
      updateContact,
      deleteContact,
      addVaultEntry
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVaults() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVaults must be used within a VaultProvider');
  }
  return context;
}