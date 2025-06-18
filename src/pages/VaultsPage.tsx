import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Clock,
  Users,
  FileText,
  Image,
  Video,
  Mic,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVaults } from '@/contexts/VaultContext';
import { CreateVaultDialog } from '@/components/CreateVaultDialog';

export function VaultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { vaults, contacts } = useVaults();

  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vault.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vault.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sealed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'delivered': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getVaultStats = (vault: any) => {
    const totalEntries = vault.folders.reduce((acc: number, folder: any) => acc + folder.entries.length, 0);
    const entryTypes = vault.folders.reduce((acc: any, folder: any) => {
      folder.entries.forEach((entry: any) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
      });
      return acc;
    }, {});

    return { totalEntries, entryTypes };
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'text': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Mic;
      default: return FileText;
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
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
              Secure digital vaults preserving your most precious memories
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search vaults..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'active', 'sealed', 'delivered'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={
                  statusFilter === status
                    ? 'bg-blue-600 hover:bg-blue-700 whitespace-nowrap'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800 whitespace-nowrap'
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredVaults.map((vault, index) => {
              const { totalEntries, entryTypes } = getVaultStats(vault);
              const recipientNames = vault.recipients
                .map(id => contacts.find(c => c.id === id)?.name)
                .filter(Boolean)
                .slice(0, 2);

              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <motion.div
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.3 }}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0"
                        >
                          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors truncate text-sm sm:text-base">
                            {vault.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                            {vault.description}
                          </p>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${getStatusColor(vault.status)} border text-xs`}>
                        {vault.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {vault.status === 'sealed' && <Lock className="w-3 h-3 mr-1" />}
                        {vault.status === 'delivered' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
                      </Badge>
                      
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">{new Date(vault.lastModified).toLocaleDateString()}</span>
                        <span className="sm:hidden">{new Date(vault.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Total Entries</span>
                        <span className="font-medium text-white">{totalEntries}</span>
                      </div>

                      {/* Entry Types */}
                      {totalEntries > 0 && (
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          {Object.entries(entryTypes).map(([type, count]) => {
                            const IconComponent = getEntryIcon(type);
                            return (
                              <div key={type} className="flex items-center space-x-1 text-xs text-slate-400">
                                <IconComponent className="w-3 h-3" />
                                <span>{count as number}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Recipients */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Recipients</span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-white">{vault.recipients.length}</span>
                        </div>
                      </div>
                      
                      {recipientNames.length > 0 && (
                        <div className="text-xs text-slate-400 truncate">
                          {recipientNames.join(', ')}
                          {vault.recipients.length > 2 && ` +${vault.recipients.length - 2} more`}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t border-slate-700/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
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