import { motion } from 'framer-motion';
import { 
  Clock, 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Key,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export function TimelinePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const timelineEvents = [
    {
      id: '1',
      type: 'vault',
      action: 'Created vault "Family Memories"',
      description: 'New vault created with 3 folders and 2 recipients',
      timestamp: new Date('2024-01-15T10:30:00'),
      icon: Shield,
      color: 'blue'
    },
    {
      id: '2',
      type: 'entry',
      action: 'Added message to "Letters for Sarah"',
      description: 'New encrypted text entry added to vault',
      timestamp: new Date('2024-01-14T15:45:00'),
      icon: FileText,
      color: 'green'
    },
    {
      id: '3',
      type: 'contact',
      action: 'Added John Smith as executor',
      description: 'New trusted contact added with executor role',
      timestamp: new Date('2024-01-12T09:15:00'),
      icon: Users,
      color: 'purple'
    },
    {
      id: '4',
      type: 'security',
      action: 'Encryption keys regenerated',
      description: 'RSA key pair updated for enhanced security',
      timestamp: new Date('2024-01-10T14:20:00'),
      icon: Key,
      color: 'amber'
    },
    {
      id: '5',
      type: 'checkin',
      action: 'Deadman switch check-in completed',
      description: 'Regular check-in performed, timer reset',
      timestamp: new Date('2024-01-08T11:00:00'),
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: '6',
      type: 'delivery',
      action: 'Vault delivery scheduled',
      description: 'Automatic delivery scheduled for "Legacy Documents"',
      timestamp: new Date('2024-01-05T16:30:00'),
      icon: Mail,
      color: 'orange'
    },
    {
      id: '7',
      type: 'system',
      action: 'Account security review',
      description: 'Automated security audit completed successfully',
      timestamp: new Date('2024-01-03T08:45:00'),
      icon: AlertCircle,
      color: 'red'
    }
  ];

  const filteredEvents = timelineEvents.filter(event => {
    const matchesSearch = event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getEventColor = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[color] || colors.blue;
  };

  const eventTypes = [
    { id: 'all', name: 'All Events' },
    { id: 'vault', name: 'Vaults' },
    { id: 'entry', name: 'Entries' },
    { id: 'contact', name: 'Contacts' },
    { id: 'security', name: 'Security' },
    { id: 'checkin', name: 'Check-ins' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'system', name: 'System' }
  ];

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
            <Clock className="w-8 h-8 text-blue-400" />
            <span>Activity Timeline</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Track all activities and changes in your digital vault
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <Calendar className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
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
              {type.name}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent"></div>

        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start space-x-6"
            >
              {/* Timeline Dot */}
              <div className={`relative z-10 w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center ${getEventColor(event.color).split(' ')[0]}`}>
                <event.icon className={`w-6 h-6 ${getEventColor(event.color).split(' ')[1]}`} />
              </div>

              {/* Event Card */}
              <Card className="flex-1 p-6 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {event.action}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {event.description}
                    </p>
                  </div>
                  
                  <Badge className={`${getEventColor(event.color)} border ml-4`}>
                    {event.type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{event.timestamp.toLocaleDateString()}</span>
                    <span>at</span>
                    <span>{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Load More Events
          </Button>
        </motion.div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
            <Clock className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery 
              ? `No events match "${searchQuery}"`
              : 'No events found for the selected filter'
            }
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}