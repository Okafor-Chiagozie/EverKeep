import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Settings, 
  MessageSquare,
  Image,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { vaultService } from '@/services/vault';
import { contactService } from '@/services/contact';
import { cloudinaryService } from '@/services/cloudinary';
import { mediaUtils } from '@/utils/mediaUtils';
import { VaultContactsDialog } from '@/components/VaultContactsDialog';
import { DeleteVaultDialog } from '@/components/DeleteVaultDialog';
import { VaultSidebar } from '@/components/VaultSidebar';
import { VaultMessagesTab } from '@/components/VaultMessagesTab';
import { VaultMediaTab } from '@/components/VaultMediaTab';
import { Vault, VaultEntry } from '@/types/vault';
import { Contact } from '@/types/contact';

// TypeScript interfaces for local entries
interface LocalVaultEntry {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  title: string;
  content: string;
  timestamp: Date;
  encrypted: boolean;
  folderName?: string;
  cloudinaryUrl?: string;
}

export function VaultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showContactsDialog, setShowContactsDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [textareaHeight, setTextareaHeight] = useState<number>(40);
  const [activeTab, setActiveTab] = useState<'messages' | 'media'>('messages');
  const [vault, setVault] = useState<Vault | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [recipients, setRecipients] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Function to fetch recipients data
  const fetchRecipients = async () => {
    if (!id) return;
    
    try {
      const recipientsResponse = await vaultService.getVaultRecipients(id);
      
      if (recipientsResponse.isSuccessful) {
        // Handle case where contacts might be null
        const validRecipients = recipientsResponse.data
          .map(r => r.contacts)
          .filter((contact): contact is Contact => contact !== null && contact !== undefined);
        setRecipients(validRecipients);
      }
    } catch (err) {
      console.error('Error fetching recipients:', err);
    }
  };

  useEffect(() => {
    const fetchVaultData = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch vault details, entries, recipients, and contacts
        const [vaultResponse, entriesResponse, recipientsResponse, contactsResponse] = await Promise.all([
          vaultService.getVaultById(id),
          vaultService.getVaultEntries(id),
          vaultService.getVaultRecipients(id),
          contactService.getContacts({
            pageSize: 100,
            pageNumber: 1,
            user_id: user.id
          })
        ]);

        if (vaultResponse.isSuccessful && vaultResponse.data) {
          setVault(vaultResponse.data);
        } else {
          setError('Vault not found');
          return;
        }

        if (entriesResponse.isSuccessful) {
          setVaultEntries(entriesResponse.data);
        }

        if (recipientsResponse.isSuccessful) {
          // Handle case where contacts might be null
          const validRecipients = recipientsResponse.data
            .map(r => r.contacts)
            .filter((contact): contact is Contact => contact !== null && contact !== undefined);
          setRecipients(validRecipients);
        }

        if (contactsResponse.isSuccessful) {
          setContacts(contactsResponse.data);
        }

      } catch (err) {
        console.error('Error fetching vault data:', err);
        setError('Failed to load vault data');
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, [id, user]);

  // Convert vault entries to local format - separate text and media
  const textEntries: LocalVaultEntry[] = vaultEntries
    .filter(entry => entry.type === 'text')
    .map(entry => ({
      id: entry.id,
      type: entry.type as 'text',
      title: entry.content?.substring(0, 50) + (entry.content && entry.content.length > 50 ? '...' : '') || 'Untitled',
      content: entry.content || '',
      timestamp: new Date(entry.timestamp),
      encrypted: true,
      folderName: 'Messages'
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort oldest to newest

  // Convert media entries from vault_entries
  const mediaEntries: LocalVaultEntry[] = vaultEntries
    .filter(entry => entry.type !== 'text')
    .map(entry => {
      let cloudinaryUrl: string | undefined;
      let filename = 'Untitled';
      
      // Try to parse content as JSON to get Cloudinary URL
      try {
        const contentData = JSON.parse(entry.content || '{}');
        cloudinaryUrl = contentData.cloudinaryUrl;
        filename = contentData.filename || filename;
      } catch {
        // If parsing fails, treat content as filename
        filename = entry.content || 'Untitled';
      }

      return {
        id: entry.id,
        type: entry.type as 'image' | 'video' | 'audio' | 'document',
        title: filename,
        content: entry.content || '',
        timestamp: new Date(entry.timestamp),
        encrypted: true,
        folderName: 'Media',
        cloudinaryUrl
      };
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort oldest to newest

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !vault || !user) return;
    
    setSendingMessage(true);
    
    try {
      const response = await vaultService.createVaultEntry({
        vault_id: vault.id,
        type: 'text',
        content: newMessage.trim()
      });

      if (response.isSuccessful && response.data) {
        setVaultEntries(prev => [...prev, response.data]);
        setNewMessage('');
      } else {
        setError(response.errors[0]?.description || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (deletingItems.has(messageId)) return;
    
    setDeletingItems(prev => new Set([...prev, messageId]));
    
    try {
      const response = await vaultService.deleteVaultEntry(messageId);
      
      if (response.isSuccessful) {
        // Remove from local state only after successful deletion
        setVaultEntries(prev => prev.filter(entry => entry.id !== messageId));
      } else {
        setError(response.errors[0]?.description || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (deletingItems.has(mediaId)) return;
    
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this media file? This action cannot be undone.')) {
      return;
    }
    
    setDeletingItems(prev => new Set([...prev, mediaId]));
    
    try {
      // Find the media entry to get Cloudinary public_id for potential cleanup
      const mediaEntry = vaultEntries.find(entry => entry.id === mediaId);
      let publicId: string | null = null;
      
      if (mediaEntry && mediaEntry.content) {
        try {
          const contentData = JSON.parse(mediaEntry.content);
          publicId = contentData.publicId;
        } catch {
          // If parsing fails, continue with deletion anyway
        }
      }
      
      // Delete from database
      const response = await vaultService.deleteVaultEntry(mediaId);
      
      if (response.isSuccessful) {
        // Remove from local state
        setVaultEntries(prev => prev.filter(entry => entry.id !== mediaId));
        
        // Note: Cloudinary deletion requires server-side implementation with API secret
        // For now, we'll just delete from our database
        if (publicId) {
          console.log(`Media deleted from database. Cloudinary file ${publicId} should be cleaned up by a background job.`);
        }
      } else {
        setError(response.errors[0]?.description || 'Failed to delete media');
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      setError('Failed to delete media');
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleDownloadMedia = async (entry: LocalVaultEntry) => {
    try {
      await mediaUtils.downloadMedia({
        id: entry.id,
        title: entry.title,
        cloudinaryUrl: entry.cloudinaryUrl,
        type: entry.type as 'image' | 'video' | 'audio' | 'document'
      });
    } catch (err) {
      console.error('Error downloading media:', err);
      setError('Failed to download file');
    }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !vault) return;

    setUploadingFiles(true);
    
    try {
      for (const file of Array.from(files)) {
        // Upload to Cloudinary
        const cloudinaryResponse = await cloudinaryService.uploadFile(file);
        
        const fileType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'document';

        // Save to database as vault entry with Cloudinary URL
        const response = await vaultService.createVaultEntry({
          vault_id: vault.id,
          type: fileType,
          content: JSON.stringify({
            filename: file.name,
            cloudinaryUrl: cloudinaryResponse.secure_url,
            publicId: cloudinaryResponse.public_id,
            size: cloudinaryResponse.bytes,
            format: cloudinaryResponse.format
          })
        });

        if (response.isSuccessful && response.data) {
          setVaultEntries(prev => [...prev, response.data]);
        }
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVaultDeleted = () => {
    navigate('/vaults');
  };

  const handleVaultUpdated = (updatedVault: Vault) => {
    setVault(updatedVault);
  };

  // New callback function to handle recipient changes
  const handleRecipientsChanged = () => {
    // Refresh recipients data when contacts are added/removed
    fetchRecipients();
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen max-lg:h-[calc(100dvh-4rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center max-lg:mt-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading vault...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !vault) {
    return (
      <div className="h-screen max-lg:h-[calc(100dvh-4rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center max-lg:mt-16">
        <Card className="p-6 bg-red-900/20 border-red-500/30 max-w-md">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error Loading Vault</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/vaults')} 
            className="w-full mt-4"
            variant="outline"
          >
            Back to Vaults
          </Button>
        </Card>
      </div>
    );
  }

  // Vault not found
  if (!vault) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Vault Not Found</h2>
          <p className="text-slate-400">The vault you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate('/vaults')} 
            className="mt-4"
            variant="outline"
          >
            Back to Vaults
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-lg:h-[calc(100dvh-4rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden max-lg:mt-16">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Vault Info Sidebar */}
      <AnimatePresence>
        <VaultSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          vault={vault}
          recipients={recipients}
          onManageContacts={() => setShowContactsDialog(true)}
          onDeleteVault={() => setShowDeleteDialog(true)}
        />
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/vaults')}
                className="text-slate-400 hover:text-white mr-2 max-sm:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-white truncate">{vault.name}</h2>
                <p className="text-sm text-slate-400">
                  {textEntries.length + mediaEntries.length} total entries • {recipients.length} recipients
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

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4">
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
          </div>
        )}

        {/* Tabs Container */}
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

          {/* Tab Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === 'messages' ? (
              <VaultMessagesTab
                textEntries={textEntries}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                textareaHeight={textareaHeight}
                setTextareaHeight={setTextareaHeight}
                sendingMessage={sendingMessage}
                onSendMessage={handleSendMessage}
                onDeleteMessage={handleDeleteMessage}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <VaultMediaTab
                mediaEntries={mediaEntries}
                onDeleteMedia={handleDeleteMedia}
                onDownloadMedia={handleDownloadMedia}
                onFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
                uploadingFiles={uploadingFiles}
                deletingItems={deletingItems}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <VaultContactsDialog
        open={showContactsDialog}
        onOpenChange={setShowContactsDialog}
        vaultId={vault.id}
        vaultName={vault.name}
        vault={vault}
        contacts={contacts}
        onVaultUpdated={handleVaultUpdated}
        onRecipientsChanged={handleRecipientsChanged}
      />

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