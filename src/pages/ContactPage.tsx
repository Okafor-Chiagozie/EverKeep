import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageSquare,
  Clock,
  Shield,
  Users,
  CheckCircle,
  Twitter,
  Linkedin,
  Github,
  Facebook
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help with your account or technical issues',
      contact: 'support@everkeep.com',
      responseTime: 'Usually within 24 hours',
      color: 'blue'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '+1 (555) 123-4567',
      responseTime: 'Mon-Fri, 9AM-6PM EST',
      color: 'green'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      contact: 'Available in app',
      responseTime: 'Mon-Fri, 9AM-6PM EST',
      color: 'purple'
    }
  ];

  const offices = [
    {
      city: 'San Francisco',
      address: '123 Market Street, Suite 400',
      zipCode: 'San Francisco, CA 94105',
      country: 'United States'
    },
    {
      city: 'New York',
      address: '456 Broadway, Floor 12',
      zipCode: 'New York, NY 10013',
      country: 'United States'
    },
    {
      city: 'London',
      address: '789 Oxford Street',
      zipCode: 'London W1C 1JN',
      country: 'United Kingdom'
    }
  ];

  const socialLinks = [
    { icon: Twitter, name: 'Twitter', url: '#', color: 'blue' },
    { icon: Linkedin, name: 'LinkedIn', url: '#', color: 'blue' },
    { icon: Github, name: 'GitHub', url: '#', color: 'slate' },
    { icon: Facebook, name: 'Facebook', url: '#', color: 'blue' }
  ];

  const faqs = [
    {
      question: 'How secure is my data?',
      answer: 'We use military-grade encryption and zero-knowledge architecture to ensure your data is completely secure.'
    },
    {
      question: 'What happens if I forget my password?',
      answer: 'We offer secure account recovery options, but due to our encryption, we cannot recover vault contents without your master password.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel anytime. Your vaults will remain secure and deliverable according to your settings.'
    },
    {
      question: 'Do you offer enterprise solutions?',
      answer: 'Yes, we offer custom enterprise solutions for organizations. Contact our sales team for more information.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: ''
      });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              Get in
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Have questions about EverKeep? Need help with your account? 
              We're here to help you preserve your digital legacy.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secure Communication</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Expert Team</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              How Can We Help?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Choose the best way to reach us based on your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-${method.color}-500/20 flex items-center justify-center mx-auto mb-6`}>
                    <method.icon className={`w-8 h-8 text-${method.color}-400`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">{method.title}</h3>
                  <p className="text-slate-400 mb-4">{method.description}</p>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-white">{method.contact}</div>
                    <div className="text-sm text-slate-400">{method.responseTime}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 lg:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
                
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Message Sent!</h4>
                    <p className="text-slate-400">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-slate-300">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                        className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-slate-300">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        className="mt-2 bg-slate-800/50 border-slate-600 text-white min-h-[120px]"
                        placeholder="Tell us more about how we can help you..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-200 text-lg py-4 h-auto"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Office Locations */}
              <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>Our Offices</span>
                </h3>
                
                <div className="space-y-6">
                  {offices.map((office) => (
                    <div key={office.city} className="border-b border-slate-700/50 last:border-b-0 pb-4 last:pb-0">
                      <h4 className="font-semibold text-white mb-2">{office.city}</h4>
                      <div className="text-slate-400 text-sm space-y-1">
                        <div>{office.address}</div>
                        <div>{office.zipCode}</div>
                        <div>{office.country}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Social Links */}
              <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-6">Follow Us</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <social.icon className={`w-5 h-5 text-${social.color}-400`} />
                      <span className="text-slate-300">{social.name}</span>
                    </motion.a>
                  ))}
                </div>
              </Card>

              {/* Quick FAQ */}
              <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-6">Quick Answers</h3>
                
                <div className="space-y-4">
                  {faqs.slice(0, 3).map((faq) => (
                    <div key={faq.question} className="border-b border-slate-700/50 last:border-b-0 pb-4 last:pb-0">
                      <h4 className="font-medium text-white mb-2 text-sm">{faq.question}</h4>
                      <p className="text-slate-400 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}