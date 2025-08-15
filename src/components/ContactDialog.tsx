import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus,
  Edit,
  CheckCircle,
  X,
  Heart,
  Home,
  Briefcase
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
import { Label } from '@/components/ui/label';

import { useAuth } from '@/contexts/AuthContext';
import { contactService } from '@/services/contact';
import { Contact, CreateContactRequest, UpdateContactRequest } from '@/types/contact';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null; // If provided, it's edit mode
  onContactSaved: (contact: Contact) => void;
  onError: (error: string) => void;
}

const contactRoles = [
  {
    id: 'family',
    name: 'Family',
    description: 'Spouse, children, parents, siblings',
    icon: Home,
    color: 'blue'
  },
  {
    id: 'friend',
    name: 'Friend',
    description: 'Close personal friend',
    icon: Heart,
    color: 'pink'
  },
  {
    id: 'colleague',
    name: 'Colleague',
    description: 'Work colleague or professional contact',
    icon: Briefcase,
    color: 'purple'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other trusted person',
    icon: Users,
    color: 'slate'
  }
];

export function ContactDialog({ 
  open, 
  onOpenChange, 
  contact, 
  onContactSaved, 
  onError 
}: ContactDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'family'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isEditMode = !!contact;

  // Reset form when dialog opens/closes or contact changes
  useEffect(() => {
    if (open) {
      if (contact) {
        // Edit mode - populate with existing data
        setFormData({
          name: contact.name,
          email: contact.email,
          phone: contact.phone || '',
          role: contact.role
        });
      } else {
        // Add mode - reset to defaults
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'family'
        });
      }
      setIsSuccess(false);
    }
  }, [open, contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !user) return;

    setIsSaving(true);

    try {
      if (isEditMode && contact) {
        // Update existing contact
        const updateData: UpdateContactRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role
        };

        const response = await contactService.updateContact(contact!.id, updateData);
        
        if (response.isSuccessful && response.data) {
          setIsSuccess(true);
          onContactSaved(response.data);
          
          setTimeout(() => {
            onOpenChange(false);
          }, 1500);
        } else {
          onError(response.errors[0]?.description || 'Failed to update contact');
        }
      } else {
        // Create new contact
        const contactData: CreateContactRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role
        };

        const response = await contactService.createContact(user.id, contactData);

        if (response.isSuccessful && response.data) {
          setIsSuccess(true);
          onContactSaved(response.data);

          setTimeout(() => {
            onOpenChange(false);
          }, 1500);
        } else {
          onError(response.errors[0]?.description || 'Failed to add contact');
        }
      }
    } catch (err) {
      console.error('Error saving contact:', err);
      onError(`Failed to ${isEditMode ? 'update' : 'add'} contact`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onOpenChange(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle role selection - this ensures the selection always works
  const handleRoleSelect = (roleId: string) => {
    if (!isSaving) {
      updateFormData('role', roleId);
    }
  };

  const getRoleColors = (roleId: string, isSelected: boolean) => {
    const role = contactRoles.find(r => r.id === roleId);
    if (!role) return 'bg-slate-800/30 border-slate-700/50';
    
    if (isSelected) {
      return `bg-${role.color}-900/20 border-${role.color}-500/50 ring-2 ring-${role.color}-500/30`;
    }
    return 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
        <DialogTitle className="sr-only">
          {isEditMode ? 'Edit Contact' : 'Add Trusted Contact'}
        </DialogTitle>
        
        <div className="p-6 sm:p-8 relative">
          {/* Close Button */}
          {!isSaving && !isSuccess && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <DialogHeader className="pr-12">
            <DialogTitle className="text-2xl text-white flex items-center space-x-3">
              {isEditMode ? (
                <>
                  <Edit className="w-6 h-6 text-blue-400" />
                  <span>Edit Contact</span>
                </>
              ) : (
                <>
                  <Users className="w-6 h-6 text-blue-400" />
                  <span>Add Trusted Contact</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Contact {isEditMode ? 'Updated' : 'Added'}!
              </h3>
              <p className="text-slate-400">
                {formData.name} has been {isEditMode ? 'updated' : 'added to your trusted contacts'}.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact-name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                    disabled={isSaving}
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Enter their full name"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-slate-300">Email Address</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                    disabled={isSaving}
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Enter their email address"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-phone" className="text-slate-300">Phone Number (Optional)</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    disabled={isSaving}
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Enter their phone number"
                  />
                </div>
              </div>

              {/* Relationship Selection */}
              <div>
                <Label className="text-slate-300 mb-4 block">Relationship</Label>
                
                {/* Custom role selection without RadioGroup wrapper to avoid conflicts */}
                <div className="space-y-3">
                  {contactRoles.map((roleOption) => {
                    const isSelected = formData.role === roleOption.id;
                    
                    return (
                      <motion.div
                        key={roleOption.id}
                        whileHover={!isSaving ? { scale: 1.02 } : {}}
                        whileTap={!isSaving ? { scale: 0.98 } : {}}
                      >
                        <Card
                          className={`p-4 cursor-pointer transition-all border-2 ${getRoleColors(roleOption.id, isSelected)} ${
                            isSaving ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          onClick={() => handleRoleSelect(roleOption.id)}
                        >
                          <div className="flex items-center space-x-3">
                            {/* Custom radio button */}
                            <div className="relative">
                              <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                                isSelected 
                                  ? `border-${roleOption.color}-400 bg-${roleOption.color}-400` 
                                  : 'border-slate-400 bg-transparent'
                              }`}>
                                {isSelected && (
                                  <div className="absolute inset-0 rounded-full bg-white scale-[0.4] transition-transform" />
                                )}
                              </div>
                            </div>
                            
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected 
                                ? `bg-${roleOption.color}-500/30` 
                                : `bg-${roleOption.color}-500/20`
                            }`}>
                              <roleOption.icon className={`w-5 h-5 transition-colors ${
                                isSelected 
                                  ? `text-${roleOption.color}-300` 
                                  : `text-${roleOption.color}-400`
                              }`} />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className={`font-medium transition-colors ${
                                isSelected ? 'text-white' : 'text-slate-200'
                              }`}>
                                {roleOption.name}
                              </h4>
                              <p className={`text-sm transition-colors ${
                                isSelected ? 'text-slate-300' : 'text-slate-400'
                              }`}>
                                {roleOption.description}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Notice - only show for new contacts */}
              {!isEditMode && (
                <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                  <h4 className="font-semibold text-blue-300 mb-2">Privacy Notice</h4>
                  <p className="text-sm text-slate-300">
                    Your contact will not be notified that they've been added to your vault. 
                    They will only be contacted when your vault is ready for delivery.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.name.trim() || !formData.email.trim() || isSaving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isEditMode ? 'Updating...' : 'Adding...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {isEditMode ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Update Contact</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add Contact</span>
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}