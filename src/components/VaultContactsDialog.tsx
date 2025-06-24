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
  UserPlus,
  UserCheck
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('assigned');
  
  const { contacts, vaults, updateVault } = useVaults();
  
  const currentVault = vaults.find(v => v.id === vaultId);
  const currentRecipients = currentVault?.recipients || [];
  
  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Separate into assigned and available based on the filtered results
  const assignedContacts = filteredContacts.filter(contact => 
    currentRecipients.includes(contact.id)
  );
  
  const availableContacts = filteredContacts.filter(contact => 
    !currentRecipients.includes(contact.id)
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
    
    // Switch to assigned tab to show the newly added contacts
    setActiveTab('assigned');
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
      case 'family': return 'Family';
      case 'friend': return 'Friend';
      case 'colleague': return 'Colleague';
      default: return 'Other';
    }
  };

  // Get all assigned contacts (not filtered by search) for the summary
  const allAssignedContacts = contacts.filter(contact => currentRecipients.includes(contact.id));

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

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-6">
              <TabsTrigger 
                value="assigned" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assigned Contacts</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs ml-2">
                  {allAssignedContacts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="add" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Contacts</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs ml-2">
                  {contacts.length - allAssignedContacts.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Assigned Contacts Tab */}
            <TabsContent value="assigned" className="flex-1 flex flex-col mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Currently Assigned</span>
                  {searchQuery && (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs">
                      {assignedContacts.length} of {allAssignedContacts.length} shown
                    </Badge>
                  )}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {assignedContacts.length === 0 ? (
                  <div className="text-center py-12">
                    {searchQuery ? (
                      <>
                        <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">No Results Found</h4>
                        <p className="text-slate-400">No assigned contacts match "{searchQuery}"</p>
                        {allAssignedContacts.length > 0 && (
                          <p className="text-sm text-slate-500 mt-2">
                            {allAssignedContacts.length} total assigned contact{allAssignedContacts.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">No Contacts Assigned</h4>
                        <p className="text-slate-400 mb-6">This vault doesn't have any assigned contacts yet.</p>
                        <Button
                          onClick={() => setActiveTab('add')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Contacts
                        </Button>
                      </>
                    )}
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
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-white truncate">{contact.name}</h4>
                                {contact.verified && (
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-slate-400 truncate">{contact.email}</p>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-1">
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
            </TabsContent>

            {/* Add Contacts Tab */}
            <TabsContent value="add" className="flex-1 flex flex-col mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  <span>Available to Add</span>
                  {availableContacts.length > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      {availableContacts.length} available
                    </Badge>
                  )}
                </h3>
                {selectedContacts.length > 0 && (
                  <Button
                    onClick={handleAddContacts}
                    disabled={isUpdating}
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
                        Add Selected ({selectedContacts.length})
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {availableContacts.length === 0 ? (
                  <div className="text-center py-12">
                    {searchQuery ? (
                      <>
                        <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">No Results Found</h4>
                        <p className="text-slate-400">No available contacts match "{searchQuery}"</p>
                      </>
                    ) : allAssignedContacts.length === contacts.length ? (
                      <>
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">All Contacts Assigned</h4>
                        <p className="text-slate-400">All your contacts are already assigned to this vault.</p>
                      </>
                    ) : (
                      <>
                        <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">No Contacts Available</h4>
                        <p className="text-slate-400">You don't have any contacts to add to this vault.</p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Selection Info */}
                    {selectedContacts.length > 0 && (
                      <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30 mb-4">
                        <p className="text-blue-300 text-sm">
                          {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected for addition
                        </p>
                      </div>
                    )}

                    {availableContacts.map((contact, index) => (
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
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-white truncate">{contact.name}</h4>
                                {contact.verified && (
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-slate-400 truncate">{contact.email}</p>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs mt-1">
                                {getRelationshipLabel(contact.role)}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700/50 mt-6">
            <div className="text-sm text-slate-400">
              {allAssignedContacts.length} of {contacts.length} contacts assigned to this vault
              {searchQuery && (
                <span className="ml-2 text-blue-400">
                  • Filtered by "{searchQuery}"
                </span>
              )}
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