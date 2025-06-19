import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  UserCheck,
  Crown,
  Briefcase,
  Heart,
  Home
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useVaults } from '@/contexts/VaultContext';
import { AddContactDialog } from '@/components/AddContactDialog';

export function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { contacts } = useVaults();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'next-of-kin': return Crown;
      case 'executor': return Briefcase;
      case 'witness': return UserCheck;
      case 'family': return Home;
      case 'friend': return Heart;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'next-of-kin': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'executor': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'witness': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'family': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'friend': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              <span className="truncate">Trusted Contacts</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Manage the people who will receive your digital legacy
            </p>
          </div>

          <Button
            onClick={() => setShowAddDialog(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md"
        >
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
          />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { 
              title: 'Total Contacts', 
              value: contacts.length, 
              icon: Users, 
              color: 'blue' 
            },
            { 
              title: 'Verified', 
              value: contacts.filter(c => c.verified).length, 
              icon: CheckCircle, 
              color: 'green' 
            },
            { 
              title: 'Next of Kin', 
              value: contacts.filter(c => c.role === 'next-of-kin').length, 
              icon: Crown, 
              color: 'amber' 
            },
            { 
              title: 'Executors', 
              value: contacts.filter(c => c.role === 'executor').length, 
              icon: Briefcase, 
              color: 'purple' 
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="p-3 sm:p-4 lg:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
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

        {/* Empty State */}
        {filteredContacts.length === 0 && !searchQuery && (
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
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </motion.div>
        )}

        {/* Contacts List */}
        {filteredContacts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredContacts.map((contact, index) => {
              const RoleIcon = getRoleIcon(contact.role);
              
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
                          <AvatarFallback className="text-white font-semibold text-sm sm:text-base">
                            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white flex items-center space-x-2">
                            <span className="truncate text-sm sm:text-base">{contact.name}</span>
                            {contact.verified && (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            )}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 truncate">{contact.email}</p>
                          <p className="text-xs text-slate-500 capitalize">{contact.role}</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>

                    {/* Role Badge */}
                    <div className="mb-4">
                      <Badge className={`${getRoleColor(contact.role)} border text-xs`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {contact.role.replace('-', ' ')}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-3 h-3 text-blue-400" />
                        <span className="text-slate-400">Vaults:</span>
                        <span className="font-medium text-white">{contact.vaultCount}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {contact.verified ? (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t border-slate-700/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 text-xs"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 text-xs"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Vaults
                      </Button>
                    </div>

                    {/* Added Date */}
                    <div className="text-xs text-slate-500 mt-3 text-center">
                      Added {new Date(contact.addedAt).toLocaleDateString()}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add Contact Dialog */}
        <AddContactDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}