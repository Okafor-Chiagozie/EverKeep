import { motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/vaults', icon: Shield, label: 'Vaults' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Navigation() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCreateVault = () => {
    navigate('/vaults');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header - Fixed position */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-lg bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-700/50 text-slate-300 hover:text-white p-0"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">EverKeep</span>
          </div>
        </div>
      </div>

      {/* Mobile Content Spacer */}
      <div className="lg:hidden h-16"></div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <motion.nav
        initial={false}
        animate={{ 
          x: isMobileMenuOpen ? 0 : -320 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed left-0 top-0 h-[100dvh] w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 shadow-2xl
          lg:translate-x-0 lg:z-auto lg:w-64 xl:w-72 2xl:w-80 lg:shadow-none lg:relative lg:h-screen
          flex flex-col navigation-sidebar
        `}
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-white truncate">EverKeep</h1>
              <p className="text-xs text-slate-400">Digital Vault</p>
            </div>
            {/* Mobile close button in header */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden w-8 h-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            onClick={handleCreateVault}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm py-3 h-auto shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Vault
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:shadow-md'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-blue-400' : ''
                  }`} />
                  <span className="font-medium truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 pb-8 lg:p-6 border-t border-slate-700/50 flex-shrink-0">
          {/* Sign Out Button */}
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full justify-start border-[1px] border-gray-700 text-slate-300 hover:text-white hover:bg-slate-800/50 py-3 h-auto"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </motion.nav>

      {/* Desktop Navigation Spacer - Fixed width to prevent layout shifts */}
      <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 flex-shrink-0"></div>
    </>
  );
}