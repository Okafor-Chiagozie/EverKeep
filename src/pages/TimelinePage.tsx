import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Shield, 
  Users, 
  FileText, 
  AlertCircle,
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
  RefreshCw,
  Bell,
  Image,
  Video,
  FileAudio,
  File as FileGeneric,
  ShieldCheck,
  Lock,
  Unlock
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
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [recentEventsCount, setRecentEventsCount] = useState(0);
  const [last24HoursCount, setLast24HoursCount] = useState(0);

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

      if (response.isSuccessful && response.data) {
        console.log('🔍 Raw database notifications received:', response.data);
        
        const timelineEvents = response.data.map(notification => 
          convertNotificationToEvent(notification)
        );

        console.log('🔍 Converted timeline events:', timelineEvents);
        
        // Log timestamp analysis to help debug
        const timestamps = timelineEvents.map(event => ({
          id: event.id,
          title: event.title,
          timestamp: event.timestamp.toISOString(),
          timeDiff: Math.abs(new Date().getTime() - event.timestamp.getTime()) / 1000 // seconds from now
        }));
        console.log('🔍 Timeline timestamp analysis:', timestamps);
        
        if (pageNum === 1) {
          setEvents(timelineEvents);
        } else {
          setEvents(prev => [...prev, ...timelineEvents]);
        }

        // If this is the first page, also fetch total counts
        if (pageNum === 1) {
          await fetchTotalCounts();
        }

        // Check if there are more pages
        if (response.data.length < pageSize) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        setError(response.errors?.[0]?.description || 'Failed to fetch timeline events');
      }
    } catch (err) {
      console.error('Error fetching timeline events:', err);
      setError('Failed to fetch timeline events');
    } finally {
      if (pageNum === 1) {
        isRefresh ? setRefreshing(false) : setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Fetch total counts from database
  const fetchTotalCounts = async () => {
    if (!user) return;

    try {
      // Get total count by requesting a very large page size
      const totalResponse = await notificationService.getNotifications({
        pageSize: 10000, // Large number to get all notifications
        pageNumber: 1,
        user_id: user.id
      });

      if (totalResponse.isSuccessful && totalResponse.data) {
        const totalCount = totalResponse.data.length;
        setTotalEventsCount(totalCount);

        // Calculate recent events (last 30 days)
        const now = new Date();
        const recentCount = totalResponse.data.filter((notification: any) => {
          try {
            const eventTime = new Date(notification.timestamp);
            const diffInDays = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60 * 24);
            return diffInDays <= 30;
          } catch (error) {
            return false;
          }
        }).length;
        
        setRecentEventsCount(recentCount);

        // Calculate last 24 hours count
        const last24Hours = totalResponse.data.filter((notification: any) => {
          try {
            const eventTime = new Date(notification.timestamp);
            const diffInHours = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
            return diffInHours <= 24;
          } catch (error) {
            return false;
          }
        }).length;
        setLast24HoursCount(last24Hours);
        
        console.log('✅ Total counts fetched:', { total: totalCount, recent: recentCount, last24: last24Hours });
      }
    } catch (error) {
      console.error('❌ Error fetching total counts:', error);
      // Fallback to displayed events count if total fetch fails
      setTotalEventsCount(events.length);
      setRecentEventsCount(events.filter(e => {
        const now = new Date();
        const eventTime = new Date(e.timestamp);
        const diffInDays = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60 * 24);
        return diffInDays <= 30;
      }).length);
      setLast24HoursCount(events.filter(e => {
        const now = new Date();
        const eventTime = new Date(e.timestamp);
        const diffInHours = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
        return diffInHours <= 24;
      }).length);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents(1);
  }, [user]);

  // Convert notification to timeline event
  const convertNotificationToEvent = (notification: Notification): TimelineEvent => {
    console.log('🔍 ===== Processing Notification =====');
    console.log('🔍 Raw notification from database:', {
      id: notification.id,
      user_id: notification.user_id,
      title: notification.title,
      content: notification.content,
      timestamp: notification.timestamp,
      created_at: (notification as any).created_at,
      updated_at: (notification as any).updated_at
    });
    
    const content = NotificationHelper.parseNotificationContent(notification.content);
    
    console.log('🔍 Parsed content:', {
      parsedContent: content,
      parsedTitle: content.title,
      parsedType: content.type,
      parsedDescription: content.description,
      parsedTimestamp: content.timestamp,
      parsedMetadata: content.metadata
    });
    
    // Enhanced date parsing with fallbacks
    let timestamp: Date;
    try {
      // The backend now properly sends timestamp field mapped from createdAt
      if (notification.timestamp) {
        const parsedNotificationDate = new Date(notification.timestamp);
        if (!isNaN(parsedNotificationDate.getTime())) {
          timestamp = parsedNotificationDate;
          console.log('✅ Using notification timestamp:', notification.timestamp, '→', timestamp.toISOString());
        } else {
          throw new Error('Invalid notification timestamp');
        }
      } else {
        // This should never happen now, but log it if it does
        console.error(`❌ No timestamp available for notification ${notification.id}`);
        throw new Error('No timestamp available');
      }
    } catch (error) {
      console.error(`❌ Timestamp parsing failed for notification ${notification.id}:`, error);
      throw error; // Don't fallback to current date - this will show an error instead
    }
    
    // Determine the activity type with better fallback logic
    let activityType: ActivityType = 'system_event';
    
    if (content.type && content.type !== 'system_event') {
      activityType = content.type;
      console.log('✅ Using parsed content type:', activityType);
    } else {
      // Try to infer type from title or description
      const title = notification.title.toLowerCase();
      const description = (content.description || notification.content || '').toLowerCase();
      
      console.log('🔍 Inferring activity type from:', { title, description });
      
      // Check for file/media uploads first (most specific)
      if (title.includes('upload') || title.includes('file') || description.includes('upload') || description.includes('file')) {
        activityType = 'file_uploaded';
      }
      // Check for vault operations
      else if (title.includes('vault') || description.includes('vault')) {
        if (title.includes('created') || description.includes('created')) {
          activityType = 'vault_created';
        } else if (title.includes('updated') || description.includes('updated')) {
          activityType = 'vault_updated';
        } else if (title.includes('deleted') || description.includes('deleted')) {
          activityType = 'vault_deleted';
        }
      }
      // Check for entry operations (text, notes, messages)
      else if (title.includes('entry') || title.includes('added') || title.includes('text') || title.includes('note') || title.includes('message') || 
               description.includes('entry') || description.includes('added') || description.includes('text') || description.includes('note') || description.includes('message')) {
        if (title.includes('added') || description.includes('added') || title.includes('created') || description.includes('created')) {
          activityType = 'entry_added';
        } else if (title.includes('removed') || title.includes('deleted') || description.includes('removed') || description.includes('deleted')) {
          activityType = 'entry_deleted';
        }
      }
      // Check for contact operations
      else if (title.includes('contact') || description.includes('contact')) {
        if (title.includes('added') || description.includes('added')) {
          activityType = 'contact_added';
        } else if (title.includes('updated') || description.includes('updated')) {
          activityType = 'contact_updated';
        } else if (title.includes('removed') || description.includes('deleted')) {
          activityType = 'contact_deleted';
        }
      }
      // Check for recipient operations
      else if (title.includes('recipient') || description.includes('recipient')) {
        if (title.includes('added') || description.includes('added')) {
          activityType = 'recipient_added';
        } else if (title.includes('removed') || description.includes('removed')) {
          activityType = 'recipient_removed';
        }
      }
      // Check for login/security operations
      else if (title.includes('login') || title.includes('account') || title.includes('accessed') || description.includes('login')) {
        if (title.includes('created') || description.includes('created')) {
          activityType = 'system_event'; // Account creation is a system event
        } else {
          activityType = 'login';
        }
      }
      // Check for security operations
      else if (title.includes('security') || title.includes('check') || description.includes('security')) {
        activityType = 'security_check';
      }
      // Default to system_event only if we can't determine anything else
      else {
        activityType = 'system_event';
        console.log('⚠️ Could not determine activity type, defaulting to system_event');
      }
      
      console.log('🔍 Inferred activity type:', activityType);
    }
    
    // Title priority: Use notification.title as the primary source
    // Only use content.title if it's different and more specific
    let finalTitle = notification.title;
    let finalDescription = content.description || notification.content;
    
    // If we have a parsed content title that's more specific, use it
    if (content.title && content.title !== notification.title && content.title.length > 0) {
      finalTitle = content.title;
      console.log('✅ Using parsed content title:', finalTitle);
    } else {
      console.log('✅ Using notification title:', finalTitle);
    }
    
    // Ensure description is not the same as title
    if (finalDescription === finalTitle) {
      finalDescription = content.description || 'No description available';
      console.log('⚠️ Description same as title, using fallback:', finalDescription);
    }
    
    const finalEvent = {
      id: notification.id,
      type: activityType,
      title: finalTitle,
      description: finalDescription,
      timestamp: timestamp,
      metadata: content.metadata || {}
    };
    
    console.log('🔍 Final timeline event:', finalEvent);
    console.log('🔍 ===== End Processing =====\n');
    
    return finalEvent;
  };

  // Refresh timeline
  const refreshTimeline = async () => {
    setPage(1);
    setHasMore(true);
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
          matchesFilter = ['login', 'logout', 'security_check'].includes(event.type);
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

  // Intelligent icon for event type and metadata
  const getEventIcon = (type: ActivityType, metadata?: Record<string, any>) => {
    if (type === 'file_uploaded' && metadata) {
      const fileType: string = (metadata.fileType || '').toString().toLowerCase();
      const fileName: string = (metadata.fileName || '').toString().toLowerCase();
      const byExt = (exts: string[]) => exts.some(ext => fileName.endsWith(ext));

      if (fileType.includes('image') || byExt(['.png', '.jpg', '.jpeg', '.gif', '.webp'])) return Image;
      if (fileType.includes('video') || byExt(['.mp4', '.mov', '.avi', '.mkv', '.webm'])) return Video;
      if (fileType.includes('audio') || byExt(['.mp3', '.wav', '.aac', '.ogg'])) return FileAudio;
      if (byExt(['.pdf', '.doc', '.docx', '.txt', '.md'])) return FileText;
      return FileGeneric;
    }

    const iconMap: Record<ActivityType, any> = {
      // Vault operations - Security-focused icons
      vault_created: Shield,
      vault_updated: ShieldCheck,
      vault_deleted: Trash2,
      
      // Entry operations - Content-focused icons
      entry_added: FileText,
      entry_deleted: Trash2,
      
      // Contact operations - People-focused icons
      contact_added: UserPlus,
      contact_updated: Users,
      contact_deleted: UserMinus,
      
      // Recipient operations - Access-focused icons
      recipient_added: Lock,
      recipient_removed: Unlock,
      
      // File operations - Storage-focused icons
      file_uploaded: Upload,
      
      // Security operations - Safety-focused icons
      login: LogIn,
      logout: LogIn, // Using LogIn icon for logout as well
      security_check: ShieldCheck,
      
      // System operations - System-focused icons
      system_event: Settings
    };
    
    return iconMap[type] || Bell;
  };

  // Get color for event type
  const getEventColor = (type: ActivityType) => {
    const color = NotificationHelper.getActivityColor(type);
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
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
      logout: 'Security',
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

  // Get time ago format
  const getTimeAgo = (timestamp: Date): string => {
    try {
      const now = new Date();
      
      // Check if timestamp is valid
      if (isNaN(timestamp.getTime())) {
        return 'Invalid date';
      }
      
      const diffInMs = now.getTime() - timestamp.getTime();
      
      // Handle future dates (shouldn't happen but just in case)
      if (diffInMs < 0) {
        return 'Just now';
      }
      
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
      if (diffInMonths < 12) return `${diffInMonths}mo ago`;
      
      return timestamp.toLocaleDateString();
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return 'Unknown time';
    }
  };

  const eventTypes = [
    { id: 'all', name: 'All Events', count: events.length },
    { id: 'security', name: 'Security', count: events.filter(e => ['login', 'logout', 'security_check'].includes(e.type)).length },
    { id: 'vault', name: 'Vaults', count: events.filter(e => ['vault_created', 'vault_updated', 'vault_deleted'].includes(e.type)).length },
    { id: 'entry', name: 'Entries', count: events.filter(e => ['entry_added', 'entry_deleted'].includes(e.type)).length },
    { id: 'contact', name: 'Contacts', count: events.filter(e => ['contact_added', 'contact_updated', 'contact_deleted'].includes(e.type)).length },
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
              onClick={exportTimeline}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Upload className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Summary Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Total Timeline Overview */}
          <Card className="lg:col-span-2 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Timeline Overview</h3>
                <p className="text-slate-300 mb-4">Complete activity history and insights</p>
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-3xl font-bold text-blue-400">{totalEventsCount}</p>
                    <p className="text-sm text-slate-400">Total Events</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-400">
                      {last24HoursCount}
                    </p>
                    <p className="text-sm text-slate-400">Last 24 hours</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-400">
                      {recentEventsCount}
                    </p>
                    <p className="text-sm text-slate-400">Last 30 days</p>
                  </div>
                </div>
              </div>
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-10 h-10 text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Activity Distribution */}
          <Card className="p-6 bg-slate-900/50 border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'Security', count: events.filter(e => ['login', 'logout', 'security_check'].includes(e.type)).length, color: 'bg-green-500' },
                { label: 'Vaults', count: events.filter(e => ['vault_created', 'vault_updated', 'vault_deleted'].includes(e.type)).length, color: 'bg-purple-500' },
                { label: 'Contacts', count: events.filter(e => ['contact_added', 'contact_updated', 'contact_deleted'].includes(e.type)).length, color: 'bg-amber-500' },
                { label: 'Entries', count: events.filter(e => ['entry_added', 'entry_deleted'].includes(e.type)).length, color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-white">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
                const IconComponent = getEventIcon(event.type, event.metadata);
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
                    <div className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses.split(' ')[1]}`} />
                    </div>

                    {/* Event Card */}
                    <Card className="flex-1 p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 group">
                      <div className="flex flex-col space-y-3">
                        {/* Header: Title and Tag */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                              {event.title}
                            </h3>
                          </div>
                          <Badge className={`${colorClasses} border text-xs flex-shrink-0 ml-3`}>
                            {getActivityTypeLabel(event.type)}
                          </Badge>
                        </div>

                        {/* Description */}
                        {event.description && event.description !== event.title && (
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Footer: Time information */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
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
                          <div className="text-xs text-slate-500">
                            {getTimeAgo(event.timestamp)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-8"
              >
                <Button
                  onClick={() => fetchEvents(page + 1)}
                  disabled={loadingMore}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  {loadingMore ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <span>Load More Events</span>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        ) : (
          <Card className="p-6 bg-slate-900/50 border-slate-700/50 text-center">
            <div className="text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Timeline Events</h3>
              <p className="text-slate-400">
                {searchQuery || filterType !== 'all' 
                  ? 'No events match your current filters. Try adjusting your search or filters.'
                  : 'Your timeline is empty. Start using the app to see your activity history here.'
                }
              </p>
            </div>
          </Card>
        )}

        {/* Mobile bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}