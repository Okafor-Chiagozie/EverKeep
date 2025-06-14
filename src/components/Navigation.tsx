import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Shield, 
  Users, 
  Clock, 
  Settings, 
  LogOut,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/vaults', icon: Shield, label: 'Vaults' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-slate-900/90 backdrop-blur-xl border-slate-700/50"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ 
          x: isMobileMenuOpen ? 0 : -300 
        }}
        className={`
          fixed left-0 top-0 h-screen w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 z-50
          lg:translate-x-0 lg:static lg:z-auto
          transition-transform duration-300 ease-in-out
        `}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">EverKeep</h1>
              <p className="text-xs text-slate-400">Digital Vault</p>
            </div>
          </div>

          <Button 
            className="w-full mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Vault
          </Button>

          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <Separator className="my-4 sm:my-6 bg-slate-700/50" />

          <Button
            variant="ghost"
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/50">
            <p className="text-sm text-slate-300 mb-2">Deadman Switch</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Next check-in</span>
              <span className="text-sm font-medium text-green-400">42 days</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Desktop Navigation Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>
    </>
  );
}