import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Search, 
  Users,
  FileText,
  Image,
  Video,
  Mic,
  CheckCircle,
  Archive,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useVaults } from '@/contexts/VaultContext';
import { CreateVaultDialog } from '@/components/CreateVaultDialog';

export function VaultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { vaults, contacts } = useVaults();
  const navigate = useNavigate();

  const getVaultStatus = (vault: any) => {
    const hasContent = vault.folders.some((folder: any) => folder.entries.length > 0);
    return hasContent ? 'active' : 'empty';
  };

  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vault.description.toLowerCase().includes(searchQuery.toLowerCase());
    const vaultStatus = getVaultStatus(vault);
    const matchesFilter = statusFilter === 'all' || 
                         (statusFilter === 'active' && vaultStatus === 'active') ||
                         (statusFilter === 'empty' && vaultStatus === 'empty') ||
                         (statusFilter === 'recent' && new Date(vault.lastModified) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesFilter;
  });

  const getContentSummary = (vault: any) => {
    let textEntries = 0;
    let mediaFiles = 0;

    vault.folders.forEach((folder: any) => {
      folder.entries.forEach((entry: any) => {
        if (entry.type === 'text') {
          textEntries++;
        } else {
          mediaFiles++;
        }
      });
    });

    return { textEntries, mediaFiles };
  };

  const getAssignedContacts = (vault: any) => {
    return vault.recipients
      .map((recipientId: string) => contacts.find(c => c.id === recipientId))
      .filter(Boolean)
      .slice(0, 3); // Show max 3 contacts
  };

  const handleOpenVault = (vaultId: string) => {
    navigate(`/vaults/${vaultId}`);
  };

  const filterOptions = [
    { id: 'all', name: 'All' },
    { id: 'active', name: 'Active Vaults' },
    { id: 'empty', name: 'Empty Vaults' },
    { id: 'recent', name: 'Recently Updated' }
  ];

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
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0"
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

        {/* Empty State */}
        {filteredVaults.length === 0 && !searchQuery && statusFilter === 'all' && (
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
              const { textEntries, mediaFiles } = getContentSummary(vault);
              const assignedContacts = getAssignedContacts(vault);
              const vaultStatus = getVaultStatus(vault);
              const remainingContacts = vault.recipients.length - assignedContacts.length;

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
                          <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                            {vault.description}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={`${vaultStatus === 'active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      } border text-xs`}>
                        {vaultStatus === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {vaultStatus === 'empty' && <Archive className="w-3 h-3 mr-1" />}
                        {vaultStatus === 'active' ? 'Active' : 'Empty'}
                      </Badge>
                    </div>

                    {/* Content Summary */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Content Summary</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{textEntries} text entries</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center space-x-1">
                            <Image className="w-4 h-4" />
                            <Video className="w-4 h-4" />
                            <Mic className="w-4 h-4" />
                          </div>
                          <span>{mediaFiles} media files</span>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Contacts */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Assigned Contacts</h4>
                      <div className="flex items-center space-x-2">
                        {assignedContacts.length > 0 ? (
                          <>
                            <div className="flex -space-x-2">
                              {assignedContacts.map((contact, idx) => (
                                <Avatar key={idx} className="w-8 h-8 border-2 border-slate-800 bg-gradient-to-r from-blue-500 to-purple-600">
                                  <AvatarFallback className="text-white font-semibold text-xs">
                                    {contact?.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {remainingContacts > 0 && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
                                  <span className="text-xs text-slate-300">+{remainingContacts}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-slate-400">
                              <Users className="w-3 h-3" />
                              <span>{vault.recipients.length} total</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-slate-400 flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>No contacts assigned</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Last Modified */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Modified {new Date(vault.lastModified).toLocaleDateString()}</span>
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
        {filteredVaults.length === 0 && (searchQuery || statusFilter !== 'all') && (
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
        />

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}