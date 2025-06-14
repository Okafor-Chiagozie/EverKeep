import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  EyeOff,
  Heart,
  FileText,
  Image,
  Video,
  Mic,
  Calendar,
  User
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function RecipientView() {
  const { id } = useParams();
  const [step, setStep] = useState(1); // 1: OTP, 2: Identity, 3: Decrypting, 4: Vault
  const [otp, setOtp] = useState('');
  const [identityAnswer, setIdentityAnswer] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Mock vault data
  const vaultData = {
    name: 'Family Memories',
    description: 'Messages and memories from Sarah Johnson',
    deliveredAt: new Date(),
    folders: [
      {
        id: 'letters',
        name: 'Letters',
        icon: FileText,
        entries: [
          {
            id: '1',
            title: 'Letter to My Daughter',
            content: 'My dearest daughter, if you are reading this, it means I am no longer with you. I want you to know how proud I am of the woman you have become...',
            timestamp: new Date('2024-01-15'),
            type: 'text'
          }
        ]
      },
      {
        id: 'photos',
        name: 'Photos',
        icon: Image,
        entries: [
          {
            id: '2',
            title: 'Family Vacation 2023',
            content: 'Our last family vacation together at the beach.',
            timestamp: new Date('2024-01-10'),
            type: 'image'
          }
        ]
      },
      {
        id: 'videos',
        name: 'Video Messages',
        icon: Video,
        entries: [
          {
            id: '3',
            title: 'Birthday Message',
            content: 'A special message for your 25th birthday.',
            timestamp: new Date('2024-01-05'),
            type: 'video'
          }
        ]
      }
    ]
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(2);
    }
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (identityAnswer.trim()) {
      setStep(3);
      setIsDecrypting(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsDecrypting(false);
      setStep(4);
    }
  };

  const getIcon = (IconComponent: any) => IconComponent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: OTP Verification */}
          {step === 1 && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Vault Access</h1>
                  <p className="text-slate-400">
                    Enter the verification code sent to your email
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="otp" className="text-slate-300">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      className="mt-2 text-center text-2xl font-mono bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Verify Code
                  </Button>

                  <div className="text-center">
                    <Button variant="link" className="text-slate-400 hover:text-white">
                      Resend Code
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Identity Verification */}
          {step === 2 && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <Card className="p-8 bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Identity Check</h1>
                  <p className="text-slate-400">
                    Answer this question to verify your identity
                  </p>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                  <p className="text-blue-300 font-medium">
                    "What was the name of our first pet together?"
                  </p>
                </div>

                <form onSubmit={handleIdentitySubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="identity" className="text-slate-300">Your Answer</Label>
                    <Input
                      id="identity"
                      type="text"
                      value={identityAnswer}
                      onChange={(e) => setIdentityAnswer(e.target.value)}
                      placeholder="Enter your answer"
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!identityAnswer.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    Verify Identity
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Decrypting */}
          {step === 3 && (
            <motion.div
              key="decrypting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto text-center"
            >
              <Card className="p-12 bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center"
                >
                  <Key className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white mb-4">Decrypting Vault</h2>
                <p className="text-slate-400 mb-8">
                  Please wait while we decrypt your vault contents...
                </p>
                
                <div className="space-y-2">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                  <p className="text-sm text-slate-400">Decrypting with your private key...</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Vault Contents */}
          {step === 4 && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center"
                >
                  <Heart className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">{vaultData.name}</h1>
                <p className="text-slate-400 mb-4">{vaultData.description}</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Successfully Decrypted
                </Badge>
              </div>

              <div className="grid lg:grid-cols-4 gap-8">
                {/* Folders Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                    <h3 className="font-semibold text-white mb-4">Folders</h3>
                    <div className="space-y-2">
                      {vaultData.folders.map((folder) => {
                        const IconComponent = getIcon(folder.icon);
                        return (
                          <button
                            key={folder.id}
                            onClick={() => setSelectedFolder(folder.id)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                              selectedFolder === folder.id
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">{folder.name}</div>
                              <div className="text-xs opacity-70">
                                {folder.entries.length} items
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <Separator className="my-6 bg-slate-700/50" />

                    <div className="space-y-3">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                      <div className="text-xs text-slate-400 text-center">
                        Delivered: {vaultData.deliveredAt.toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                  {!selectedFolder ? (
                    <Card className="p-12 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-center">
                      <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Welcome to Your Vault
                      </h3>
                      <p className="text-slate-400">
                        Select a folder from the sidebar to view the contents left for you.
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {vaultData.folders
                        .find(f => f.id === selectedFolder)
                        ?.entries.map((entry, index) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold text-white mb-2">
                                    {entry.title}
                                  </h3>
                                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>{entry.timestamp.toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                  {entry.type}
                                </Badge>
                              </div>
                              
                              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {entry.content}
                              </div>

                              <div className="flex justify-end mt-6">
                                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}