import { motion } from 'framer-motion';
import { 
  Shield, 
  X,
  Users,
  Lock,
  UserPlus,
  CheckCircle,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Vault } from '@/types/vault';
import { Contact } from '@/types/contact';

interface VaultSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  vault: Vault;
  recipients: Contact[];
  onManageContacts: () => void;
  onDeleteVault: () => void;
}

export function VaultSidebar({ 
  isOpen, 
  onClose, 
  vault, 
  recipients, 
  onManageContacts, 
  onDeleteVault 
}: VaultSidebarProps) {
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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      {isOpen && (
        <motion.div
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-[50] shadow-2xl flex flex-col"
        >
          {/* Vault Header */}
          <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Vault Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{vault.name}</h1>
                <p className="text-sm text-slate-400 line-clamp-2">{vault.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Encrypted
              </Badge>
              <Badge className="border-slate-600 text-slate-300 text-xs border bg-transparent">
                <Users className="w-3 h-3 mr-1" />
                {recipients.length} recipients
              </Badge>
            </div>

            <div className="text-xs text-slate-400">
              Created: {new Date(vault.timestamp).toLocaleDateString()}
            </div>
          </div>

          {/* Recipients */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-300">Recipients</h3>
              <Button
                onClick={onManageContacts}
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recipients.length > 0 ? (
                recipients.map((recipient, index) => (
                  <div key={recipient.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30">
                    <Avatar className={`w-8 h-8 bg-gradient-to-r ${getContactColor(index)} flex-shrink-0`}>
                      <AvatarFallback className="text-white font-semibold text-xs">
                        {recipient.fullName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{recipient.fullName || 'Unknown Contact'}</p>
                      <p className="text-xs text-slate-400 truncate">{recipient.email}</p>
                    </div>
                    {recipient.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 mb-3">No recipients assigned</p>
                  <Button
                    onClick={onManageContacts}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Recipients
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Vault Settings */}
          <div className="p-6 border-t border-slate-700/50 flex-shrink-0 space-y-3">
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={onManageContacts}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Recipients
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-900/20 hover:border-red-400"
              onClick={onDeleteVault}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Vault
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}