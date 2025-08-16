import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  FileText, 
  Plus,
  Activity,
  CheckCircle,
  Settings,
  Eye,
  Archive,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { vaultService } from '@/services/vault';
import { contactService } from '@/services/contact';
import { notificationService } from '@/services/notification';
import { Vault } from '@/types/vault';
import { Contact } from '@/types/contact';
import { Notification } from '@/types/notification';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentActivity, setRecentActivity] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch vaults
        const vaultsResponse = await vaultService.getVaults({
          pageSize: 50,
          pageNumber: 1,
          user_id: user.id
        });
        
        // Fetch contacts
        const contactsResponse = await contactService.getContacts({
          pageSize: 50,
          pageNumber: 1,
          user_id: user.id
        });
        
        // Fetch recent notifications as activity
        const activityResponse = await notificationService.getNotifications({
          pageSize: 10,
          pageNumber: 1,
          user_id: user.id
        });

        if (vaultsResponse.isSuccessful && vaultsResponse.data) {
          setVaults(vaultsResponse.data);
        }
        
        if (contactsResponse.isSuccessful && contactsResponse.data) {
          setContacts(contactsResponse.data);
        }
        
        if (activityResponse.isSuccessful && activityResponse.data) {
          setRecentActivity(activityResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  // Calculate stats
  const totalVaults = vaults.length;
  const unverifiedContacts = contacts.filter(contact => !contact.isVerified).length;

  const quickActions = [
    { 
      title: 'Create New Vault', 
      description: 'Start preserving new memories',
      icon: Shield,
      action: '/vaults',
      color: 'blue'
    },
    { 
      title: 'Add Trusted Contact', 
      description: 'Invite someone you trust',
      icon: UserPlus,
      action: '/contacts',
      color: 'purple'
    },
    { 
      title: 'Account Settings', 
      description: 'Manage your preferences',
      icon: Settings,
      action: '/settings',
      color: 'green'
    },
    { 
      title: 'View All Activity', 
      description: 'See your complete timeline',
      icon: Activity,
      action: '/timeline',
      color: 'amber'
    },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Card className="p-6 bg-red-900/20 border-red-500/30 max-w-md">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error Loading Dashboard</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 lg:mt-0 mt-16">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
            <span>👋</span>
            <span className="truncate">Welcome back, {user?.full_name || user?.email}</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Your memories are secure and your legacy is being preserved.
          </p>
        </motion.div>

        {/* Account Activity Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Account Active & Secure</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Last login: {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Today'} • Account verified: {user?.isVerified ? 'Yes' : 'Pending'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[
            { 
              title: 'Total Vaults', 
              value: totalVaults, 
              icon: Shield, 
              color: 'blue',
              description: 'Digital vaults created'
            },
            { 
              title: 'Verified Contacts', 
              value: unverifiedContacts, 
              icon: Users, 
              color: 'green',
              description: 'Trusted contacts'
            },
            { 
              title: 'Recent Activity', 
              value: recentActivity.length, 
              icon: Activity, 
              color: 'purple',
              description: 'Recent actions'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="p-3 sm:p-4 lg:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-400`} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-300 leading-tight">{stat.title}</p>
                  <p className="text-xs text-slate-400">{stat.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center space-x-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Quick Actions</span>
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                {quickActions.map((action) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full p-3 sm:p-4 h-auto justify-start hover:bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50"
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-${action.color}-500/20 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0`}>
                        <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${action.color}-400`} />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium text-white text-sm sm:text-base truncate">{action.title}</p>
                        <p className="text-xs sm:text-sm text-slate-400 truncate">{action.description}</p>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Recent Activity</span>
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/timeline')}
                  className="text-slate-400 hover:text-white text-xs sm:text-sm"
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 4).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-white truncate">{activity.title}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No recent activity</p>
                    <p className="text-slate-500 text-xs">Start by creating your first vault</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/timeline')}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Complete Timeline
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}