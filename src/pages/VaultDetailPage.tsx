import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Plus, 
  Settings, 
  Users,
  FileText,
  Image,
  Video,
  Mic,
  Send,
  Paperclip,
  Calendar,
  Menu,
  X,
  MessageSquare,
  Play,
  Download,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useVaults } from '@/contexts/VaultContext';

export function VaultDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vaults, contacts, addVaultEntry } = useVaults();
  const [newMessage, setNewMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const vault = vaults.find(v => v.id === id);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height with min/max constraints
      const minHeight = 44; // Minimum height (roughly 1 line)
      const maxHeight = 200; // Maximum height before scrolling
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [newMessage]);

  if (!vault) {
    return (
      <div className="w-full min-h-[100dvh] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Vault Not Found</h1>
          <Button onClick={() => navigate('/vaults')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vaults
          </Button>
        </div>
      </div>
    );
  }

  // Get all entries from all folders
  const allEntries = vault.folders.flatMap(folder => 
    folder.entries.map(entry => ({ ...entry, folderName: folder.name }))
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const textEntries = allEntries.filter(entry => entry.type === 'text');
  const mediaEntries = allEntries.filter(entry => entry.type !== 'text');

  const recipients = vault.recipients
    .map(recipientId => contacts.find(c => c.id === recipientId))
    .filter(Boolean);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Find or create a "Messages" folder
    let messagesFolder = vault.folders.find(f => f.name === 'Messages' || f.name === 'Letters');
    if (!messagesFolder) {
      messagesFolder = vault.folders[0]; // Use first folder as fallback
    }

    addVaultEntry(vault.id, messagesFolder.id, {
      type: 'text',
      title: `Message ${new Date().toLocaleDateString()}`,
      content: newMessage,
      encrypted: true
    });

    setNewMessage('');
    setIsComposing(false);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Mic;
      default: return FileText;
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Menu Button - Fixed positioning */}
      <div className="lg:hidden fixed top-4 right-4 z-[60]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/95 text-slate-300 hover:text-white shadow-lg"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex h-[100dvh] w-full overflow-hidden">
        {/* Vault Info Sidebar */}
        <motion.div
          initial={false}
          animate={{ 
            x: isSidebarOpen ? 0 : -320 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            fixed left-0 top-0 h-[100dvh] w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-[50] shadow-2xl
            lg:translate-x-0 lg:static lg:z-auto lg:w-80 xl:w-96
            flex flex-col
          `}
        >
          {/* Vault Header */}
          <div className="p-4 lg:p-6 border-b border-slate-700/50 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/vaults')}
              className="mb-4 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vaults
            </Button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg lg:text-xl font-bold text-white truncate">{vault.name}</h1>
                <p className="text-sm text-slate-400 line-clamp-2">{vault.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Encrypted
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                <Users className="w-3 h-3 mr-1" />
                {recipients.length} recipients
              </Badge>
            </div>

            <div className="text-xs text-slate-400">
              Last modified: {new Date(vault.lastModified).toLocaleDateString()}
            </div>
          </div>

          {/* Recipients */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar">
            <h3 className="font-medium text-slate-300 mb-4">Recipients</h3>
            <div className="space-y-3">
              {recipients.length > 0 ? (
                recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30">
                    <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
                      <AvatarFallback className="text-white font-semibold text-xs">
                        {recipient?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{recipient?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{recipient?.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No recipients assigned</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Add Recipients
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Vault Settings */}
          <div className="p-4 lg:p-6 border-t border-slate-700/50 flex-shrink-0">
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Vault Settings
            </Button>
          </div>
        </motion.div>

        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b border-slate-700/50 bg-slate-800/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-white truncate">{vault.name}</h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {allEntries.length} total entries • {recipients.length} recipients
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Container - Properly positioned */}
          <Tabs defaultValue="messages" className="flex-1 flex flex-col min-h-0">
            <div className="px-3 sm:px-4 py-2 border-b border-slate-700/50 bg-slate-800/20 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 h-auto">
                <TabsTrigger value="messages" className="data-[state=active]:bg-blue-600 py-2 sm:py-3 text-xs sm:text-sm">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Messages</span>
                  <span className="sm:hidden">Msgs</span>
                  <span className="ml-1">({textEntries.length})</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-blue-600 py-2 sm:py-3 text-xs sm:text-sm">
                  <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Media</span>
                  <span className="sm:hidden">Media</span>
                  <span className="ml-1">({mediaEntries.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Messages Tab */}
            <TabsContent value="messages" className="flex-1 flex flex-col m-0 min-h-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar">
                {textEntries.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No messages yet</h3>
                    <p className="text-sm sm:text-base text-slate-400 mb-6 px-4">Start preserving your thoughts and memories</p>
                    <Button
                      onClick={() => setIsComposing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write First Message
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {textEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-end"
                      >
                        <div className="max-w-[85%] sm:max-w-[80%] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rounded-tr-md p-3 sm:p-4">
                          <div className="text-white">
                            <p className="text-sm font-medium mb-1">{entry.title}</p>
                            <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                            <span className="text-xs text-blue-100">{entry.folderName}</span>
                            <span className="text-xs text-blue-100">{formatTime(entry.timestamp)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 border-t border-slate-700/50 bg-slate-800/20 flex-shrink-0">
                {isComposing ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        placeholder="Write your message, memory, or note here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 custom-scrollbar auto-expand"
                        style={{
                          minHeight: '44px',
                          maxHeight: '200px',
                          height: '44px'
                        }}
                      />
                    </div>
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Encrypted
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsComposing(false);
                            setNewMessage('');
                          }}
                          className="text-slate-400 hover:text-white"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => setIsComposing(true)}
                      className="flex-1 justify-start bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-600 h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write a message...
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 h-11 w-11 p-0"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="flex-1 flex flex-col m-0 min-h-0">
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                {mediaEntries.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Image className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No media files yet</h3>
                    <p className="text-sm sm:text-base text-slate-400 mb-6 px-4">Upload photos, videos, and audio recordings</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Record Audio
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {mediaEntries.map((entry, index) => {
                      const IconComponent = getMediaIcon(entry.type);
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="group"
                        >
                          <Card className="p-3 sm:p-4 bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer">
                            <div className="aspect-square bg-slate-700/50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-600/50 transition-colors">
                              <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                            </div>
                            <h4 className="font-medium text-white text-xs sm:text-sm truncate mb-1">{entry.title}</h4>
                            <p className="text-xs text-slate-400">{formatTime(entry.timestamp)}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                {entry.type}
                              </Badge>
                              <div className="flex space-x-1">
                                {entry.type === 'video' && (
                                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                                    <Play className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="p-1 h-auto">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Media Upload Area */}
              <div className="p-3 sm:p-4 border-t border-slate-700/50 bg-slate-800/20 flex-shrink-0">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                  <div className="flex space-x-2 sm:space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Mic className="w-4 h-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Audio</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Video className="w-4 h-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Video</span>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}