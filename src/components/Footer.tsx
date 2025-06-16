import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowRight, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuth();

  // Don't show footer on authenticated pages
  if (user && user.isOnboarded) {
    return null;
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR Compliance', href: '/gdpr' }
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/everkeep', icon: Twitter },
    { name: 'Facebook', href: 'https://facebook.com/everkeep', icon: Facebook },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/everkeep', icon: Linkedin }
  ];

  return (
    <footer className="bg-slate-900/90 border-t border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* About Us Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">EverKeep</h3>
                  <p className="text-sm text-slate-400">Digital Vault</p>
                </div>
              </Link>
              
              <h4 className="font-semibold text-white mb-4">About EverKeep</h4>
              <p className="text-slate-400 mb-6 leading-relaxed">
                EverKeep is the world's most secure posthumous digital vault platform. 
                We help families preserve their most precious memories, messages, and 
                digital assets with military-grade encryption, ensuring your legacy 
                lives on for future generations.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>50K+ Families Protected</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-6">Quick Links</h4>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-6">Legal</h4>
              <div className="space-y-3">
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h4 className="font-semibold text-white mb-6">Stay Connected</h4>
              
              {/* Newsletter Signup */}
              <div className="mb-8">
                <p className="text-slate-400 text-sm mb-4">
                  Get updates on new features and security insights.
                </p>
                
                {isSubscribed ? (
                  <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                    <p className="text-green-400 text-sm font-medium">
                      ✓ Successfully subscribed!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 h-auto"
                      size="sm"
                    >
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}
              </div>

              {/* Social Links */}
              <div>
                <h5 className="font-medium text-white mb-4">Follow Us</h5>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center justify-center transition-all duration-200 group"
                    >
                      <social.icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-slate-400 text-sm">
                &copy; 2024 EverKeep. Your memories, preserved forever.
              </p>
              <div className="flex items-center space-x-4 text-xs text-slate-500">
                <span>Made with ❤️ for families worldwide</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/contact" 
                  className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center space-x-1"
                >
                  <Mail className="w-4 h-4" />
                  <span>Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}