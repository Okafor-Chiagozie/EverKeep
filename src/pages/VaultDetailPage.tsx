import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Plus, 
  Settings, 
  Users,
  Lock,
  FileText,
  Image,
  Video,
  Mic,
  Calendar,
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Menu,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVaults } from '@/contexts/VaultContext';

export function VaultDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vaults, contacts, addVaultEntry } = useVaults();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const vault = vaults.find(v => v.id === id);
  const currentFolder = selectedFolder ? vault?.folders.find(f => f.id === selectedFolder) : null;

  if (!vault) {
    return (
      <div className="p-4 sm:p-8 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Vault Not Found</h1>
        <Button onClick={() => navigate('/vaults')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vaults
        </Button>
      </div>
    );
  }

  const handleAddEntry = () => {
    if (!selectedFolder || !newEntryText.trim() || !newEntryTitle.trim()) return;

    addVaultEntry(vault.id, selectedFolder, {
      type: 'text',
      title: newEntryTitle,
      content: newEntryText,
      encrypted: true
    });

    setNewEntryText('');
    setNewEntryTitle('');
    setIsComposing(false);
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Mail: MessageSquare,
      Image: Image,
      Video: Video,
      Mic: Mic,
      FileText: FileText,
      Key: Lock
    };
    return icons[iconName] || FileText;
  };

  const recipients = vault.recipients
    .map(recipientId => contacts.find(c => c.id === recipientId))
    .filter(Boolean);

  return (
    <div className="flex h-screen w-full">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-slate-900/90 backdrop-blur-xl border-slate-700/50"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Folders */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ 
          x: isSidebarOpen ? 0 : -300 
        }}
        className={`
          fixed left-0 top-0 h-screen w-80 sm:w-96 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 z-50
          lg:translate-x-0 lg:static lg:z-auto lg:w-80 xl:w-96
          transition-transform duration-300 ease-in-out flex flex-col
        `}
      >
        {/* Vault Header */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-700/50">
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">{vault.name}</h1>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">{vault.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              <Lock className="w-3 h-3 mr-1" />
              {vault.status}
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

        {/* Folders List */}
        <div className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-300">Folders</h3>
            <Button size="sm" variant="ghost" className="p-1">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {vault.folders.map((folder) => {
            const IconComponent = getIcon(folder.icon);
            const isSelected = selectedFolder === folder.id;
            
            return (
              <motion.button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setIsSidebarOpen(false);
                }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  isSelected 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">{folder.name}</div>
                  <div className="text-xs opacity-70">
                    {folder.entries.length} entries
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Recipients */}
        <div className="p-3 sm:p-4 border-t border-slate-700/50">
          <h3 className="font-medium text-slate-300 mb-3">Recipients</h3>
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white">
                    {recipient?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-300 truncate">{recipient?.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedFolder ? (
          /* Welcome State */
          <div className="flex-1 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Welcome to {vault.name}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mb-8">
                Select a folder from the sidebar to view or add entries to your vault.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => {
                    setSelectedFolder(vault.folders[0]?.id);
                    setIsSidebarOpen(false);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Adding Memories
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Vault Settings
                </Button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Folder Content */
          <>
            {/* Folder Header */}
            <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-700/50 bg-slate-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {(() => {
                    const IconComponent = getIcon(currentFolder?.icon || '');
                    return <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />;
                  })()}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">{currentFolder?.name}</h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {currentFolder?.entries.length || 0} entries in this folder
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => setIsComposing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Entry</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              <AnimatePresence>
                {/* Compose New Entry */}
                {isComposing && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="p-4 sm:p-6 bg-slate-800/30 border-slate-700/50">
                      <div className="space-y-4">
                        <Input
                          placeholder="Entry title..."
                          value={newEntryTitle}
                          onChange={(e) => setNewEntryTitle(e.target.value)}
                          className="bg-slate-900/50 border-slate-600 text-white"
                        />
                        <Textarea
                          placeholder="Write your message, memory, or note here..."
                          value={newEntryText}
                          onChange={(e) => setNewEntryText(e.target.value)}
                          className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                        />
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Paperclip className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Smile className="w-4 h-4" />
                            </Button>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Encrypted
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              onClick={() => setIsComposing(false)}
                              className="text-slate-400 hover:text-white"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddEntry}
                              disabled={!newEntryText.trim() || !newEntryTitle.trim()}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Add Entry
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Existing Entries */}
                {currentFolder?.entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 sm:p-6 bg-slate-900/30 border-slate-700/50 hover:border-slate-600/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white truncate text-sm sm:text-base">{entry.title}</h3>
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400 flex-wrap">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                              {entry.encrypted && (
                                <>
                                  <Separator orientation="vertical" className="h-3" />
                                  <Lock className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">Encrypted</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white flex-shrink-0">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        {entry.content}
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {/* Empty State */}
                {(!currentFolder?.entries || currentFolder.entries.length === 0) && !isComposing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 sm:py-16"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                      {(() => {
                        const IconComponent = getIcon(currentFolder?.icon || '');
                        return <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />;
                      })()}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                      No entries in {currentFolder?.name} yet
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400 mb-6 px-4">
                      Start preserving your memories by adding your first entry.
                    </p>
                    <Button
                      onClick={() => setIsComposing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Entry
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}