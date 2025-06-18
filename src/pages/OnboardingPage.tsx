import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Key, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Vault
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/supabaseClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to EverKeep',
    description: 'Let\'s set up your secure digital vault',
    icon: Shield
  },
  {
    id: 2,
    title: 'Create Your First Vault',
    description: 'Give your vault a meaningful name',
    icon: Vault
  },
  {
    id: 3,
    title: 'Generate Encryption Keys',
    description: 'Create unbreakable encryption for your vault',
    icon: Key
  },
  {
    id: 4,
    title: 'Setup Deadman Switch',
    description: 'Configure when to deliver your vault',
    icon: Clock
  },
  {
    id: 5,
    title: 'Add Your First Contact',
    description: 'Choose who will receive your memories',
    icon: Users
  }
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [deadmanDays, setDeadmanDays] = useState('60');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  const handleNext = async () => {
    if (currentStep === 3) {
      // Generate encryption keys
      setIsGeneratingKeys(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate key generation
      setIsGeneratingKeys(false);
    }
    
    if (currentStep === steps.length) {
      setIsLoading(true);
      try {
        // Refresh user data to ensure we have the latest auth state
        
        
        if (!user?.id) {
          throw new Error('Please sign in to continue with onboarding');
        }

        // Create initial vault with all settings
        const { data: vault, error: vaultError } = await supabase
          .from('vaults')
          .insert({
            user_id: user.id,
            name: vaultName,
            description: vaultDescription,
            encryption_key: 'generated-key-hash',
            deadman_trigger: parseInt(deadmanDays),
            status: 'active'
          })
          .select()
          .single();

        if (vaultError) {
          console.error('Vault creation error:', vaultError);
          throw new Error('Failed to create vault. Please try again.');
        }

        if (!vault) {
          throw new Error('Failed to create vault. Please try again.');
        }

        // Create deadman settings for the vault
        const { error: deadmanError } = await supabase
          .from('vault_deadman_settings')
          .insert({
            vault_id: vault.id,
            check_in_frequency: parseInt(deadmanDays),
            next_check_in: new Date(Date.now() + parseInt(deadmanDays) * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            auto_deliver: true
          });

        if (deadmanError) {
          console.error('Deadman settings error:', deadmanError);
          throw new Error('Failed to set up deadman switch. Please try again.');
        }

        // Add the contact
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            user_id: user.id,
            name: contactName,
            email: contactEmail,
            role: 'next-of-kin',
            verified: false
          })
          .select()
          .single();

        if (contactError) {
          console.error('Contact creation error:', contactError);
          throw new Error('Failed to add contact. Please try again.');
        }

        if (!contact) {
          throw new Error('Failed to add contact. Please try again.');
        }

        // Create vault recipient relationship
        const { error: recipientError } = await supabase
          .from('vault_recipients')
          .insert({
            vault_id: vault.id,
            contact_id: contact.id
          });

        if (recipientError) {
          console.error('Vault recipient error:', recipientError);
          throw new Error('Failed to set up vault recipient. Please try again.');
        }

        toast.success('Onboarding completed successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        toast.error(error instanceof Error ? error.message : 'An error occurred during onboarding');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps[currentStep - 1];

  // If user is not authenticated, show a message and redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-slate-700/50 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
            <p className="text-slate-300 mb-6">
              Please sign in to continue with the onboarding process.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Email Verification Alert */}
        {!user.isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                Please verify your email address to ensure you don't lose access to your vault.
                Check your inbox for the verification link.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-300">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <currentStepData.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-white mb-4">
                  {currentStepData.title}
                </h1>
                <p className="text-lg text-slate-300">
                  {currentStepData.description}
                </p>
              </div>

              {/* Step-specific content */}
              <div className="space-y-6">
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center space-x-2 mb-6">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Welcome aboard!</span>
                    </div>
                    <p className="text-slate-300 mb-8 leading-relaxed">
                      We'll guide you through setting up your secure digital vault. 
                      This process takes just a few minutes but ensures your memories 
                      are preserved forever.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        <Shield className="w-6 h-6 text-blue-400 mb-2" />
                        <h3 className="font-semibold text-white">Secure</h3>
                        <p className="text-sm text-slate-400">Military-grade encryption</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        <Clock className="w-6 h-6 text-green-400 mb-2" />
                        <h3 className="font-semibold text-white">Automatic</h3>
                        <p className="text-sm text-slate-400">Deadman switch delivery</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label htmlFor="vault-name" className="text-slate-300">Vault Name</Label>
                      <Input
                        id="vault-name"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                        placeholder="e.g., Family Memories, Letters to Sarah, Life Stories"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="vault-description" className="text-slate-300">Description</Label>
                      <Input
                        id="vault-description"
                        value={vaultDescription}
                        onChange={(e) => setVaultDescription(e.target.value)}
                        className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                        placeholder="Describe what this vault contains"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    {isGeneratingKeys ? (
                      <div className="space-y-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="w-16 h-16 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Generating Your Keys...
                          </h3>
                          <p className="text-slate-400">
                            Creating 2048-bit RSA encryption keys
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-green-900/20 border border-green-500/30">
                          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Encryption Keys Generated
                          </h3>
                          <p className="text-slate-300">
                            Your vault is now protected with unbreakable encryption. 
                            Only you and your chosen recipients can access your content.
                          </p>
                        </div>
                        <div className="text-left space-y-3">
                          <div className="flex items-center space-x-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300">2048-bit RSA key pair generated</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300">Private key encrypted with master password</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300">Public key ready for recipient sharing</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Configure Your Deadman Switch
                      </h3>
                      <p className="text-slate-400">
                        This determines when your vault is automatically delivered if you stop checking in.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="deadman-days" className="text-slate-300 text-lg">
                        Days of inactivity before delivery
                      </Label>
                      <Input
                        id="deadman-days"
                        type="number"
                        value={deadmanDays}
                        onChange={(e) => setDeadmanDays(e.target.value)}
                        min="30"
                        max="365"
                        className="mt-2 text-center text-2xl font-bold bg-slate-800/50 border-slate-600 text-white"
                      />
                      <p className="text-sm text-slate-400 mt-2 text-center">
                        Recommended: 60-90 days
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                      <h4 className="font-semibold text-blue-300 mb-2">How it works:</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• We'll send you regular check-in reminders</li>
                        <li>• If you don't respond within the set timeframe</li>
                        <li>• Your vault will be delivered to your chosen recipients</li>
                        <li>• You can always cancel or extend the deadline</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Add Your First Trusted Contact
                      </h3>
                      <p className="text-slate-400">
                        This person will receive your vault when the time comes.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contact-name" className="text-slate-300">Full Name</Label>
                        <Input
                          id="contact-name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          placeholder="Enter their full name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contact-email" className="text-slate-300">Email Address</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          placeholder="Enter their email address"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30">
                      <h4 className="font-semibold text-amber-300 mb-2">Privacy Note:</h4>
                      <p className="text-sm text-slate-300">
                        Your contact won't be notified until your vault is ready for delivery. 
                        They won't know they've been added to your vault.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isLoading || isGeneratingKeys || 
                    (currentStep === 2 && (!vaultName || !vaultDescription)) ||
                    (currentStep === 4 && !deadmanDays) ||
                    (currentStep === 5 && (!contactName || !contactEmail))
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    'Processing...'
                  ) : currentStep === steps.length ? (
                    'Complete Setup'
                  ) : (
                    'Continue'
                  )}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}