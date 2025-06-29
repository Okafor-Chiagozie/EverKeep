import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone,
  Shield,
  MoreVertical,
  Heart,
  Home,
  Briefcase,
  Users,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Contact } from '@/types/contact';

interface ContactCardProps {
  contact: Contact;
  index: number;
  vaultCount: number;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactCard({ contact, index, vaultCount, onEdit, onDelete }: ContactCardProps) {
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
      case 'family': return 'Family';
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

  const RelationshipIcon = getRelationshipIcon(contact.role);

  return (
    <motion.div
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
                className="p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem 
                className="text-slate-300 hover:bg-slate-700"
                onClick={() => onEdit(contact)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400 hover:bg-red-900/20"
                onClick={() => onDelete(contact)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Contact
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
            <span className="font-medium text-white">{vaultCount} vault{vaultCount !== 1 ? 's' : ''}</span>
          </div>
          {contact.verified && (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          onClick={() => onEdit(contact)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Contact
        </Button>

        {/* Added Date */}
        <div className="text-xs text-slate-500 mt-3 text-center">
          Added {new Date(contact.timestamp).toLocaleDateString()}
        </div>
      </Card>
    </motion.div>
  );
}