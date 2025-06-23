import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mail, 
  Phone, 
  Heart, 
  Home,
  Briefcase,
  UserPlus,
  Plus,
  CheckCircle,
  X
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useVaults } from '@/contexts/VaultContext';

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contactRoles = [
  {
    id: 'family',
    name: 'Family Member',
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

export function AddContactDialog({ open, onOpenChange }: AddContactDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('family');
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { addContact } = useVaults();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsAdding(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    addContact({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role: role as any,
      verified: false,
      vaultCount: 0
    });

    setIsAdding(false);
    setIsSuccess(true);

    // Reset form after success animation
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setRole('family');
      setIsSuccess(false);
      onOpenChange(false);
    }, 1500);
  };

  const selectedRole = contactRoles.find(r => r.id === role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
        <DialogTitle className="sr-only">Add Trusted Contact</DialogTitle>
        
        <div className="p-6 sm:p-8 relative">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          <DialogHeader className="pr-12">
            <DialogTitle className="text-2xl text-white flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <span>Add Trusted Contact</span>
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
              <h3 className="text-xl font-semibold text-white mb-2">Contact Added!</h3>
              <p className="text-slate-400">
                {name} has been added to your trusted contacts.
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Enter their full name"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-slate-300">Email Address</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Enter their email address"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-phone" className="text-slate-300">Phone Number (Optional)</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Enter their phone number"
                  />
                </div>
              </div>

              {/* Relationship Selection */}
              <div>
                <Label className="text-slate-300 mb-4 block">Relationship</Label>
                <RadioGroup value={role} onValueChange={setRole} className="space-y-3">
                  {contactRoles.map((roleOption) => (
                    <motion.div
                      key={roleOption.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          role === roleOption.id
                            ? `bg-${roleOption.color}-900/20 border-${roleOption.color}-500/50`
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={roleOption.id} id={roleOption.id} />
                          <div className={`w-10 h-10 rounded-lg bg-${roleOption.color}-500/20 flex items-center justify-center`}>
                            <roleOption.icon className={`w-5 h-5 text-${roleOption.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{roleOption.name}</h4>
                            <p className="text-sm text-slate-400">{roleOption.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                <h4 className="font-semibold text-blue-300 mb-2">Privacy Notice</h4>
                <p className="text-sm text-slate-300">
                  Your contact will not be notified that they've been added to your vault. 
                  They will only be contacted when your vault is ready for delivery.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || !email.trim() || isAdding}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAdding ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Adding Contact...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Contact</span>
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