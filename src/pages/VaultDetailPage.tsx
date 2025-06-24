import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Settings, 
  Users,
  FileText,
  Image,
  Video,
  Mic,
  Send,
  Paperclip,
  X,
  MessageSquare,
  Play,
  Download,
  Lock,
  Trash2,
  UserPlus,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useVaults } from '@/contexts/VaultContext';
import { VaultContactsDialog } from '@/components/VaultContactsDialog';
import { DeleteVaultDialog } from '@/components/DeleteVaultDialog';

// TypeScript interfaces
interface VaultEntry {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  title: string;
  content: string;
  timestamp: Date;
  encrypted: boolean;
  folderName?: string;
}

export function VaultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showContactsDialog, setShowContactsDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [textareaHeight, setTextareaHeight] = useState<number>(40);
  const [entries, setEntries] = useState<(VaultEntry & { folderName: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'media'>('messages');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { vaults, contacts, addVaultEntry } = useVaults();
  
  const vault = vaults.find(v => v.id === id);
  
  if (!vault) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Vault Not Found</h2>
          <p className="text-slate-400">The vault you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Auto-resize textarea
  useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
         const minHeight = 40;
         const maxHeight = 120;
         
         // Reset height to get accurate scrollHeight
         textarea.style.height = 'auto';
         
         // Calculate new height based on content
         const scrollHeight = textarea.scrollHeight;
         const newHeight = Math.min(Math.max(scrollHeight + 4, minHeight), maxHeight);
         // Add extra padding when scrollbar is present
         const finalHeight = scrollHeight > maxHeight - 4 ? maxHeight : newHeight;
         
         // Set the calculated height
         textarea.style.height = `${finalHeight}px`;
         setTextareaHeight(finalHeight);
      }
  }, [newMessage]);

  const textEntries = entries.filter(entry => entry.type === 'text');
  const mediaEntries = entries.filter(entry => entry.type !== 'text');

  const recipients = vault.recipients
    .map(recipientId => contacts.find(c => c.id === recipientId))
    .filter((contact): contact is NonNullable<typeof contact> => contact !== undefined);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !vault) return;
    
    const newEntry: VaultEntry & { folderName: string } = {
      id: Date.now().toString(),
      type: 'text',
      title: newMessage.split('\n')[0].substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
      content: newMessage,
      timestamp: new Date(),
      encrypted: true,
      folderName: 'Messages'
    };

    setEntries(prev => [...prev, newEntry]);
    
    // Add to vault context
    addVaultEntry(vault.id, 'messages', {
      type: 'text',
      title: newEntry.title,
      content: newMessage,
      encrypted: true
    });
    
    setNewMessage('');
  };

  const handleDeleteMessage = (messageId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== messageId));
  };

  const handleDeleteMedia = (mediaId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== mediaId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile = 'ontouchstart' in window;
    
    if (e.key === 'Enter') {
      if (isMobile) {
        if (!e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      } else {
        if (!e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !vault) return;

    Array.from(files).forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' :
                      file.type.startsWith('video/') ? 'video' :
                      file.type.startsWith('audio/') ? 'audio' : 'text';

      const newEntry: VaultEntry & { folderName: string } = {
        id: Date.now().toString() + Math.random(),
        type: fileType as 'text' | 'image' | 'video' | 'audio',
        title: file.name,
        content: file.name,
        timestamp: new Date(),
        encrypted: true,
        folderName: 'Media'
      };

      setEntries(prev => [...prev, newEntry]);
      
      // Add to vault context
      addVaultEntry(vault.id, 'media', {
        type: fileType as 'text' | 'image' | 'video' | 'audio',
        title: file.name,
        content: file.name,
        encrypted: true
      });
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (timestamp: Date): string => {
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

  const getContactColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-amber-500 to-amber-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  const handleVaultDeleted = () => {
    navigate('/vaults');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Vault Info Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-[50] shadow-2xl flex flex-col"
          >
            {/* Vault Header */}
            <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Vault Details</h2>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Vault
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-white truncate">{vault.name}</h1>
                  <p className="text-sm text-slate-400 line-clamp-2">{vault.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Encrypted
                </Badge>
                <Badge className="border-slate-600 text-slate-300 text-xs border">
                  <Users className="w-3 h-3 mr-1" />
                  {recipients.length} recipients
                </Badge>
              </div>

              <div className="text-xs text-slate-400">
                Last modified: {new Date(vault.lastModified).toLocaleDateString()}
              </div>
            </div>

            {/* Recipients */}
            <div className="flex-1 p-6 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-700/50 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-300">Recipients</h3>
                <Button
                  onClick={() => setShowContactsDialog(true)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {recipients.length > 0 ? (
                  recipients.map((recipient, index) => (
                    <div key={recipient.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30">
                      <Avatar className={`w-8 h-8 bg-gradient-to-r ${getContactColor(index)} flex-shrink-0`}>
                        <AvatarFallback className="text-white font-semibold text-xs">
                          {recipient.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{recipient.name}</p>
                        <p className="text-xs text-slate-400 truncate">{recipient.email}</p>
                      </div>
                      {recipient.verified && (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 mb-3">No recipients assigned</p>
                    <Button
                      onClick={() => setShowContactsDialog(true)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Recipients
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Vault Settings */}
            <div className="p-6 border-t border-slate-700/50 flex-shrink-0">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 mb-3"
                onClick={() => setShowContactsDialog(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Recipients
              </Button>
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                Vault Settings
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/vaults')}
                className="text-slate-400 hover:text-white mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-white truncate">{vault.name}</h2>
                <p className="text-sm text-slate-400">
                  {entries.length} total entries • {recipients.length} recipients
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs Container - Full height with proper spacing */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab Navigation */}
          <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-800/20 flex-shrink-0">
            <div className="grid w-full grid-cols-2 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-3 text-sm rounded-md transition-all flex items-center justify-center ${
                  activeTab === 'messages' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
                <span className="ml-1">({textEntries.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`py-3 text-sm rounded-md transition-all flex items-center justify-center ${
                  activeTab === 'media' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Image className="w-4 h-4 mr-2" />
                Media
                <span className="ml-1">({mediaEntries.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Content - This is the key fix */}
          <div className="flex-1 flex flex-col min-h-0 ">
            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <>
                {/* Messages Area - Scrollable middle content */}
                <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-700/50 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400">
                  {textEntries.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
                        <p className="text-base text-slate-400 px-4">Start preserving your thoughts and memories</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {textEntries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          transition={{ delay: index * 0.1 }}
                          className="flex justify-end group"
                        >
                          <div className="max-w-[80%] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rounded-tr-md p-4">
                            <div className="text-white">
                              <p className="text-base whitespace-pre-wrap leading-relaxed [word-break:break-all]">{entry.content}</p>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                              <span className="text-xs text-blue-100">{formatTime(entry.timestamp)}</span>
                              <button
                                onClick={() => handleDeleteMessage(entry.id)}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 p-1 bg-transparent hover:bg-white/10 rounded"
                                title="Delete message"
                              >
                                <Trash2 className="w-3 h-3 text-blue-100 hover:text-red-300" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input - Fixed at bottom */}
                <div className="p-4 bg-slate-800/20 flex-shrink-0">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        ref={textareaRef}
                        placeholder="Write a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-700/50 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400"
                        style={{
                          height: `${textareaHeight}px`,
                           minHeight: '40px',
                           maxHeight: '120px',
                           overflowY: textareaHeight >= 120 ? 'auto' : 'hidden'
                        }}
                        rows={1}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-[40px] py-6 mb-[0.3rem]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-700/50 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400">
                  {mediaEntries.length === 0 ? (
                    <div className="flex items-center justify-center h-full ">
                      <div className="text-center">
                        <Image className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No media files yet</h3>
                        <p className="text-base text-slate-400 mb-6 px-4">Upload photos, videos, and audio recordings</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ">
                      {mediaEntries.map((entry, index) => {
                        const IconComponent = getMediaIcon(entry.type);
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                          >
                            <Card className="p-4 bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer relative">
                              {/* Delete button for media */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMedia(entry.id);
                                }}
                                className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 p-1 bg-red-500/80 hover:bg-red-500 rounded-full z-10"
                                title="Delete media"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                              </button>
                              
                              <div className="aspect-square bg-slate-700/50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-600/50 transition-colors">
                                <IconComponent className="w-8 h-8 text-slate-400" />
                              </div>
                              <h4 className="font-medium text-white text-sm truncate mb-1">{entry.title}</h4>
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

                {/* Media Upload Area - Fixed at bottom */}
                <div className="p-4 bg-slate-800/20 flex-shrink-0">
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vault Contacts Dialog */}
      <VaultContactsDialog
        open={showContactsDialog}
        onOpenChange={setShowContactsDialog}
        vaultId={vault.id}
        vaultName={vault.name}
      />

      {/* Delete Vault Dialog */}
      <DeleteVaultDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        vaultId={vault.id}
        vaultName={vault.name}
        onDeleted={handleVaultDeleted}
      />
    </div>
  );
}