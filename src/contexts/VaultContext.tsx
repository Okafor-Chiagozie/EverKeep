import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VaultFolder {
  id: string;
  name: string;
  icon: string;
  entries: VaultEntry[];
}

export interface VaultEntry {
  id: string;
  type: 'text' | 'file' | 'audio' | 'video' | 'image';
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
  phone?: string;
  role: 'family' | 'friend' | 'colleague' | 'other';
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

  useEffect(() => {
    // Load data from localStorage or API
    const savedVaults = localStorage.getItem('everkeep_vaults');
    const savedContacts = localStorage.getItem('everkeep_contacts');
    
    if (savedVaults) {
      const parsedVaults = JSON.parse(savedVaults);
      // Convert date strings back to Date objects
      const vaultsWithDates = parsedVaults.map((vault: any) => ({
        ...vault,
        createdAt: new Date(vault.createdAt),
        lastModified: new Date(vault.lastModified),
        deliveryDate: vault.deliveryDate ? new Date(vault.deliveryDate) : undefined,
        folders: vault.folders.map((folder: any) => ({
          ...folder,
          entries: folder.entries.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }))
        }))
      }));
      setVaults(vaultsWithDates);
    } else {
      // Sample data
      const sampleVaults: Vault[] = [
        {
          id: '1',
          name: 'Family Memories',
          description: 'Photos, videos, and messages for my children',
          status: 'active',
          recipients: ['1', '2'],
          folders: [
            {
              id: '1',
              name: 'Letters',
              icon: 'Mail',
              entries: [
                {
                  id: '1',
                  type: 'text',
                  title: 'Letter to Sarah',
                  content: 'My dearest daughter, if you are reading this...',
                  encrypted: true,
                  timestamp: new Date('2024-01-15')
                }
              ]
            },
            {
              id: '2',
              name: 'Photos',
              icon: 'Image',
              entries: []
            }
          ],
          createdAt: new Date('2024-01-01'),
          lastModified: new Date('2024-01-15')
        }
      ];
      setVaults(sampleVaults);
    }
    
    if (savedContacts) {
      const parsedContacts = JSON.parse(savedContacts);
      // Convert date strings back to Date objects
      const contactsWithDates = parsedContacts.map((contact: any) => ({
        ...contact,
        addedAt: new Date(contact.addedAt)
      }));
      setContacts(contactsWithDates);
    } else {
      // Sample contacts
      const sampleContacts: Contact[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'family',
          verified: true,
          vaultCount: 2,
          addedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael@example.com',
          role: 'friend',
          verified: false,
          vaultCount: 1,
          addedAt: new Date('2024-01-05')
        }
      ];
      setContacts(sampleContacts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('everkeep_vaults', JSON.stringify(vaults));
  }, [vaults]);

  useEffect(() => {
    localStorage.setItem('everkeep_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const addVault = (vaultData: Omit<Vault, 'id' | 'createdAt' | 'lastModified'>) => {
    const newVault: Vault = {
      ...vaultData,
      id: Math.random().toString(36),
      createdAt: new Date(),
      lastModified: new Date()
    };
    setVaults(prev => [...prev, newVault]);
  };

  const updateVault = (id: string, updates: Partial<Vault>) => {
    setVaults(prev => prev.map(vault => 
      vault.id === id 
        ? { ...vault, ...updates, lastModified: new Date() }
        : vault
    ));
    
    // Update vault counts for contacts
    if (updates.recipients) {
      setContacts(prevContacts => 
        prevContacts.map(contact => ({
          ...contact,
          vaultCount: vaults.filter(v => v.recipients.includes(contact.id)).length
        }))
      );
    }
  };

  const deleteVault = (id: string) => {
    setVaults(prev => prev.filter(vault => vault.id !== id));
  };

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
    // Remove contact from all vaults
    setVaults(prev => prev.map(vault => ({
      ...vault,
      recipients: vault.recipients.filter(recipientId => recipientId !== id),
      lastModified: new Date()
    })));
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