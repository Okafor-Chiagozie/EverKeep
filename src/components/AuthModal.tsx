import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Reset isLogin when defaultMode changes
  useState(() => {
    setIsLogin(defaultMode === 'login');
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      if (isLogin) {
        // 🔥 LOGIN FLOW
        const response = await authService.login({ email, password });
        
        if (response.isSuccessful && response.data) {
          setUser(response.data.user);
          navigate('/dashboard');
          onOpenChange(false);
          resetForm();
          onSuccess?.();
        } else {
          setError(response.errors[0]?.description || 'Login failed');
        }
      } else {
        // 🔥 REGISTRATION FLOW WITH AUTO-LOGIN
        const registerResponse = await authService.register({ 
          email, 
          password, 
          full_name: name,
          phone 
        });
        
        if (registerResponse.isSuccessful && registerResponse.data) {
          console.log('✅ Registration successful, now logging in...');
          
          try {
            // 🔥 AUTOMATICALLY LOGIN AFTER SUCCESSFUL REGISTRATION
            const loginResponse = await authService.login({ email, password });
            
            if (loginResponse.isSuccessful && loginResponse.data) {
              console.log('✅ Auto-login successful');
              setUser(loginResponse.data.user);
              navigate('/dashboard');
              onOpenChange(false);
              resetForm();
              onSuccess?.();
            } else {
              // Registration succeeded but login failed - show login form
              console.warn('⚠️ Registration succeeded but auto-login failed');
              setSuccessMessage('Account created successfully! Verify your email and sign in with your credentials.');
              setIsLogin(true); // Switch to login mode
              setPassword(''); // Clear password for security
            }
          } catch (loginError) {
            console.error('❌ Auto-login failed:', loginError);
            setSuccessMessage('Account created successfully! Verify your email and sign in with your credentials.');
            setIsLogin(true); // Switch to login mode
            setPassword(''); // Clear password for security
          }
        } else {
          setError(registerResponse.errors[0]?.description || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setSuccessMessage('');
  };

  const handleModalClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleModeToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md bg-slate-900/95 border-slate-700 mx-4 sm:mx-0">
        <DialogTitle className="sr-only">
          {isLogin ? 'Sign In to EverKeep' : 'Create EverKeep Account'}
        </DialogTitle>
        
        <div className="modal-content-compact relative">
          {/* Close Button */}
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 group"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-4 pr-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Vault'}
            </h2>
            <p className="text-slate-400">
              {isLogin 
                ? 'Sign in to access your digital vault'
                : 'Start preserving your legacy today'
              }
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-300 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-200 text-lg py-4 h-auto"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {isLogin 
                      ? 'Signing In...' 
                      : 'Creating Account...'
                    }
                  </span>
                </div>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center mt-5">
            <p className="text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button
              variant="link"
              onClick={handleModeToggle}
              className="text-blue-400 hover:text-blue-300 p-0 h-auto font-medium"
            >
              {isLogin ? 'Create one here' : 'Sign in instead'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}