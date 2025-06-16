import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  X, 
  Users, 
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle
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
import { useVaults } from '@/contexts/VaultContext';

interface CreateVaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const vaultSteps = [
  { id: 1, title: 'Basic Information', description: 'Name and describe your vault' },
  { id: 2, title: 'Choose Folders', description: 'Select folder types for organization' },
  { id: 3, title: 'Add Recipients', description: 'Choose who will receive this vault' },
  { id: 4, title: 'Delivery Settings', description: 'Configure when and how to deliver' },
  { id: 5, title: 'Review & Create', description: 'Review and encrypt your vault' }
];

const folderTypes = [
  { id: 'letters', name: 'Letters', icon: 'Mail', description: 'Personal messages and letters' },
  { id: 'photos', name: 'Photos', icon: 'Image', description: 'Precious memories and images' },
  { id: 'videos', name: 'Videos', icon: 'Video', description: 'Video messages and recordings' },
  { id: 'audio', name: 'Audio', icon: 'Mic', description: 'Voice messages and recordings' },
  { id: 'documents', name: 'Documents', icon: 'FileText', description: 'Important documents and files' },
  { id: 'passwords', name: 'Passwords', icon: 'Key', description: 'Account passwords and credentials' }
];

export function CreateVaultDialog({ open, onOpenChange }: CreateVaultDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form data
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [selectedFolders, setSelectedFolders] = useState<string[]>(['letters']);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [deliveryDelay, setDeliveryDelay] = useState('immediate');
  
  const { addVault, contacts } = useVaults();

  const handleNext = () => {
    if (currentStep < vaultSteps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreateVault = async () => {
    setIsCreating(true);
    
    // Simulate vault creation and encryption
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newVault = {
      name: vaultName,
      description: vaultDescription,
      status: 'active' as const,
      recipients: selectedRecipients,
      folders: selectedFolders.map(folderId => {
        const folderType = folderTypes.find(f => f.id === folderId);
        return {
          id: folderId,
          name: folderType?.name || 'Folder',
          icon: folderType?.icon || 'Folder',
          entries: []
        };
      })
    };
    
    addVault(newVault);
    setIsCreating(false);
    
    // Reset form
    setCurrentStep(1);
    setVaultName('');
    setVaultDescription('');
    setSelectedFolders(['letters']);
    setSelectedRecipients([]);
    setDeliveryDelay('immediate');
    
    onOpenChange(false);
  };

  const handleFolderToggle = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return vaultName.trim() && vaultDescription.trim();
      case 2: return selectedFolders.length > 0;
      case 3: return selectedRecipients.length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const progress = (currentStep / vaultSteps.length) * 100;
  const currentStepData = vaultSteps.find(step => step.id === currentStep)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
        <DialogTitle className="sr-only">Create New Vault</DialogTitle>
        
        <div className="p-6 sm:p-8 relative">
          {/* Close Button - positioned absolutely */}
          <button
            onClick={() => onOpenChange(false)}
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
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">
                  Step {currentStep} of {vaultSteps.length}: {currentStepData.title}
                </span>
                <span className="text-sm text-slate-400">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </DialogHeader>

          <div className="py-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
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

            {/* Step 2: Choose Folders */}
            {currentStep === 2 && (
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

                <div className="grid grid-cols-2 gap-4">
                  {folderTypes.map((folder) => (
                    <Card
                      key={folder.id}
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        selectedFolders.includes(folder.id)
                          ? 'bg-blue-900/20 border-blue-500/50'
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                      }`}
                      onClick={() => handleFolderToggle(folder.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedFolders.includes(folder.id)}
                          onChange={() => handleFolderToggle(folder.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{folder.name}</h4>
                          <p className="text-sm text-slate-400 mt-1">{folder.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Add Recipients */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
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
                      You need to add contacts before creating a vault.
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <Card
                        key={contact.id}
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          selectedRecipients.includes(contact.id)
                            ? 'bg-blue-900/20 border-blue-500/50'
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                        }`}
                        onClick={() => handleRecipientToggle(contact.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedRecipients.includes(contact.id)}
                            onChange={() => handleRecipientToggle(contact.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-white">{contact.name}</h4>
                              {contact.verified && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <p className="text-sm text-slate-400">{contact.email}</p>
                            <p className="text-xs text-slate-500 capitalize">{contact.role}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Additional steps would go here... */}
            {currentStep >= 4 && (
              <motion.div
                key={`step${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Create</h3>
                <p className="text-slate-400 mb-8">
                  Your vault will be encrypted and secured immediately.
                </p>

                {isCreating && (
                  <div className="space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                    />
                    <p className="text-blue-400">Encrypting your vault...</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
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
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              
              {currentStep < vaultSteps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateVault}
                  disabled={!canProceed() || isCreating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isCreating ? 'Creating...' : 'Create Vault'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}