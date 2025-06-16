import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { user } = useAuth();

  // Don't show footer on authenticated pages
  if (user && user.isOnboarded) {
    return null;
  }

  return (
    <footer className="py-12 bg-slate-900/80 border-t border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">EverKeep</h3>
                <p className="text-sm text-slate-400">Digital Vault</p>
              </div>
            </Link>
            <p className="text-slate-400 mb-4 max-w-md">
              Secure posthumous digital vault for your most precious memories. 
              Preserve your legacy with military-grade encryption.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'Facebook', 'LinkedIn'].map((social) => (
                <Button key={social} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  {social}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <div className="space-y-2">
              {[
                { name: 'Features', href: '/how-it-works' },
                { name: 'Security', href: '/about' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'API', href: '/contact' }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <div className="space-y-2">
              {[
                { name: 'Help Center', href: '/contact' },
                { name: 'Contact', href: '/contact' },
                { name: 'Privacy', href: '/about' },
                { name: 'Terms', href: '/about' }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700/50" />

        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-slate-400 text-sm">
            &copy; 2024 EverKeep. Your memories, preserved forever.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link to="/about" className="text-slate-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="text-slate-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}