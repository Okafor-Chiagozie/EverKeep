import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user';
import { User as UserType } from '@/types/user';

export function SettingsPage() {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    inactivity_threshold_days: 60
  });

  // Local input state for months (allows empty while typing)
  const [inactivityMonthsInput, setInactivityMonthsInput] = useState<string>('');
  const [inactivityMonthsError, setInactivityMonthsError] = useState<string>('');

  // Per-card banners
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [inactivitySuccess, setInactivitySuccess] = useState('');
  const [inactivityError, setInactivityError] = useState('');

  // Track original values to detect changes
  const [originalData, setOriginalData] = useState({
    full_name: '',
    phone: '',
    inactivity_threshold_days: 60
  });

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser?.id) return;
      
      try {
        setIsLoading(true);
        const response = await userService.getUserById(authUser.id);
        
        if (response.isSuccessful && response.data) {
          setUserProfile(response.data);
          const userData = {
            full_name: response.data.full_name || '',
            phone: response.data.phone || '',
            inactivity_threshold_days: response.data.inactivity_threshold_days || 60
          };
          setFormData(userData);
          setOriginalData(userData);
          // initialize months input from days
          const months = Math.round(userData.inactivity_threshold_days / 30);
          setInactivityMonthsInput(String(months));
          setInactivityMonthsError('');
        } else {
          setError('Failed to load user profile');
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [authUser?.id]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if account info has changes
  const hasAccountChanges = () => {
    return formData.full_name !== originalData.full_name || 
           formData.phone !== originalData.phone;
  };

  // Check if inactivity settings have changes
  const hasInactivityChanges = () => {
    return formData.inactivity_threshold_days !== originalData.inactivity_threshold_days;
  };

  const handleSaveAccountInfo = async () => {
    if (!authUser?.id || !userProfile || !hasAccountChanges()) return;
    
    setIsSaving(true);
    setAccountError('');
    setAccountSuccess('');
    
    try {
      const response = await userService.updateUser(authUser.id, {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim()
      });

      if (response.isSuccessful && response.data) {
        setUserProfile(response.data);
        const updatedData = {
          ...originalData,
          full_name: response.data.full_name || '',
          phone: response.data.phone || ''
        };
        setOriginalData(updatedData);
        setAccountSuccess('Account information saved successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setAccountSuccess(''), 3000);
      } else {
        setAccountError(response.errors[0]?.description || 'Failed to save account information');
      }
    } catch (err) {
      console.error('Error saving account info:', err);
      setAccountError('Failed to save account information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInactivitySettings = async () => {
    if (!authUser?.id || !userProfile || !hasInactivityChanges() || inactivityMonthsError || inactivityMonthsInput === '') return;
    
    setIsSaving(true);
    setInactivityError('');
    setInactivitySuccess('');
    
    try {
      const response = await userService.updateUser(authUser.id, {
        inactivity_threshold_days: formData.inactivity_threshold_days
      });

      if (response.isSuccessful && response.data) {
        setUserProfile(response.data);
        const updatedData = {
          ...originalData,
          inactivity_threshold_days: response.data.inactivity_threshold_days || 60
        };
        setOriginalData(updatedData);
        setInactivitySuccess('Inactivity settings saved successfully!');
        // sync months input
        const months = Math.round((response.data.inactivity_threshold_days || 60) / 30);
        setInactivityMonthsInput(String(months));
        setInactivityMonthsError('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setInactivitySuccess(''), 3000);
      } else {
        setInactivityError(response.errors[0]?.description || 'Failed to save inactivity settings');
      }
    } catch (err) {
      console.error('Error saving inactivity settings:', err);
      setInactivityError('Failed to save inactivity settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Convert days to months for display
  const inactivityMonths = Math.round(formData.inactivity_threshold_days / 30);
  
  // Handle months input and convert to days (only when valid)
  const handleMonthsInputChange = (raw: string) => {
    setInactivityMonthsInput(raw);

    if (raw === '') {
      setInactivityMonthsError('Please enter a value between 1 and 12');
      return;
    }

    // allow only digits
    const num = Number(raw);
    if (!Number.isInteger(num)) {
      setInactivityMonthsError('Value must be a whole number between 1 and 12');
      return;
    }
    if (num < 1 || num > 12) {
      setInactivityMonthsError('Value must be between 1 and 12');
      return;
    }

    setInactivityMonthsError('');
    const days = num * 30;
    handleInputChange('inactivity_threshold_days', days);
  };

  const clearMessage = () => {
    setError('');

  };

  const clearAccountMessage = () => {
    setAccountError('');
    setAccountSuccess('');
  };

  const clearInactivityMessage = () => {
    setInactivityError('');
    setInactivitySuccess('');
  };

  // Check email verification status from auth user
  const isEmailVerified = () => {
    return authUser?.isVerified === true;
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 lg:mt-0 mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              <span>Settings</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Manage your account and vault preferences
            </p>
          </div>
        </motion.div>

        {/* Page-level error (e.g., load failure) */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-3 bg-red-900/20 border-red-500/30">
              <div className="flex items-center">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessage}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Card-level banners */}
          {accountSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-3 p-3 bg-green-900/20 border-green-500/30">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm">{accountSuccess}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAccountMessage} className="ml-auto text-green-400 hover:text-green-300">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          {accountError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-3 p-3 bg-red-900/20 border-red-500/30">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{accountError}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAccountMessage} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Account Information</span>
              </h3>
              <Button
                onClick={handleSaveAccountInfo}
                disabled={isSaving || !hasAccountChanges()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-sm">Save</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="mt-2 bg-slate-800/30 border-slate-600 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                />
              </div>

              <Separator className="bg-slate-700/50" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h4 className="font-medium text-white">Account Status</h4>
                  <p className="text-sm text-slate-400">
                    Your account is {isEmailVerified() ? 'verified and active' : 'pending verification'}
                  </p>
                </div>
                <Badge className={
                  isEmailVerified() 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {isEmailVerified() ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              <Separator className="bg-slate-700/50" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h4 className="font-medium text-white">Last Login</h4>
                  <p className="text-sm text-slate-400">
                    {userProfile?.last_login 
                      ? `Last accessed on ${new Date(userProfile.last_login).toLocaleDateString()} at ${new Date(userProfile.last_login).toLocaleTimeString()}`
                      : 'No login history available'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    {userProfile?.last_login 
                      ? new Date(userProfile.last_login).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>

              {userProfile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-slate-400">Account Created</p>
                    <p className="text-white font-medium">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Last Login</p>
                    <p className="text-white font-medium">
                      {new Date(userProfile.last_login).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Vault Delivery Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Card-level banners */}
          {inactivitySuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-3 p-3 bg-green-900/20 border-green-500/30">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm">{inactivitySuccess}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearInactivityMessage} className="ml-auto text-green-400 hover:text-green-300">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          {inactivityError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-3 p-3 bg-red-900/20 border-red-500/30">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{inactivityError}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearInactivityMessage} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Vault Delivery Settings</span>
              </h3>
              <Button
                onClick={handleSaveInactivitySettings}
                disabled={isSaving || !hasInactivityChanges() || Boolean(inactivityMonthsError) || inactivityMonthsInput === ''}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2"
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-sm">Save</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Inactivity Period */}
              <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="font-medium text-white">Inactivity Threshold</h4>
                    <p className="text-sm text-slate-400">How long before vault delivery is triggered</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-amber-400">{inactivityMonths}</p>
                    <p className="text-xs text-slate-400">months</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="inactivity-months" className="text-slate-300">
                    Inactivity Period (1-12 months)
                  </Label>
                  <Input
                    id="inactivity-months"
                    type="number"
                    min="1"
                    max="12"
                    value={inactivityMonthsInput}
                    onChange={(e) => handleMonthsInputChange(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                  {inactivityMonthsError && (
                    <p className="text-xs text-red-400">{inactivityMonthsError}</p>
                  )}
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>
                      Your vault will be delivered to recipients if you don't log in for {formData.inactivity_threshold_days} days
                    </p>
                    <p className="text-amber-400">
                      ⚠️ This setting affects all your vaults
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Settings Summary */}
              <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                <h4 className="font-medium text-blue-300 mb-3">Current Settings Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inactivity threshold:</span>
                    <span className="text-white">{formData.inactivity_threshold_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last login:</span>
                    <span className="text-white">
                      {userProfile ? new Date(userProfile.last_login).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Days since last login:</span>
                    <span className="text-white">
                      {userProfile ? Math.floor((Date.now() - new Date(userProfile.last_login).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}