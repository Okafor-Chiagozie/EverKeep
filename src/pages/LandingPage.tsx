import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Heart, 
  Clock, 
  Users, 
  Sparkles,
  ArrowRight,
  Mail,
  CheckCircle,
  Star,
  Globe,
  Smartphone,
  Key,
  FileText,
  Image,
  Video,
  Mic,
  Quote,
  Play,
  Download,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register(email, password, name);
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Encryption',
      description: 'Your memories are protected with end-to-end encryption that even we cannot access.',
      color: 'blue'
    },
    {
      icon: Clock,
      title: 'Deadman Switch',
      description: 'Automatically deliver your vault when you can no longer check in.',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Trusted Recipients',
      description: 'Choose who receives your memories and messages after you are gone.',
      color: 'purple'
    },
    {
      icon: Heart,
      title: 'Preserve Legacy',
      description: 'Store photos, videos, voice messages, and heartfelt letters for your loved ones.',
      color: 'pink'
    },
    {
      icon: Globe,
      title: 'Access Anywhere',
      description: 'Progressive web app works on any device, online or offline.',
      color: 'amber'
    },
    {
      icon: Key,
      title: 'Zero Knowledge',
      description: 'Only you and your recipients can decrypt your vault contents.',
      color: 'red'
    }
  ];

  const contentTypes = [
    { icon: FileText, name: 'Letters & Messages', description: 'Heartfelt letters and personal messages' },
    { icon: Image, name: 'Photos & Memories', description: 'Precious photos and visual memories' },
    { icon: Video, name: 'Video Messages', description: 'Personal video recordings and messages' },
    { icon: Mic, name: 'Voice Recordings', description: 'Audio messages and voice memos' },
    { icon: Lock, name: 'Passwords & Keys', description: 'Important credentials and access keys' },
    { icon: FileText, name: 'Documents', description: 'Legal documents and important files' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Mother of Two',
      content: 'EverKeep gave me peace of mind knowing my children will have my letters and memories when they need them most.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Tech Executive',
      content: 'The security and encryption are top-notch. I trust EverKeep with my most sensitive digital assets.',
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Artist',
      content: 'Being able to leave video messages for my grandchildren is priceless. The interface is beautiful and intuitive.',
      avatar: 'ER'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Families Protected' },
    { number: '1M+', label: 'Memories Preserved' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '256-bit', label: 'Encryption Standard' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400 uppercase tracking-wide">
                  Preserve Your Legacy
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your Digital
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Afterlife Vault
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                Securely store your most precious memories, messages, and digital assets. 
                When you're gone, your loved ones will receive what matters most.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  size="lg"
                  onClick={() => {
                    setIsLogin(false);
                    setShowAuthModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-4 h-auto"
                >
                  Start Your Vault
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-10 py-4 h-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>GDPR compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Zero knowledge encryption</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Family Memories</h3>
                    <p className="text-sm text-slate-400">Encrypted vault • 3 recipients</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {['Letter to Sarah.txt', 'Family_Photos_2024.zip', 'Birthday_Message.mp4'].map((file, index) => (
                    <motion.div
                      key={file}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{file}</p>
                        <p className="text-xs text-slate-400">Encrypted • Ready for delivery</p>
                      </div>
                      <Lock className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-green-900/20 border border-green-500/30">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">Vault secured and ready</span>
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Built for Security & Peace of Mind
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every feature is designed with your privacy and your family's future in mind
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-12 lg:py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Store Any Type of Memory
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              From heartfelt letters to precious photos, preserve everything that matters
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <type.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{type.name}</h3>
                    <p className="text-sm text-slate-400">{type.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Simple Setup, Lifetime Protection
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Get started in minutes with our guided setup process
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Vault',
                description: 'Set up your secure digital vault with military-grade encryption',
                icon: Shield
              },
              {
                step: '2',
                title: 'Add Your Memories',
                description: 'Upload photos, videos, letters, and important documents',
                icon: Heart
              },
              {
                step: '3',
                title: 'Choose Recipients',
                description: 'Select trusted family and friends to receive your vault',
                icon: Users
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Trusted by Families Worldwide
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See what our users say about protecting their digital legacy
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full">
                  <Quote className="w-8 h-8 text-blue-400 mb-6" />
                  <p className="text-slate-300 leading-relaxed mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Start Preserving Your Legacy Today
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of families who trust EverKeep to protect their most precious memories
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  onClick={() => {
                    setIsLogin(false);
                    setShowAuthModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-4 h-auto"
                >
                  Create Your Vault
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-10 py-4 h-auto"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download App
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>SOC 2 certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Works on all devices</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md bg-slate-900/95 border-slate-700">
          <div className="modal-content-compact relative">
            {/* Close Button with Icon - positioned absolutely */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Your Vault'}
              </h2>
              <p className="text-slate-400">
                {isLogin 
                  ? 'Sign in to access your digital vault'
                  : 'Start preserving your legacy today'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-4 h-auto"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="text-center mt-5">
              <p className="text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 p-0 h-auto font-medium"
              >
                {isLogin ? 'Create one here' : 'Sign in instead'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}