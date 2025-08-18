import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone,
  Shield,
  MoreVertical,
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
import { getRelationshipColor } from '@/utils/relationshipColors';

interface ContactCardProps {
  contact: Contact;
  index: number;
  vaultCount: number;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactCard({ contact, index, vaultCount, onEdit, onDelete }: ContactCardProps) {
  const getAvatarColor = (idx: number) => {
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
    return colors[idx % colors.length];
  };

  const getRelationshipLabel = (role?: string) => {
    switch (role) {
      case 'family': return 'Family';
      case 'friend': return 'Friend';
      case 'colleague': return 'Colleague';
      case 'home': return 'Home';
      default: return 'Other';
    }
  };

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
                {contact.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-base truncate">{contact.fullName || 'Unknown Contact'}</h3>
              <p className="text-slate-400 text-sm truncate">{contact.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRelationshipColor(contact.relationship || 'other').bg} ${getRelationshipColor(contact.relationship || 'other').text} border-0`}
                >
                  {getRelationshipLabel(contact.relationship || 'other')}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
              <DropdownMenuItem onClick={() => onEdit(contact)} className="text-slate-300 focus:bg-slate-800">
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(contact)} className="text-red-400 focus:bg-red-900/20">
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
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{contact.phone && contact.phone.trim() !== '' ? contact.phone : 'No phone number'}</span>
          </div>
        </div>

        {/* Vault Assignment Info */}
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Assigned to:</span>
            <span className="font-medium text-white">{vaultCount} vault{vaultCount !== 1 ? 's' : ''}</span>
          </div>
          {contact.isVerified && (
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
          {(() => {
            try {
              // Try to parse the timestamp
              const date = new Date(contact.timestamp || contact.created_at || contact.updated_at);
              
              // Check if the date is valid
              if (isNaN(date.getTime())) {
                return 'Date not available';
              }
              
              // Format the date nicely
              const now = new Date();
              const diffInMs = now.getTime() - date.getTime();
              const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
              
              if (diffInDays === 0) {
                return 'Added today';
              } else if (diffInDays === 1) {
                return 'Added yesterday';
              } else if (diffInDays < 7) {
                return `Added ${diffInDays} days ago`;
              } else if (diffInDays < 30) {
                const weeks = Math.floor(diffInDays / 7);
                return `Added ${weeks} week${weeks !== 1 ? 's' : ''} ago`;
              } else {
                return `Added ${date.toLocaleDateString()}`;
              }
            } catch (error) {
              return 'Date not available';
            }
          })()}
        </div>
      </Card>
    </motion.div>
  );
}