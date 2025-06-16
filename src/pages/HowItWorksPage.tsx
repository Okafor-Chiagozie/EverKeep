import { motion } from 'framer-motion';
import { 
  Shield, 
  UserPlus, 
  Upload, 
  Clock, 
  Send,
  Key,
  Lock,
  CheckCircle,
  ArrowRight,
  FileText,
  Users,
  Mail,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Vault',
      description: 'Sign up and create your first secure digital vault with military-grade encryption.',
      icon: Shield,
      color: 'blue',
      details: [
        'Choose a unique vault name',
        'Set up your master password',
        'Generate encryption keys',
        'Configure security settings'
      ]
    },
    {
      number: '02',
      title: 'Add Your Memories',
      description: 'Upload photos, videos, letters, and documents that you want to preserve.',
      icon: Upload,
      color: 'green',
      details: [
        'Drag and drop files',
        'Write personal messages',
        'Record video messages',
        'Organize in folders'
      ]
    },
    {
      number: '03',
      title: 'Choose Recipients',
      description: 'Select trusted family members and friends who will receive your vault.',
      icon: UserPlus,
      color: 'purple',
      details: [
        'Add contact information',
        'Set recipient roles',
        'Verify identities',
        'Configure access levels'
      ]
    },
    {
      number: '04',
      title: 'Set Delivery Rules',
      description: 'Configure when and how your vault should be delivered to recipients.',
      icon: Clock,
      color: 'amber',
      details: [
        'Set deadman switch timer',
        'Choose delivery triggers',
        'Add verification questions',
        'Schedule check-ins'
      ]
    },
    {
      number: '05',
      title: 'Secure Delivery',
      description: 'When the time comes, your vault is securely delivered to your chosen recipients.',
      icon: Send,
      color: 'pink',
      details: [
        'Automatic trigger activation',
        'Secure notification sent',
        'Identity verification required',
        'Encrypted content delivered'
      ]
    }
  ];

  const securityFeatures = [
    {
      icon: Key,
      title: 'Zero-Knowledge Encryption',
      description: 'Your data is encrypted with keys only you control. We never have access to your unencrypted content.'
    },
    {
      icon: Lock,
      title: 'End-to-End Security',
      description: 'Data is encrypted on your device before upload and only decrypted by authorized recipients.'
    },
    {
      icon: Shield,
      title: 'Military-Grade Protection',
      description: '256-bit AES encryption with RSA key pairs ensures your data is protected against any threat.'
    },
    {
      icon: CheckCircle,
      title: 'Verified Recipients',
      description: 'Multi-factor authentication and identity verification ensure only intended recipients access your vault.'
    }
  ];

  const deliveryMethods = [
    {
      icon: Clock,
      title: 'Deadman Switch',
      description: 'Automatic delivery after a period of inactivity',
      features: ['Customizable timeframe', 'Regular check-ins', 'Emergency contacts', 'Grace periods']
    },
    {
      icon: Mail,
      title: 'Scheduled Delivery',
      description: 'Deliver on specific dates or milestones',
      features: ['Birthday messages', 'Anniversary notes', 'Graduation letters', 'Wedding videos']
    },
    {
      icon: Users,
      title: 'Trusted Contacts',
      description: 'Manual trigger by designated trustees',
      features: ['Multiple trustees', 'Consensus requirements', 'Emergency protocols', 'Backup contacts']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              How EverKeep
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Protects Your Legacy
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              A simple, secure process that ensures your most precious memories 
              reach the right people at the right time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Works anywhere</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
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

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-${step.color}-500/20 flex items-center justify-center`}>
                      <step.icon className={`w-8 h-8 text-${step.color}-400`} />
                    </div>
                    <div>
                      <Badge className={`bg-${step.color}-500/20 text-${step.color}-400 border-${step.color}-500/30 mb-2`}>
                        Step {step.number}
                      </Badge>
                      <h3 className="text-2xl lg:text-3xl font-bold text-white">{step.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-3">
                        <CheckCircle className={`w-5 h-5 text-${step.color}-400 flex-shrink-0`} />
                        <span className="text-slate-300">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br from-${step.color}-500/10 to-transparent`}></div>
                    <div className="relative z-10">
                      <div className={`w-20 h-20 rounded-full bg-${step.color}-500/20 flex items-center justify-center mx-auto mb-6`}>
                        <step.icon className={`w-10 h-10 text-${step.color}-400`} />
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold text-${step.color}-400 mb-2`}>{step.number}</div>
                        <div className="text-white font-semibold">{step.title}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Uncompromising Security
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Your data is protected with the same encryption used by banks and governments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Methods Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Flexible Delivery Options
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Choose how and when your vault is delivered to your loved ones
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {deliveryMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                    <method.icon className="w-8 h-8 text-blue-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">{method.title}</h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">{method.description}</p>
                  
                  <div className="space-y-2">
                    {method.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span className="text-sm text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Create your first vault in minutes and start preserving your legacy today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                Start Your Vault
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}