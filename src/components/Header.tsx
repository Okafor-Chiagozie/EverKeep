import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'About', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' }
  ];

  // Don't show header on authenticated pages
  if (user && user.isOnboarded) {
    return null;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EverKeep</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Digital Vault</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`transition-colors ${
                  location.pathname === item.href
                    ? 'text-blue-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsLogin(true);
                setShowAuthModal(true);
              }}
              className="text-slate-300 hover:text-white hidden sm:inline-flex"
            >
              Sign In
            </Button>
            <Button
              onClick={() => {
                setIsLogin(false);
                setShowAuthModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden text-slate-300 hover:text-white"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pt-4 border-t border-slate-700/50"
            >
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`transition-colors ${
                      location.pathname === item.href
                        ? 'text-blue-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsLogin(true);
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="text-slate-300 hover:text-white justify-start"
                >
                  Sign In
                </Button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}