import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search,
  Heart,
  Home,
  Briefcase,
  Trash2,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { contactService } from '@/services/contact';
import { vaultService } from '@/services/vault';
import { Contact } from '@/types/contact';
import { ContactCard } from '@/components/ContactCard';
import { ContactDialog } from '@/components/ContactDialog';

export function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [vaultCounts, setVaultCounts] = useState<Record<string, number>>({});

  // Fetch contacts on component mount
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await contactService.getContacts({
          pageSize: 100,
          pageNumber: 1,
          user_id: user.id
        });

        if (response.isSuccessful) {
          setContacts(response.data);
          // Fetch vault counts for each contact
          await fetchVaultCounts(response.data);
        } else {
          setError(response.errors[0]?.description || 'Failed to fetch contacts');
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user]);

  // Fetch vault counts for contacts
  const fetchVaultCounts = async (contactList: Contact[]) => {
    try {
      const counts: Record<string, number> = {};
      
      // For each contact, count how many vaults they're assigned to
      for (const contact of contactList) {
        try {
          // Get all vaults for the user
          const vaultsResponse = await vaultService.getVaults({
            pageSize: 100,
            pageNumber: 1,
            user_id: user?.id
          });
          
          if (vaultsResponse.isSuccessful) {
            let contactVaultCount = 0;
            
            // For each vault, check if this contact is a recipient
            for (const vault of vaultsResponse.data) {
              const recipientsResponse = await vaultService.getVaultRecipients(vault.id);
              if (recipientsResponse.isSuccessful) {
                const isRecipient = recipientsResponse.data.some(
                  recipient => recipient.contact_id === contact.id
                );
                if (isRecipient) {
                  contactVaultCount++;
                }
              }
            }
            
            counts[contact.id] = contactVaultCount;
          } else {
            counts[contact.id] = 0;
          }
        } catch {
          counts[contact.id] = 0;
        }
      }
      
      setVaultCounts(counts);
    } catch (err) {
      console.error('Error fetching vault counts:', err);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || contact.role === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDialog(true);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setShowContactDialog(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDeleteDialog(true);
  };

  const handleContactSaved = (savedContact: Contact) => {
    if (selectedContact) {
      // Update existing contact
      setContacts(prev => prev.map(contact => 
        contact.id === savedContact.id ? savedContact : contact
      ));
    } else {
      // Add new contact
      setContacts(prev => [...prev, savedContact]);
      setVaultCounts(prev => ({ ...prev, [savedContact.id]: 0 }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedContact) return;

    setIsDeleting(true);
    
    try {
      const response = await contactService.deleteContact(selectedContact.id);
      
      if (response.isSuccessful) {
        // Remove from local state
        setContacts(prev => prev.filter(contact => contact.id !== selectedContact.id));
        setVaultCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[selectedContact.id];
          return newCounts;
        });
        setShowDeleteDialog(false);
        setSelectedContact(null);
      } else {
        setError(response.errors[0]?.description || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate stats
  const totalContacts = contacts.length;
  const familyMembers = contacts.filter(c => c.role === 'family').length;
  const friends = contacts.filter(c => c.role === 'friend').length;
  const colleagues = contacts.filter(c => c.role === 'colleague').length;
  const others = contacts.filter(c => !['family', 'friend', 'colleague'].includes(c.role)).length;

  const categories = [
    { id: 'all', name: 'All Contacts', count: totalContacts },
    { id: 'family', name: 'Family', count: familyMembers },
    { id: 'friend', name: 'Friends', count: friends },
    { id: 'colleague', name: 'Colleagues', count: colleagues },
    { id: 'other', name: 'Other', count: others }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 lg:mt-0 mt-16">
        {/* Error Message */}
        {error && (
          <Card className="p-3 bg-red-900/20 border-red-500/30">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              <span className="truncate">Trusted Contacts</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Manage the people who will receive your digital legacy
            </p>
          </div>

          <Button
            onClick={handleAddContact}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-200 flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { 
              title: 'Total Contacts', 
              value: totalContacts, 
              icon: Users, 
              color: 'blue' 
            },
            { 
              title: 'Family', 
              value: familyMembers, 
              icon: Home, 
              color: 'blue' 
            },
            { 
              title: 'Friends', 
              value: friends, 
              icon: Heart, 
              color: 'pink' 
            },
            { 
              title: 'Colleagues', 
              value: colleagues, 
              icon: Briefcase, 
              color: 'purple' 
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="p-3 sm:p-4 lg:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-slate-400">{stat.title}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={categoryFilter === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category.id)}
                className={
                  categoryFilter === category.id
                    ? 'bg-blue-600 hover:bg-blue-700 whitespace-nowrap'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800 whitespace-nowrap'
                }
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredContacts.length === 0 && !searchQuery && categoryFilter === 'all' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Contacts Yet</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-md mx-auto px-4">
              Add trusted contacts who will receive your digital legacy when the time comes.
            </p>
            <Button
              onClick={handleAddContact}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </motion.div>
        )}

        {/* Contacts Grid */}
        {filteredContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredContacts.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={index}
                vaultCount={vaultCounts[contact.id] || 0}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
              />
            ))}
          </div>
        )}

        {/* No Results State */}
        {filteredContacts.length === 0 && (searchQuery || categoryFilter !== 'all') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Contacts Found</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-6 px-4">
              {searchQuery 
                ? `No contacts match "${searchQuery}"`
                : `No ${categoryFilter} contacts found`
              }
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Contact Dialog (Add/Edit) */}
        <ContactDialog
          open={showContactDialog}
          onOpenChange={setShowContactDialog}
          contact={selectedContact}
          onContactSaved={handleContactSaved}
          onError={setError}
        />

        {/* Delete Contact Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
            <DialogTitle className="sr-only">Delete Contact Confirmation</DialogTitle>
            
            <div className="p-6 sm:p-8 relative">
              {/* Close Button */}
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              <DialogHeader className="pr-12 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      Delete Contact
                    </DialogTitle>
                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Warning Message */}
                <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                  <h4 className="font-semibold text-red-300 mb-2">Warning</h4>
                  <p className="text-sm text-red-200">
                    You are about to permanently delete <strong>{selectedContact?.name}</strong>. 
                    This will also remove them from all assigned vaults.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Contact</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}