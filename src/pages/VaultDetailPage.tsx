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
  Smile
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

  const vault = vaults.find(v => v.id === id);
  const currentFolder = selectedFolder ? vault?.folders.find(f => f.id === selectedFolder) : null;

  if (!vault) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Vault Not Found</h1>
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
    <div className="flex h-screen">
      {/* Sidebar - Folders */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col"
      >
        {/* Vault Header */}
        <div className="p-6 border-b border-slate-700/50">
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{vault.name}</h1>
              <p className="text-sm text-slate-400">{vault.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Lock className="w-3 h-3 mr-1" />
              {vault.status}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              <Users className="w-3 h-3 mr-1" />
              {recipients.length} recipients
            </Badge>
          </div>

          <div className="text-xs text-slate-400">
            Last modified: {new Date(vault.lastModified).toLocaleDateString()}
          </div>
        </div>

        {/* Folders List */}
        <div className="flex-1 p-4 space-y-2">
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
                onClick={() => setSelectedFolder(folder.id)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  isSelected 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{folder.name}</div>
                  <div className="text-xs opacity-70">
                    {folder.entries.length} entries
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Recipients */}
        <div className="p-4 border-t border-slate-700/50">
          <h3 className="font-medium text-slate-300 mb-3">Recipients</h3>
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-xs text-white">
                    {recipient?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-300">{recipient?.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!selectedFolder ? (
          /* Welcome State */
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                <Shield className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to {vault.name}
              </h2>
              <p className="text-slate-400 mb-8">
                Select a folder from the sidebar to view or add entries to your vault.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setSelectedFolder(vault.folders[0]?.id)}
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
            <div className="p-6 border-b border-slate-700/50 bg-slate-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const IconComponent = getIcon(currentFolder?.icon || '');
                    return <IconComponent className="w-6 h-6 text-blue-400" />;
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentFolder?.name}</h2>
                    <p className="text-sm text-slate-400">
                      {currentFolder?.entries.length || 0} entries in this folder
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => setIsComposing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {/* Compose New Entry */}
                {isComposing && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Paperclip className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Smile className="w-4 h-4" />
                            </Button>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
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
                    <Card className="p-6 bg-slate-900/30 border-slate-700/50 hover:border-slate-600/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{entry.title}</h3>
                            <div className="flex items-center space-x-2 text-sm text-slate-400">
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
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="text-slate-300 leading-relaxed">
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
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                      {(() => {
                        const IconComponent = getIcon(currentFolder?.icon || '');
                        return <IconComponent className="w-8 h-8 text-slate-400" />;
                      })()}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No entries in {currentFolder?.name} yet
                    </h3>
                    <p className="text-slate-400 mb-6">
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