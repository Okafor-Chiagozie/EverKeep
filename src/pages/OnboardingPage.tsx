import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Key, 
  Clock, 
  Users, 
  Vault, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

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
    title: 'Generate Encryption Keys',
    description: 'Create unbreakable encryption for your vault',
    icon: Key
  },
  {
    id: 3,
    title: 'Setup Secure Delivery',
    description: 'Configure when to deliver your vault',
    icon: Clock
  },
  {
    id: 4,
    title: 'Add Your First Contact',
    description: 'Choose who will receive your memories',
    icon: Users
  },
  {
    id: 5,
    title: 'Create Your First Vault',
    description: 'Start preserving your legacy',
    icon: Vault
  }
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [deadmanDays, setDeadmanDays] = useState('60');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [vaultName, setVaultName] = useState('');
  
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (currentStep === 2) {
      // Generate encryption keys
      setIsGeneratingKeys(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate key generation
      setIsGeneratingKeys(false);
    }
    
    if (currentStep === steps.length) {
      // Complete onboarding
      setUser({ 
        ...user,
        isOnboarded: true, 
        deadmanTrigger: parseInt(deadmanDays),
        encryptionKey: 'generated-key-hash'
      });
      navigate('/dashboard');
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps.find(step => step.id === currentStep)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
                        <p className="text-sm text-slate-400">Secure Delivery delivery</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
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

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Configure Your Secure Delivery
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

                {currentStep === 4 && (
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

                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Create Your First Vault
                      </h3>
                      <p className="text-slate-400">
                        Give your vault a meaningful name to get started.
                      </p>
                    </div>
                    
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

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-sm text-slate-300">Encrypted</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                          <Users className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-sm text-slate-300">Private</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-sm text-slate-300">Timed</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isGeneratingKeys || 
                    (currentStep === 3 && !deadmanDays) ||
                    (currentStep === 4 && (!contactName || !contactEmail)) ||
                    (currentStep === 5 && !vaultName)
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {currentStep === steps.length ? 'Complete Setup' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}