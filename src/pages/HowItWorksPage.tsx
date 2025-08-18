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
  Users,
  Mail,
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
      title: 'Create Your Account',
      description: 'Sign up with your email and create a secure account with password protection.',
      icon: Shield,
      color: 'blue',
      details: [
        'Simple email registration',
        'Secure password setup',
        'Account verification',
        'Profile customization'
      ]
    },
    {
      number: '02',
      title: 'Build Your Contact Network',
      description: 'Add trusted family members and friends as contacts in your secure network.',
      icon: UserPlus,
      color: 'green',
      details: [
        'Add contact information',
        'Verify contact details',
        'Set relationships',
        'Manage contact list'
      ]
    },
    {
      number: '03',
      title: 'Create Digital Vaults',
      description: 'Create secure vaults to store your messages, photos, and important documents.',
      icon: Upload,
      color: 'purple',
      details: [
        'Name your vault',
        'Add descriptions',
        'Organize content',
        'Set privacy settings'
      ]
    },
    {
      number: '04',
      title: 'Add Vault Recipients',
      description: 'Assign your trusted contacts as recipients who can access specific vaults.',
      icon: Users,
      color: 'amber',
      details: [
        'Select from contacts',
        'Assign to vaults',
        'Manage permissions',
        'Track assignments'
      ]
    },
    {
      number: '05',
      title: 'Share Your Legacy',
      description: 'Your vaults are securely shared with recipients when you choose to share them.',
      icon: Send,
      color: 'pink',
      details: [
        'Manual sharing control',
        'Secure access links',
        'Recipient verification',
        'Content delivery'
      ]
    }
  ];

  const securityFeatures = [
    {
      icon: Key,
      title: 'User-Based Encryption',
      description: 'Each user has their own encryption keys, ensuring data privacy and security.'
    },
    {
      icon: Lock,
      title: 'Secure Authentication',
      description: 'JWT-based authentication with secure password hashing protects your account.'
    },
    {
      icon: Shield,
      title: 'Data Protection',
      description: 'Your personal data and vault contents are protected with industry-standard security.'
    },
    {
      icon: CheckCircle,
      title: 'Contact Verification',
      description: 'Verify your contacts to ensure only trusted people access your vaults.'
    }
  ];

  const deliveryMethods = [
    {
      icon: Clock,
      title: 'Manual Sharing',
      description: 'Share vaults when you\'re ready by sending secure access links',
      features: ['Direct sharing', 'Link generation', 'Access control', 'Recipient management']
    },
    {
      icon: Mail,
      title: 'Vault Management',
      description: 'Organize and manage multiple vaults for different purposes',
      features: ['Multiple vaults', 'Content organization', 'File attachments', 'Message storage']
    },
    {
      icon: Users,
      title: 'Contact Management',
      description: 'Build and maintain your trusted network of contacts',
      features: ['Contact profiles', 'Relationship tracking', 'Verification system', 'Network building']
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
                Works for You
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              A straightforward process to create secure vaults, manage your trusted contacts, 
              and share your legacy when you're ready.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Secure vaults</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span>Easy setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Contact management</span>
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
              Simple Setup, Secure Vaults
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Get started in minutes with our straightforward vault creation process
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
                      <h3 className="text-2xl lg:text-3xl font-bold text-white">{step.number} {step.title}</h3>
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
                  <Card className="p-8 bg-gradient-to-br from-slate-800/60 via-slate-700/50 to-slate-800/60 backdrop-blur-sm border-slate-500/40 hover:border-slate-400/50 transition-all duration-500 hover:scale-105 relative overflow-hidden group">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700/15 via-transparent to-slate-600/15 opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-300/60 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-purple-300/60 rounded-full animate-pulse delay-1000"></div>
                      <div className="absolute top-1/2 right-8 w-1 h-1 bg-green-300/60 rounded-full animate-pulse delay-500"></div>
                    </div>
                    
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-100 transition-opacity duration-500 blur-sm"></div>
                    
                    <div className="relative z-10">
                      {/* Icon with enhanced styling */}
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-${step.color}-500/25 via-${step.color}-400/15 to-${step.color}-600/25 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-${step.color}-500/20`}>
                        <step.icon className={`w-12 h-12 text-${step.color}-200 transition-colors duration-300`} />
                      </div>
                      
                      {/* Step number with enhanced styling */}
                      <div className="text-center">
                        <div className={`text-5xl font-bold mb-3`}>
                          {step.number}
                        </div>
                        <div className="text-slate-100 font-semibold text-lg transition-colors duration-300">
                          {step.title}
                        </div>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-t-2 border-slate-500/30 rounded-tl-lg"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-b-2 border-slate-500/30 rounded-br-lg"></div>
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
                Built-in Security Features
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Your data is protected with industry-standard security measures
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
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="p-6 bg-gradient-to-br from-slate-800/60 via-slate-700/50 to-slate-800/60 backdrop-blur-sm border-slate-500/40 hover:border-slate-400/50 transition-all duration-500 h-full text-center relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-blue-400/5 opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Glowing border on hover */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-100 transition-opacity duration-500 blur-sm"></div>
                    
                    {/* Floating accent */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-100 transition-all duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400/25 via-blue-300/15 to-blue-500/25 flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-8 h-8 text-blue-200 transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-100 mb-3 transition-colors duration-300">{feature.title}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed transition-colors duration-300">{feature.description}</p>
                    </div>
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/0 via-blue-300/50 to-purple-400/0 opacity-100 transition-opacity duration-500"></div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Core App Features
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Everything you need to manage your vaults and contacts effectively
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
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="p-8 bg-gradient-to-br from-slate-800/60 via-slate-700/50 to-slate-800/60 backdrop-blur-sm border-slate-500/40 hover:border-slate-400/50 transition-all duration-500 h-full relative overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-blue-400/5 opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-100 transition-opacity duration-500 blur-sm"></div>
                    
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-400/30 rounded-tl-lg opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-purple-400/30 rounded-br-lg opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400/25 via-purple-400/15 to-blue-500/25 flex items-center justify-center mb-6">
                        <method.icon className="w-10 h-10 text-blue-200 transition-colors duration-300" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-slate-100 mb-3 transition-colors duration-300">{method.title}</h3>
                      <p className="text-slate-300 mb-6 leading-relaxed transition-colors duration-300">{method.description}</p>
                      
                      <div className="space-y-3">
                        {method.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-3 transition-transform duration-300">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 transition-transform duration-300"></div>
                            <span className="text-sm text-slate-200 transition-colors duration-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Bottom gradient line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/0 via-blue-300/50 to-purple-400/0 opacity-100 transition-opacity duration-500"></div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-slate-800/60 via-purple-800/30 to-slate-800/60 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Create your account and start building your secure vaults today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-lg px-10 py-4 h-auto shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
                Create Account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 text-lg px-10 py-4 h-auto backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Learn More
              </Button>
            </div>
            
            {/* Additional info */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
                <span>Setup in minutes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}