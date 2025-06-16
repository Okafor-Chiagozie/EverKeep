import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  Users, 
  FileText, 
  AlertCircle,
  Plus,
  TrendingUp,
  Activity,
  Heart,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useVaults } from '@/contexts/VaultContext';

export function Dashboard() {
  const { user } = useAuth();
  const { vaults, contacts } = useVaults();

  const activeVaults = vaults.filter(v => v.status === 'active').length;
  const deliveredVaults = vaults.filter(v => v.status === 'delivered').length;
  const totalEntries = vaults.reduce((acc, vault) => 
    acc + vault.folders.reduce((folderAcc, folder) => folderAcc + folder.entries.length, 0), 0
  );

  const recentActivity = [
    { type: 'vault', action: 'Created vault "Family Photos"', time: '2 hours ago', icon: Shield },
    { type: 'entry', action: 'Added message to "Letters for Sarah"', time: '1 day ago', icon: FileText },
    { type: 'contact', action: 'Added John Smith as executor', time: '3 days ago', icon: Users },
    { type: 'checkin', action: 'Deadman switch check-in completed', time: '5 days ago', icon: Clock },
  ];

  const quickActions = [
    { 
      title: 'Create New Vault', 
      description: 'Start preserving new memories',
      icon: Shield,
      action: '/vaults/new',
      color: 'blue'
    },
    { 
      title: 'Add Entry', 
      description: 'Add to existing vault',
      icon: FileText,
      action: '/vaults',
      color: 'green'
    },
    { 
      title: 'Invite Contact', 
      description: 'Add trusted recipient',
      icon: Users,
      action: '/contacts/new',
      color: 'purple'
    },
    { 
      title: 'Record Message', 
      description: 'Voice or video message',
      icon: Heart,
      action: '/record',
      color: 'amber'
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
            <span>👋</span>
            <span className="truncate">Welcome back, {user?.name}</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Your memories are secure and your legacy is being preserved.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { 
              title: 'Active Vaults', 
              value: activeVaults, 
              icon: Shield, 
              color: 'blue',
              trend: '+2 this month'
            },
            { 
              title: 'Total Entries', 
              value: totalEntries, 
              icon: FileText, 
              color: 'green',
              trend: '+12 this week'
            },
            { 
              title: 'Trusted Contacts', 
              value: contacts.length, 
              icon: Users, 
              color: 'purple',
              trend: '2 verified'
            },
            { 
              title: 'Delivered Vaults', 
              value: deliveredVaults, 
              icon: Heart, 
              color: 'amber',
              trend: 'All time'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="p-3 sm:p-4 lg:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-400`} />
                  </div>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-300 leading-tight">{stat.title}</p>
                  <p className="text-xs text-slate-400">{stat.trend}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Recent Activity</span>
                </h3>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs sm:text-sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-white truncate">{activity.action}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center space-x-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Quick Actions</span>
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
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
        </div>

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}