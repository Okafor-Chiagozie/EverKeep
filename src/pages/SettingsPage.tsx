import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Clock, 
  User, 
  Bell, 
  Key, 
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Mail,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [isRegeneratingKeys, setIsRegeneratingKeys] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    checkin: true,
    security: true
  });

  const handleRegenerateKeys = async () => {
    setIsRegeneratingKeys(true);
    // Simulate key regeneration
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRegeneratingKeys(false);
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Settings className="w-8 h-8 text-blue-400" />
            <span>Settings</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your account, security, and vault preferences
          </p>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border border-slate-700">
            <TabsTrigger value="account" className="data-[state=active]:bg-blue-600">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-blue-600">
              <Clock className="w-4 h-4 mr-2" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account Information</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      value={user?.name || ''}
                      onChange={(e) => updateUser({ name: e.target.value })}
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      onChange={(e) => updateUser({ email: e.target.value })}
                      className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Account Status</h4>
                    <p className="text-sm text-slate-400">Your account is active and verified</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </h3>

              <div className="space-y-6">
                {/* Encryption Keys */}
                <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Key className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Encryption Keys</h4>
                        <p className="text-sm text-slate-400">2048-bit RSA key pair</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleRegenerateKeys}
                      disabled={isRegeneratingKeys}
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      {isRegeneratingKeys ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                          <span>Regenerating...</span>
                        </div>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Regenerate Keys
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                      <Download className="w-4 h-4 mr-2" />
                      Backup Keys
                    </Button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                      <p className="text-sm text-slate-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Biometric Authentication */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-medium text-white">Biometric Authentication</h4>
                      <p className="text-sm text-slate-400">Use fingerprint or face recognition</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Delivery Settings */}
          <TabsContent value="delivery" className="space-y-6">
            <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Delivery Settings</span>
              </h3>

              <div className="space-y-6">
                {/* Deadman Switch */}
                <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-white">Deadman Switch Timer</h4>
                      <p className="text-sm text-slate-400">Days of inactivity before delivery</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">{user?.deadmanTrigger || 60}</p>
                      <p className="text-xs text-slate-400">days</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="deadman-days" className="text-slate-300">
                      Inactivity Period (30-365 days)
                    </Label>
                    <Input
                      id="deadman-days"
                      type="number"
                      min="30"
                      max="365"
                      value={user?.deadmanTrigger || 60}
                      onChange={(e) => updateUser({ deadmanTrigger: parseInt(e.target.value) })}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                {/* Check-in Reminders */}
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Check-in Reminders</h4>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <div>
                      <p className="font-medium text-white">Weekly Reminders</p>
                      <p className="text-sm text-slate-400">Get reminded to check in weekly</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <div>
                      <p className="font-medium text-white">Emergency Contacts</p>
                      <p className="text-sm text-slate-400">Notify emergency contacts before delivery</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">Email Notifications</p>
                      <p className="text-sm text-slate-400">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(value) => handleNotificationChange('email', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">Push Notifications</p>
                      <p className="text-sm text-slate-400">Browser and mobile notifications</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(value) => handleNotificationChange('push', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="font-medium text-white">Check-in Reminders</p>
                      <p className="text-sm text-slate-400">Deadman switch check-in alerts</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.checkin}
                    onCheckedChange={(value) => handleNotificationChange('checkin', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="font-medium text-white">Security Alerts</p>
                      <p className="text-sm text-slate-400">Important security notifications</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.security}
                    onCheckedChange={(value) => handleNotificationChange('security', value)}
                  />
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 bg-red-900/20 border-red-500/30">
              <h3 className="text-xl font-semibold text-red-400 mb-6 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Danger Zone</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Delete All Vaults</h4>
                    <p className="text-sm text-slate-400">Permanently delete all vaults and data</p>
                  </div>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Vaults
                  </Button>
                </div>

                <Separator className="bg-red-500/30" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Revoke All Deliveries</h4>
                    <p className="text-sm text-slate-400">Cancel all scheduled vault deliveries</p>
                  </div>
                  <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                    Revoke Deliveries
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}