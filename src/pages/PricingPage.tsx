import { motion } from 'framer-motion';
import { 
  Shield, 
  Check, 
  Star,
  Crown,
  Users,
  Headphones,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Personal',
      description: 'Perfect for individuals starting their digital legacy',
      icon: Shield,
      color: 'blue',
      monthlyPrice: 5,
      annualPrice: 60,
      popular: false,
      features: [
        '1 Digital Vault',
        '5GB Storage',
        'Up to 5 Recipients',
        'Basic Encryption',
        'Email Support',
        'Mobile App Access',
        'Secure Delivery',
        'Basic Templates'
      ],
      limitations: [
        'Limited file types',
        'Standard delivery options'
      ]
    },
    {
      name: 'Family',
      description: 'Ideal for families wanting to preserve memories together',
      icon: Users,
      color: 'purple',
      monthlyPrice: 10,
      annualPrice: 120,
      popular: true,
      features: [
        '5 Digital Vaults',
        '50GB Storage',
        'Unlimited Recipients',
        'Advanced Encryption',
        'Priority Support',
        'All Device Access',
        'Advanced Secure Delivery',
        'Premium Templates',
        'Video Messages',
        'Scheduled Delivery',
        'Family Sharing',
        'Backup & Recovery'
      ],
      limitations: []
    },
    {
      name: 'Legacy',
      description: 'For those who want the ultimate in digital preservation',
      icon: Crown,
      color: 'amber',
      monthlyPrice: 12,
      annualPrice: 144,
      popular: false,
      features: [
        'Unlimited Vaults',
        '500GB Storage',
        'Unlimited Recipients',
        'Military-Grade Encryption',
        '24/7 Premium Support',
        'All Features Included',
        'Custom Delivery Rules',
        'White-Glove Setup',
        'Legal Document Storage',
        'Biometric Security',
        'Custom Branding',
        'API Access',
        'Dedicated Account Manager',
        'Priority Processing'
      ],
      limitations: []
    }
  ];

  const features = [
    {
      category: 'Storage & Vaults',
      items: [
        { name: 'Digital Vaults', personal: '1', family: '5', legacy: 'Unlimited' },
        { name: 'Storage Space', personal: '5GB', family: '50GB', legacy: '500GB' },
        { name: 'File Types', personal: 'Basic', family: 'All Types', legacy: 'All Types' },
        { name: 'Recipients', personal: '5', family: 'Unlimited', legacy: 'Unlimited' }
      ]
    },
    {
      category: 'Security & Delivery',
      items: [
        { name: 'Encryption Level', personal: 'Standard', family: 'Advanced', legacy: 'Military-Grade' },
        { name: 'Secure Delivery', personal: 'Basic', family: 'Advanced', legacy: 'Custom Rules' },
        { name: 'Biometric Security', personal: '✗', family: '✗', legacy: '✓' },
        { name: 'Legal Documents', personal: '✗', family: 'Limited', legacy: 'Full Support' }
      ]
    },
    {
      category: 'Support & Features',
      items: [
        { name: 'Support Level', personal: 'Email', family: 'Priority', legacy: '24/7 Premium' },
        { name: 'Mobile App', personal: '✓', family: '✓', legacy: '✓' },
        { name: 'API Access', personal: '✗', family: '✗', legacy: '✓' },
        { name: 'Account Manager', personal: '✗', family: '✗', legacy: '✓' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'What happens if I stop paying?',
      answer: 'Your vaults remain secure and will still be delivered according to your settings. However, you won\'t be able to add new content or modify existing vaults.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change your plan at any time. When upgrading, new features are available immediately. When downgrading, you have a grace period to adjust your content to fit the new limits.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial of our Family plan so you can experience all features before committing.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We use bank-level encryption and zero-knowledge architecture. This means even we cannot access your unencrypted data. Your content is protected with the same security standards used by financial institutions.'
    },
    {
      question: 'What if I forget my password?',
      answer: 'We offer secure account recovery options, but due to our zero-knowledge encryption, we cannot recover your vault contents if you lose your master password. We recommend using our secure backup options.'
    }
  ];

  const getPrice = (plan: any) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: any) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice;
    return monthlyCost - annualCost;
  };

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
              Simple, Transparent
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Choose the plan that fits your needs. All plans include our core security features 
              and lifetime access to your preserved memories.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-lg ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-lg ${isAnnual ? 'text-white' : 'text-slate-400'}`}>Annual</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-2">
                Save up to 25%
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full ${
                  plan.popular ? 'border-blue-500/50 bg-blue-900/10' : ''
                }`}>
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-${plan.color}-500/20 flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className={`w-8 h-8 text-${plan.color}-400`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-white">${getPrice(plan)}</span>
                        <span className="text-slate-400 ml-2">/{isAnnual ? 'year' : 'month'}</span>
                      </div>
                      {isAnnual && (
                        <div className="text-sm text-green-400 mt-1">
                          Save ${getSavings(plan)} per year
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className={`w-5 h-5 text-${plan.color}-400 flex-shrink-0`} />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full h-auto py-3 text-lg ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {plan.popular ? 'Start Free Trial' : 'Get Started'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-12 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Compare All Features
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See exactly what's included in each plan
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {features.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h3 className="text-xl font-semibold text-white mb-6 px-4">{category.category}</h3>
                
                <Card className="overflow-hidden bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left p-4 text-slate-300 font-medium">Feature</th>
                          <th className="text-center p-4 text-slate-300 font-medium">Personal</th>
                          <th className="text-center p-4 text-slate-300 font-medium">Family</th>
                          <th className="text-center p-4 text-slate-300 font-medium">Legacy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="border-b border-slate-700/30 last:border-b-0">
                            <td className="p-4 text-slate-300">{item.name}</td>
                            <td className="p-4 text-center text-slate-400">{item.personal}</td>
                            <td className="p-4 text-center text-slate-400">{item.family}</td>
                            <td className="p-4 text-center text-slate-400">{item.legacy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
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
              Start Your Free Trial Today
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Try EverKeep risk-free for 14 days. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-4 h-auto">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-10 py-4 h-auto">
                <Headphones className="w-5 h-5 mr-2" />
                Talk to Sales
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}