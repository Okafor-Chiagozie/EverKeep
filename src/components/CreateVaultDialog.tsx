import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  X, 
  Users, 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  User,
  UserPlus
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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { vaultService } from '@/services/vault';
import { Vault } from '@/types/vault';
import { Contact } from '@/types/contact';

interface CreateVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVaultCreated: (vault: Vault) => void;
  contacts: Contact[];
}

const vaultSteps = [
  { id: 1, title: 'Vault Details', description: 'Name and describe your vault' },
  { id: 2, title: 'Select Contacts', description: 'Choose who can access this vault (optional)' },
  { id: 3, title: 'Success', description: 'Your vault has been created' }
];

export const CreateVaultDialog = ({ open, onOpenChange, onVaultCreated, contacts }: CreateVaultDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Form data
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (currentStep < vaultSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkipContacts = () => {
    // Skip to vault creation with no contacts
    handleCreateVault();
  };

  const handleAddContacts = () => {
    // Close modal and navigate to contacts page
    handleClose();
    navigate('/contacts');
  };

  const handleCreateVault = async () => {
    if (!user || !vaultName.trim()) return;
    
    setIsCreating(true);
    setError('');
    
    try {
      // Step 1: Create the vault
      const vaultResponse = await vaultService.createVault({
        name: vaultName.trim(),
        description: vaultDescription.trim() || undefined
      });

      if (!vaultResponse.isSuccessful || !vaultResponse.data) {
        setError(vaultResponse.errors[0]?.description || 'Failed to create vault');
        setIsCreating(false);
        return;
      }

      const newVault = vaultResponse.data;

      // Step 2: Add selected contacts as vault recipients
      if (selectedContacts.length > 0) {
        const recipientPromises = selectedContacts.map(contactId =>
          vaultService.addVaultRecipient({
            vault_id: newVault.id,
            contact_id: contactId
          })
        );

        // Wait for all recipients to be added
        const recipientResults = await Promise.allSettled(recipientPromises);
        
        // Check if any failed (but don't fail the entire creation)
        const failedRecipients = recipientResults.filter(result => 
          result.status === 'rejected' || 
          (result.status === 'fulfilled' && !result.value.isSuccessful)
        );

        if (failedRecipients.length > 0) {
          console.warn(`${failedRecipients.length} contacts failed to be added to vault`);
          // You could show a warning here, but vault creation was successful
        }
      }

      // Step 3: Success!
      setIsCreating(false);
      setIsSuccess(true);
      
      // Notify parent component
      onVaultCreated(newVault);

      // Auto-close after showing success message
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Error creating vault:', err);
      setError('Failed to create vault');
      setIsCreating(false);
    }
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleClose = () => {
    // Reset form
    setCurrentStep(1);
    setVaultName('');
    setVaultDescription('');
    setSelectedContacts([]);
    setSearchQuery('');
    setIsSuccess(false);
    setError('');
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return vaultName.trim() && vaultDescription.trim();
      case 2: return true; // Always allow proceeding from step 2 (contacts are optional)
      default: return false;
    }
  };

  const currentStepData = vaultSteps.find(step => step.id === currentStep)!;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
        <DialogTitle className="sr-only">Create New Vault</DialogTitle>
        
        <div className="p-6 sm:p-8 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          <DialogHeader className="pb-4 border-b border-slate-700/50 pr-12">
            <DialogTitle className="text-2xl text-white flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <span>Create New Vault</span>
            </DialogTitle>
            
            {/* Progress */}
            {currentStep < 3 && !isSuccess && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    Step {currentStep} of {vaultSteps.length - 1}: {currentStepData.title}
                  </span>
                  <span className="text-sm text-slate-400">
                    {Math.round((currentStep / (vaultSteps.length - 1)) * 100)}% Complete
                  </span>
                </div>
                <Progress value={(currentStep / (vaultSteps.length - 1)) * 100} className="h-2" />
              </div>
            )}
          </DialogHeader>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="py-6">
            <AnimatePresence mode="wait">
              {/* Success State */}
              {isSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">Vault Created Successfully!</h3>
                  <p className="text-slate-400 mb-2">
                    <strong className="text-white">"{vaultName}"</strong> has been created and secured.
                  </p>
                  {selectedContacts.length > 0 ? (
                    <p className="text-slate-400">
                      {selectedContacts.length} trusted contact{selectedContacts.length !== 1 ? 's' : ''} can now access this vault.
                    </p>
                  ) : (
                    <p className="text-slate-400">
                      You can add trusted contacts to this vault anytime from the vault settings.
                    </p>
                  )}
                </motion.div>
              )}

              {/* Step 1: Vault Details */}
              {currentStep === 1 && !isSuccess && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {currentStepData.title}
                    </h3>
                    <p className="text-slate-400">{currentStepData.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vault-name" className="text-slate-300">Vault Name</Label>
                      <Input
                        id="vault-name"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        placeholder="e.g., Family Memories, Letters to Sarah, Life Stories"
                        className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="vault-description" className="text-slate-300">Description</Label>
                      <Textarea
                        id="vault-description"
                        value={vaultDescription}
                        onChange={(e) => setVaultDescription(e.target.value)}
                        placeholder="Describe what this vault contains and why it's important..."
                        className="mt-2 bg-slate-800/50 border-slate-600 text-white min-h-[100px]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Contacts */}
              {currentStep === 2 && !isSuccess && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {currentStepData.title}
                    </h3>
                    <p className="text-slate-400">{currentStepData.description}</p>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-white mb-2">No Contacts Yet</h4>
                      <p className="text-slate-400 mb-6">
                        You can create your vault now and add trusted contacts later, or add contacts first.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={handleAddContacts}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Contacts First
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleSkipContacts}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          Skip for Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search contacts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>

                      {/* Selected Count */}
                      {selectedContacts.length > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
                          <span className="text-blue-300 text-sm">
                            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                          </span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Will have vault access
                          </Badge>
                        </div>
                      )}

                      {/* Optional Notice */}
                      <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-500/30">
                        <p className="text-amber-300 text-sm">
                          💡 You can skip this step and add contacts to your vault later from the vault settings.
                        </p>
                      </div>

                      {/* Contacts List */}
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredContacts.map((contact) => (
                          <Card
                            key={contact.id}
                            className={`p-4 cursor-pointer transition-all border-2 ${
                              selectedContacts.includes(contact.id)
                                ? 'bg-blue-900/20 border-blue-500/50'
                                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                            }`}
                            onClick={() => handleContactToggle(contact.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedContacts.includes(contact.id)}
                                onChange={() => handleContactToggle(contact.id)}
                              />
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-white">{contact.fullName || 'Unknown Contact'}</h4>
                                  {contact.isVerified && (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-400">{contact.email}</p>
                                <p className="text-xs text-slate-500 capitalize">{contact.relationship || 'Other'}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {filteredContacts.length === 0 && searchQuery && (
                        <div className="text-center py-8">
                          <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-400">No contacts found matching "{searchQuery}"</p>
                        </div>
                      )}

                      {/* Add More Contacts Option */}
                      <div className="pt-4 border-t border-slate-700/50">
                        <Button
                          variant="outline"
                          onClick={handleAddContacts}
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add More Contacts
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          {currentStep < 3 && !isSuccess && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                
                {currentStep === 2 ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCreateVault}
                      disabled={isCreating}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isCreating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <>
                          Create Vault
                          <Shield className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};