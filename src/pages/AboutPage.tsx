import { motion } from 'framer-motion';
import { 
  Shield, 
  Heart, 
  Users, 
  Globe,
  Target,
  CheckCircle,
  Quote
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your data is protected with military-grade encryption. We never have access to your unencrypted content.',
      color: 'blue'
    },
    {
      icon: Heart,
      title: 'Preserving Legacy',
      description: 'We believe every life story matters and deserves to be preserved for future generations.',
      color: 'pink'
    },
    {
      icon: Users,
      title: 'Family Focused',
      description: 'Built by families, for families. We understand the importance of connection across generations.',
      color: 'purple'
    },
    {
      icon: Globe,
      title: 'Accessible Everywhere',
      description: 'Your memories should be accessible anywhere, anytime. Our platform works on all devices.',
      color: 'green'
    }
  ];

  const team = [
    {
      name: 'Chiagozie Okafor',
      role: 'Founder & CEO',
      bio: 'Former security engineer at Apple with 15 years in encryption technology.',
      avatar: 'CO'
    },
    {
      name: 'Martins Onyia',
      role: 'Co Founder',
      bio: 'Ex-Google engineer specializing in distributed systems and data security.',
      avatar: 'MO'
    },
    {
      name: 'Chimdike Anagbo',
      role: 'Co Founder',
      bio: 'Award-winning UX designer focused on creating meaningful digital experiences.',
      avatar: 'CA'
    }
  ];

  const milestones = [
    {
      year: '2025',
      title: 'Company Founded',
      description: 'EverKeep was born from a personal need to preserve family memories securely.'
    },
    {
      year: '2025',
      title: 'Beta Launch',
      description: 'Launched private beta with 1,000 families testing our platform.'
    },
    {
      year: '2026',
      title: 'Public Release',
      description: 'Officially launched to the public with enterprise-grade security.'
    },
    {
      year: '2027',
      title: '50K+ Families',
      description: 'Reached milestone of protecting memories for over 50,000 families worldwide.'
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
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">EverKeep</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Preserving Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Digital Legacy
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              We're on a mission to ensure that no precious memory, heartfelt message, 
              or important document is ever lost. Your legacy deserves to live on.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Founded in 2022</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>50K+ families protected</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>99.9% uptime guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl lg:text-4xl font-bold text-white">Our Mission</h2>
              </div>
              
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                Every family has stories worth preserving. Every person has messages they want 
                to share with their loved ones. We believe these precious moments shouldn't be 
                lost to time or technology failures.
              </p>
              
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                EverKeep was created to bridge the gap between our digital lives and our human 
                need for connection across generations. We're building the most secure, reliable, 
                and compassionate platform for digital legacy preservation.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-slate-300">Preserve memories with military-grade security</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-slate-300">Ensure your legacy reaches the right people</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  <span className="text-slate-300">Provide peace of mind for families worldwide</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                <Quote className="w-12 h-12 text-blue-400 mb-6" />
                <blockquote className="text-xl text-slate-300 leading-relaxed mb-6">
                  "Technology should serve humanity's deepest needs - connection, love, and remembrance. 
                  That's why we built EverKeep."
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    CO
                  </div>
                  <div>
                    <div className="font-semibold text-white">Chiagozie okafor</div>
                    <div className="text-sm text-slate-400">Founder & CEO</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Our Values</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              These core principles guide everything we do at EverKeep
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-${value.color}-500/20 flex items-center justify-center mx-auto mb-6`}>
                    <value.icon className={`w-8 h-8 text-${value.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{value.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 lg:py-20 bg-slate-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Our Journey</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              From a personal need to a platform trusted by thousands of families
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative flex items-start space-x-8"
                >
                  <div className="relative z-10 w-16 h-16 rounded-full bg-slate-900 border-4 border-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-400">{milestone.year}</span>
                  </div>
                  
                  <Card className="flex-1 p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-2">{milestone.title}</h3>
                    <p className="text-slate-400">{milestone.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Meet Our Team</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Passionate experts dedicated to protecting your digital legacy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-blue-400 text-sm mb-3">{member.role}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{member.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Preserve Your Legacy?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of families who trust EverKeep to protect their most precious memories
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-4 h-auto">
                Start Your Vault
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-10 py-4 h-auto"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}