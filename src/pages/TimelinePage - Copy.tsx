import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Key,
  Calendar,
  Search,
  Loader2,
  X,
  Upload,
  LogIn,
  Settings,
  Trash2,
  UserPlus,
  UserMinus,
  Download,
  RefreshCw,
  Filter,
  Bell
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notification';
import { Notification } from '@/types/notification';
import { NotificationHelper, ActivityType } from '@/utils/notificationHelper';

interface TimelineEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function TimelinePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 20;

  // Fetch timeline events
  const fetchEvents = async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (!user) return;

    try {
      if (pageNum === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await notificationService.getNotifications({
        pageSize,
        pageNumber: pageNum,
        user_id: user.id
      });

      if (response.isSuccessful) {
        const timelineEvents = response.data.map(notification => 
          convertNotificationToEvent(notification)
        );

        if (pageNum === 1) {
          setEvents(timelineEvents);
        } else {
          setEvents(prev => [...prev, ...timelineEvents]);
        }
        
        setPage(pageNum);
        setHasMore(response.data.length === pageSize);
        setError('');
      } else {
        setError(response.errors[0]?.description || 'Failed to fetch timeline');
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError('Failed to fetch timeline');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents(1);
  }, [user]);

  // Convert notification to timeline event
  const convertNotificationToEvent = (notification: Notification): TimelineEvent => {
    const content = NotificationHelper.parseNotificationContent(notification.content);
    
    return {
      id: notification.id,
      type: content.type || 'system_event',
      title: notification.title,
      description: content.description || notification.content,
      timestamp: new Date(notification.timestamp),
      metadata: content.metadata || {}
    };
  };

  // Load more events
  const loadMoreEvents = async () => {
    if (!user || !hasMore || loadingMore) return;
    await fetchEvents(page + 1);
  };

  // Refresh timeline
  const refreshTimeline = async () => {
    await fetchEvents(1, true);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterType !== 'all') {
      switch (filterType) {
        case 'vault':
          matchesFilter = ['vault_created', 'vault_updated', 'vault_deleted'].includes(event.type);
          break;
        case 'entry':
          matchesFilter = ['entry_added', 'entry_deleted', 'file_uploaded'].includes(event.type);
          break;
        case 'contact':
          matchesFilter = ['contact_added', 'contact_updated', 'contact_deleted', 'recipient_added', 'recipient_removed'].includes(event.type);
          break;
        case 'security':
          matchesFilter = ['login', 'security_check'].includes(event.type);
          break;
        case 'system':
          matchesFilter = event.type === 'system_event';
          break;
        default:
          matchesFilter = true;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Get icon component for event type
  const getEventIcon = (type: ActivityType) => {
    const iconMap: Record<ActivityType, any> = {
      vault_created: Shield,
      vault_updated: Shield,
      vault_deleted: Trash2,
      entry_added: FileText,
      entry_deleted: FileText,
      contact_added: Users,
      contact_updated: Users,
      contact_deleted: UserMinus,
      recipient_added: UserPlus,
      recipient_removed: UserMinus,
      file_uploaded: Upload,
      login: LogIn,
      security_check: Key,
      system_event: Settings
    };
    
    return iconMap[type] || Bell;
  };

  // Get color for event type
  const getEventColor = (type: ActivityType) => {
    const color = NotificationHelper.getActivityColor(type);
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Get readable activity type
  const getActivityTypeLabel = (type: ActivityType): string => {
    const labelMap: Record<ActivityType, string> = {
      vault_created: 'Vault',
      vault_updated: 'Vault',
      vault_deleted: 'Vault',
      entry_added: 'Entry',
      entry_deleted: 'Entry',
      contact_added: 'Contact',
      contact_updated: 'Contact',
      contact_deleted: 'Contact',
      recipient_added: 'Recipient',
      recipient_removed: 'Recipient',
      file_uploaded: 'Upload',
      login: 'Security',
      security_check: 'Security',
      system_event: 'System'
    };
    
    return labelMap[type] || 'Event';
  };

  // Export timeline
  const exportTimeline = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Title', 'Description', 'Metadata'],
      ...filteredEvents.map(event => [
        event.timestamp.toISOString(),
        event.type,
        `"${event.title.replace(/"/g, '""')}"`,
        `"${event.description.replace(/"/g, '""')}"`,
        `"${JSON.stringify(event.metadata || {}).replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `everkeep-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  // Get time ago format
  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const eventTypes = [
    { id: 'all', name: 'All Events', count: events.length },
    { id: 'vault', name: 'Vaults', count: events.filter(e => ['vault_created', 'vault_updated', 'vault_deleted'].includes(e.type)).length },
    { id: 'entry', name: 'Entries', count: events.filter(e => ['entry_added', 'entry_deleted', 'file_uploaded'].includes(e.type)).length },
    { id: 'contact', name: 'Contacts', count: events.filter(e => ['contact_added', 'contact_updated', 'contact_deleted', 'recipient_added', 'recipient_removed'].includes(e.type)).length },
    { id: 'security', name: 'Security', count: events.filter(e => ['login', 'security_check'].includes(e.type)).length },
    { id: 'system', name: 'System', count: events.filter(e => e.type === 'system_event').length }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 lg:mt-0 mt-16">
        {/* Error Message */}
        {error && (
          <Card className="p-3 bg-red-900/20 border-red-500/30">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              <span className="truncate">Activity Timeline</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Track all activities and changes in your digital vault
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={refreshTimeline}
              disabled={refreshing}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800 flex-shrink-0" 
              size="sm"
              onClick={exportTimeline}
              disabled={filteredEvents.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          {[
            { 
              title: 'Total Events', 
              value: events.length, 
              icon: Bell, 
              color: 'blue' 
            },
            { 
              title: 'Recent Logins', 
              value: events.filter(e => e.type === 'login').length, 
              icon: LogIn, 
              color: 'green' 
            },
            { 
              title: 'Vault Actions', 
              value: events.filter(e => ['vault_created', 'vault_updated', 'vault_deleted'].includes(e.type)).length, 
              icon: Shield, 
              color: 'blue' 
            },
            { 
              title: 'File Uploads', 
              value: events.filter(e => e.type === 'file_uploaded').length, 
              icon: Upload, 
              color: 'purple' 
            },
          ].map((stat, index) => (
            <Card key={stat.title} className="p-3 sm:p-4 lg:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-slate-400">{stat.title}</p>
                </div>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-400`} />
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search timeline events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {eventTypes.map((type) => (
              <Button
                key={type.id}
                variant={filterType === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type.id)}
                className={
                  filterType === type.id
                    ? 'bg-blue-600 hover:bg-blue-700 whitespace-nowrap'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800 whitespace-nowrap'
                }
              >
                {type.name} ({type.count})
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        {filteredEvents.length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent opacity-50"></div>

            <div className="space-y-4 sm:space-y-6">
              {filteredEvents.map((event, index) => {
                const IconComponent = getEventIcon(event.type);
                const colorClasses = getEventColor(event.type);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative flex items-start space-x-4 sm:space-x-6"
                  >
                    {/* Timeline Dot */}
                    <div className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center ${colorClasses.split(' ')[0]} flex-shrink-0`}>
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses.split(' ')[1]}`} />
                    </div>

                    {/* Event Card */}
                    <Card className="flex-1 p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 group">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                              {event.title}
                            </h3>
                            <span className="text-xs text-slate-500">
                              {getTimeAgo(event.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                        
                        <Badge className={`${colorClasses} border ml-0 sm:ml-4 w-fit text-xs flex-shrink-0`}>
                          {getActivityTypeLabel(event.type)}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{event.timestamp.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-white w-fit text-xs sm:text-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              console.log(`Event: ${event.title}`, event.metadata);
                              // You could implement a modal here to show detailed metadata
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8 sm:mt-12"
              >
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={loadMoreEvents}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    'Load More Events'
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
              {searchQuery || filterType !== 'all' ? (
                <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
              ) : (
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              {searchQuery || filterType !== 'all' ? 'No Events Found' : 'No Activity Yet'}
            </h3>
            <p className="text-sm sm:text-base text-slate-400 mb-6 px-4 max-w-md mx-auto">
              {searchQuery 
                ? `No events match "${searchQuery}"${filterType !== 'all' ? ` in ${filterType} category` : ''}`
                : filterType !== 'all'
                ? `No events found in the ${filterType} category`
                : 'Start using your vault to see activity here. Create vaults, add contacts, and upload files to build your timeline.'
              }
            </p>
            {(searchQuery || filterType !== 'all') && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}