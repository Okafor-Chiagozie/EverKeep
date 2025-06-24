import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone,
  Shield,
  MoreVertical,
  Heart,
  Home,
  Briefcase,
  UserPlus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useVaults } from '@/contexts/VaultContext';
import { AddContactDialog } from '@/components/AddContactDialog';

export function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { contacts } = useVaults();

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || contact.role === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getRelationshipIcon = (role: string) => {
    switch (role) {
      case 'family': return Home;
      case 'friend': return Heart;
      case 'colleague': return Briefcase;
      default: return Users;
    }
  };

  const getRelationshipColor = (role: string) => {
    switch (role) {
      case 'family': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'friend': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'colleague': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRelationshipLabel = (role: string) => {
    switch (role) {
      case 'family': return 'Family Member';
      case 'friend': return 'Friend';
      case 'colleague': return 'Colleague';
      default: return 'Other';
    }
  };

  const getAvatarColor = (index: number) => {
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

  // Calculate stats
  const totalContacts = contacts.length;
  const familyMembers = contacts.filter(c => c.role === 'family').length;
  const friends = contacts.filter(c => c.role === 'friend').length;
  const colleagues = contacts.filter(c => c.role === 'colleague').length;
  const others = contacts.filter(c => !['family', 'friend', 'colleague'].includes(c.role)).length;

  const categories = [
    { id: 'all', name: 'All Contacts', count: totalContacts },
    { id: 'family', name: 'Family Members', count: familyMembers },
    { id: 'friend', name: 'Friends', count: friends },
    { id: 'colleague', name: 'Colleagues', count: colleagues },
    { id: 'other', name: 'Other', count: others }
  ];

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
              title: 'Family Members', 
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
              onClick={() => setShowAddDialog(true)}
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
            {filteredContacts.map((contact, index) => {
              const RelationshipIcon = getRelationshipIcon(contact.role);
              
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full">
                    {/* Header with Avatar and Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(index)} flex-shrink-0`}>
                          <AvatarFallback className="text-white font-semibold">
                            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-base truncate">{contact.name}</h3>
                          <Badge className={`${getRelationshipColor(contact.role)} border text-xs mt-1`}>
                            <RelationshipIcon className="w-3 h-3 mr-1" />
                            {getRelationshipLabel(contact.role)}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                            <Eye className="w-4 h-4 mr-2" />
                            View Assigned Vaults
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Contact
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Vault Assignment Info */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-400">Assigned to:</span>
                        <span className="font-medium text-white">{contact.vaultCount} vault{contact.vaultCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Manage Contact
                    </Button>

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