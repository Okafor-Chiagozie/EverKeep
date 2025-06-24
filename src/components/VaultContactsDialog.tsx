import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  X,
  CheckCircle,
  User,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useVaults } from '@/contexts/VaultContext';

interface VaultContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultId: string;
  vaultName: string;
}

export function VaultContactsDialog({ open, onOpenChange, vaultId, vaultName }: VaultContactsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { contacts, vaults, updateVault } = useVaults();
  
  const currentVault = vaults.find(v => v.id === vaultId);
  const currentRecipients = currentVault?.recipients || [];
  
  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!currentVault) return;
    
    setIsUpdating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedRecipients = currentRecipients.filter(id => id !== contactId);
    updateVault(vaultId, { recipients: updatedRecipients });
    
    setIsUpdating(false);
  };

  const handleAddContacts = async () => {
    if (!currentVault || selectedContacts.length === 0) return;
    
    setIsUpdating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedRecipients = [...new Set([...currentRecipients, ...selectedContacts])];
    updateVault(vaultId, { recipients: updatedRecipients });
    
    setSelectedContacts([]);
    setIsUpdating(false);
  };

  const getContactColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-amber-500 to-amber-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  const getRelationshipLabel = (role: string) => {
    switch (role) {
      case 'family': return 'Family Member';
      case 'friend': return 'Friend';
      case 'colleague': return 'Colleague';
      default: return 'Other';
    }
  };

  const assignedContacts = contacts.filter(contact => currentRecipients.includes(contact.id));
  const availableContacts = filteredContacts.filter(contact => !currentRecipients.includes(contact.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-slate-900/95 border-slate-700 mx-4 sm:mx-0 max-h-[90vh] overflow-hidden">
        <DialogTitle className="sr-only">Manage Vault Contacts</DialogTitle>
        
        <div className="p-6 sm:p-8 relative flex flex-col h-full">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          <DialogHeader className="pr-12 mb-6">
            <DialogTitle className="text-2xl text-white flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <span>Manage Vault Contacts</span>
            </DialogTitle>
            <p className="text-slate-400 mt-2">
              Manage who can access "{vaultName}" when it's delivered
            </p>
          </DialogHeader>

          <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Current Recipients */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Current Recipients ({assignedContacts.length})</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {assignedContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No contacts assigned to this vault</p>
                  </div>
                ) : (
                  assignedContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Avatar className={`w-10 h-10 bg-gradient-to-r ${getContactColor(index)}`}>
                              <AvatarFallback className="text-white font-semibold">
                                {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white truncate">{contact.name}</h4>
                              <p className="text-sm text-slate-400 truncate">{contact.email}</p>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs mt-1">
                                {getRelationshipLabel(contact.role)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveContact(contact.id)}
                            disabled={isUpdating}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Available Contacts */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  <span>Add Contacts</span>
                </h3>
                {selectedContacts.length > 0 && (
                  <Button
                    onClick={handleAddContacts}
                    disabled={isUpdating}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isUpdating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add ({selectedContacts.length})
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {availableContacts.length === 0 ? (
                  <div className="text-center py-8">
                    {searchQuery ? (
                      <>
                        <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">No contacts found matching "{searchQuery}"</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-slate-400">All contacts are already assigned to this vault</p>
                      </>
                    )}
                  </div>
                ) : (
                  availableContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          selectedContacts.includes(contact.id)
                            ? 'bg-blue-900/20 border-blue-500/50'
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                        }`}
                        onClick={() => handleContactToggle(contact.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleContactToggle(contact.id)}
                          />
                          <Avatar className={`w-10 h-10 bg-gradient-to-r ${getContactColor(index)}`}>
                            <AvatarFallback className="text-white font-semibold">
                              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{contact.name}</h4>
                            <p className="text-sm text-slate-400 truncate">{contact.email}</p>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs mt-1">
                              {getRelationshipLabel(contact.role)}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700/50 mt-6">
            <div className="text-sm text-slate-400">
              {assignedContacts.length} of {contacts.length} contacts assigned
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}