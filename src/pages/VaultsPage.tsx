import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Search, 
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  FileX
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreateVaultDialog } from '@/components/CreateVaultDialog';
import { useAuth } from '@/contexts/AuthContext';
import { vaultService } from '@/services/vault';
import { contactService } from '@/services/contact';
import { Vault } from '@/types/vault';
import { Contact } from '@/types/contact';

interface VaultWithMetadata extends Vault {
  recipientCount: number;
  entryCount: number;
  recipients: Contact[];
}

export function VaultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [vaults, setVaults] = useState<VaultWithMetadata[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch vaults and contacts simultaneously
        const [vaultsResponse, contactsResponse] = await Promise.all([
          vaultService.getVaults({
            pageSize: 100,
            pageNumber: 1,
            user_id: user.id
          }),
          contactService.getContacts({
            pageSize: 100,
            pageNumber: 1,
            user_id: user.id
          })
        ]);

        if (vaultsResponse.isSuccessful && vaultsResponse.data) {
          // Fetch additional metadata for each vault
          const vaultsWithMetadata = await Promise.all(
            vaultsResponse.data.map(async (vault) => {
              try {
                const [recipientsResponse, entriesResponse] = await Promise.all([
                  vaultService.getVaultRecipients(vault.id),
                  vaultService.getVaultEntries(vault.id)
                ]);

                const recipients: Contact[] = [];
                let recipientCount = 0;
                
                if (recipientsResponse.isSuccessful && recipientsResponse.data) {
                  recipientCount = recipientsResponse.data.length;
                  // TODO: Fix this when API structure is clarified
                  // For now, set empty array since VaultRecipient doesn't have contacts property
                  recipients.push(...[]);
                }

                const entryCount = entriesResponse.isSuccessful && entriesResponse.data ? entriesResponse.data.length : 0;

                return {
                  ...vault,
                  recipientCount,
                  entryCount,
                  recipients
                } as VaultWithMetadata;
              } catch (err) {
                console.error(`Error fetching metadata for vault ${vault.id}:`, err);
                return {
                  ...vault,
                  recipientCount: 0,
                  entryCount: 0,
                  recipients: []
                } as VaultWithMetadata;
              }
            })
          );

          setVaults(vaultsWithMetadata);
        } else {
          setError('Failed to load vaults');
        }
        
        if (contactsResponse.isSuccessful && contactsResponse.data) {
          setContacts(contactsResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load vault data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleVaultCreated = async (newVault: Vault) => {
    // Add the new vault with default metadata
    const vaultWithMetadata: VaultWithMetadata = {
      ...newVault,
      recipientCount: 0,
      entryCount: 0,
      recipients: []
    };
    
    setVaults(prev => [vaultWithMetadata, ...prev]);
    navigate(`/vaults/${newVault.id}`);
  };

  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (vault.description && vault.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = statusFilter === 'all' || 
                         (statusFilter === 'active' && vault.entryCount > 0) ||
                         (statusFilter === 'empty' && vault.entryCount === 0);
    
    return matchesSearch && matchesFilter;
  });

  const handleOpenVault = (vaultId: string) => {
    navigate(`/vaults/${vaultId}`);
  };

  const filterOptions = [
    { id: 'all', name: 'All' },
    { id: 'active', name: 'Active' },
    { id: 'empty', name: 'Empty' }
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading vaults...</p>
        </div>
      </div>
    );
  }

  if (error && vaults.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Card className="p-6 bg-red-900/20 border-red-500/30 max-w-md">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error Loading Vaults</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 lg:mt-0 mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              <span className="truncate">Your Vaults</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Secure digital storage for your most precious memories and important information
            </p>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-200 flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Vault
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search vaults..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {filterOptions.map((option) => (
              <Button
                key={option.id}
                variant={statusFilter === option.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(option.id)}
                className={
                  statusFilter === option.id
                    ? 'bg-blue-600 hover:bg-blue-700 whitespace-nowrap'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800 whitespace-nowrap'
                }
              >
                {option.name}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-900/20 border-red-500/30">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {vaults.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 sm:py-16 lg:py-20"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Vaults Yet</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-md mx-auto px-4">
              Create your first vault to start preserving your memories and messages for your loved ones.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Vault
            </Button>
          </motion.div>
        )}

        {/* Vaults Grid */}
        {filteredVaults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredVaults.map((vault, index) => {
              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <motion.div
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.3 }}
                          className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0"
                        >
                          <Shield className="w-6 h-6 text-blue-400" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors truncate text-base">
                            {vault.name}
                          </h3>
                          {vault.description && (
                            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                              {vault.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {vault.entryCount > 0 ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border text-xs">
                          <FileX className="w-3 h-3 mr-1" />
                          Empty
                        </Badge>
                      )}
                    </div>

                    {/* Assigned Contacts */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Assigned Contacts</h4>
                      <div className="flex items-center space-x-2">
                        {vault.recipientCount > 0 ? (
                          <>
                            <div className="flex -space-x-2">
                              {vault.recipients.slice(0, 3).map((contact, idx) => (
                                <Avatar key={idx} className="w-8 h-8 border-2 border-slate-800 bg-gradient-to-r from-blue-500 to-purple-600">
                                  <AvatarFallback className="text-white font-semibold text-xs">
                                    {contact?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {vault.recipientCount > 3 && (
                                <div className="w-8 h-8 border-2 border-slate-800 bg-slate-700 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-semibold">
                                    +{vault.recipientCount - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-slate-400">
                              <Users className="w-3 h-3" />
                              <span>{vault.recipientCount} assigned</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-slate-400 flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>No contacts assigned yet</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Creation Date */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created {new Date(vault.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleOpenVault(vault.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Open Vault
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No Results State */}
        {filteredVaults.length === 0 && vaults.length > 0 && (searchQuery || statusFilter !== 'all') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Vaults Found</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-6 px-4">
              {searchQuery 
                ? `No vaults match "${searchQuery}"`
                : 'No vaults found for the selected filter'
              }
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Create Vault Dialog */}
        <CreateVaultDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onVaultCreated={handleVaultCreated}
          contacts={contacts}
        />

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}