// VaultDetailPage.tsx - Fixed version

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Settings, 
  MessageSquare,
  AlertCircle,
  Loader2,
  X,
  Send,
  Trash2,
  Download,
  ChevronDown,
  MoreVertical,
  Paperclip,
  Edit
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { vaultService } from '@/services/vault';
import { contactService } from '@/services/contact';
import { cloudinaryService } from '@/services/cloudinary';
import { mediaUtils } from '@/utils/mediaUtils';
import EncryptionUtils from '@/utils/encryptionUtils'; // 🔥 IMPORTANT: Import encryption utils
import { VaultContactsDialog } from '@/components/VaultContactsDialog';
import { DeleteVaultDialog } from '@/components/DeleteVaultDialog';
import { VaultSidebar } from '@/components/VaultSidebar';
import { Vault, VaultEntry } from '@/types/vault';
import { Contact } from '@/types/contact';
import { EditableMessage } from '@/components/EditableMessage';
import { AttachmentPicker } from '@/components/AttachmentPicker';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

// Interface for recipient contacts (subset of Contact)
interface RecipientContact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  relationship?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// helper to open native picker for mobile attach from menu
const openFilePickerForMessage = (onFiles: (files: File[]) => Promise<void> | void) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'image/*,video/*,audio/*,application/pdf';
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      await onFiles(Array.from(target.files));
    }
  };
  input.click();
};

export function VaultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showContactsDialog, setShowContactsDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [textareaHeight, setTextareaHeight] = useState<number>(28);
  const [textareaAtMax, setTextareaAtMax] = useState<boolean>(false);
  const [scrollOnNext, setScrollOnNext] = useState<boolean>(false);
  const [hasInitialScrolled, setHasInitialScrolled] = useState<boolean>(false);
  // Single unified feed (no tabs)
  const [vault, setVault] = useState<Vault | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [recipients, setRecipients] = useState<RecipientContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Auto-resize composer textarea up to 8 lines
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    
    // Get computed styles for accurate measurements
    const styles = window.getComputedStyle(ta);
    const lineHeight = parseFloat(styles.lineHeight || '20');
    const paddingTop = parseFloat(styles.paddingTop || '4'); // py-1 = 4px
    const paddingBottom = parseFloat(styles.paddingBottom || '4'); // py-1 = 4px
    
    // Set consistent base height with proper padding
    const baseHeight = paddingTop + lineHeight + paddingBottom; // 4 + 20 + 4 = 28px
    ta.style.height = `${baseHeight}px`;
    
    // Only resize if content exceeds base height
    if (ta.scrollHeight > baseHeight) {
      const max = lineHeight * 8 + paddingTop + paddingBottom; // 8 lines max
    const next = Math.min(ta.scrollHeight, max);
    ta.style.height = `${next}px`;
    setTextareaHeight(next);
    setTextareaAtMax(next >= max - 1);
    } else {
      setTextareaHeight(baseHeight);
      setTextareaAtMax(false);
    }
  }, [newMessage]);

  // Function to fetch recipients data
  const fetchRecipients = async () => {
    if (!id) return;
    
    try {
      const recipientsResponse = await vaultService.getVaultRecipients(id);
      
      if (recipientsResponse.isSuccessful && recipientsResponse.data) {
        // Extract contact data from recipients
        const recipientContacts: RecipientContact[] = recipientsResponse.data
          .filter(recipient => recipient.contact) // Only include recipients with contact data
          .map(recipient => ({
            id: recipient.contact!.id,
            fullName: recipient.contact!.fullName,
            email: recipient.contact!.email,
            phone: recipient.contact!.phone,
            relationship: recipient.contact!.relationship,
            isVerified: recipient.contact!.isVerified,
            createdAt: recipient.contact!.created_at,
            updatedAt: recipient.contact!.updated_at,
          }));
        
        setRecipients(recipientContacts);
        console.log('✅ Recipients updated:', recipientContacts.length, 'contacts');
      } else {
        setRecipients([]);
        console.log('❌ Failed to fetch recipients:', recipientsResponse.errors);
      }
    } catch (err) {
      console.error('Error fetching recipients:', err);
      setRecipients([]);
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

        if (entriesResponse.isSuccessful && entriesResponse.data) {
          setVaultEntries(entriesResponse.data);
        }

        if (recipientsResponse.isSuccessful && recipientsResponse.data) {
          // Extract contact data from recipients
          const recipientContacts: RecipientContact[] = recipientsResponse.data
            .filter(recipient => recipient.contact) // Only include recipients with contact data
            .map(recipient => ({
              id: recipient.contact!.id,
              fullName: recipient.contact!.fullName,
              email: recipient.contact!.email,
              phone: recipient.contact!.phone,
              relationship: recipient.contact!.relationship,
              isVerified: recipient.contact!.isVerified,
              createdAt: recipient.contact!.created_at,
              updatedAt: recipient.contact!.updated_at,
            }));
          
          setRecipients(recipientContacts);
          console.log('✅ Initial recipients loaded:', recipientContacts.length, 'contacts');
        } else {
          setRecipients([]);
        }

        if (contactsResponse.isSuccessful && contactsResponse.data) {
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

  // 🔥 FIXED: Convert vault entries to local format with proper decryption
  const textEntries: LocalVaultEntry[] = vaultEntries
    .filter(entry => entry.type === 'text')
    .map(entry => {
      let decryptedContent = entry.content || '';
      
      // 🔥 DECRYPT the content before displaying
      if (entry.content && user && vault) {
        try {
          decryptedContent = EncryptionUtils.safeDecrypt(entry.content, user.id, vault.id);
          console.log('🔓 Decrypted text entry:', {
            entryId: entry.id,
            originalLength: entry.content.length,
            decryptedLength: decryptedContent.length,
            preview: decryptedContent.substring(0, 50)
          });
        } catch (error) {
          console.error('❌ Failed to decrypt text entry:', error);
          // Fallback to original content if decryption fails
          decryptedContent = entry.content;
        }
      }
      
      return {
        id: entry.id,
        type: entry.type as 'text',
        title: decryptedContent.substring(0, 50) + (decryptedContent.length > 50 ? '...' : '') || 'Untitled',
        content: decryptedContent, // 🔥 Use decrypted content here
        timestamp: new Date(entry.timestamp),
        encrypted: true,
        folderName: 'Messages'
      };
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // 🔥 FIXED: Convert media entries with proper decryption
  const mediaEntries: LocalVaultEntry[] = vaultEntries
    .filter(entry => entry.type !== 'text')
    .map(entry => {
      let cloudinaryUrl: string | undefined;
      let filename = 'Untitled';
      let publicId: string | undefined;
      
      // 🔥 DECRYPT the content before parsing
      let decryptedContent = entry.content || '{}';
      if (entry.content && user && vault) {
        try {
          decryptedContent = EncryptionUtils.safeDecrypt(entry.content, user.id, vault.id);
          console.log('🔓 Decrypted media entry:', {
            entryId: entry.id,
            originalLength: entry.content.length,
            decryptedLength: decryptedContent.length
          });
        } catch (error) {
          console.error('❌ Failed to decrypt media entry:', error);
          decryptedContent = entry.content;
        }
      }
      
      // Try to parse decrypted content as JSON to get Cloudinary URL
      try {
        const contentData = JSON.parse(decryptedContent);
        cloudinaryUrl = contentData.cloudinaryUrl;
        filename = contentData.filename || filename;
        publicId = contentData.publicId;
      } catch {
        // If parsing fails, treat content as filename
        filename = decryptedContent || 'Untitled';
      }

      return {
        id: entry.id,
        type: entry.type as 'image' | 'video' | 'audio' | 'document',
        title: filename,
        content: decryptedContent, // 🔥 Use decrypted content
        timestamp: new Date(entry.timestamp),
        encrypted: true,
        folderName: 'Media',
        cloudinaryUrl,
        publicId,
      };
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Build grouped feed: messages with attachments
  const messagesWithAttachments = (() => {
    const texts = vaultEntries.filter(e => e.type === 'text');
    const others = vaultEntries.filter(e => e.type !== 'text');

    const byParent: Record<string, typeof others> = {};
    for (const e of others as any) {
      const pid = (e as any).parent_id || null;
      if (!pid) continue;
      if (!byParent[pid]) byParent[pid] = [] as any;
      byParent[pid].push(e);
    }

    return texts
      .map((t) => ({
        message: t,
        attachments: byParent[t.id] || [],
      }))
      .sort((a, b) => new Date(a.message.timestamp).getTime() - new Date(b.message.timestamp).getTime());
  })();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !vault || !user) return;
    
    setSendingMessage(true);
    
    try {
      // 1) Create the text message
      const messageResp = await vaultService.createVaultEntry({
        vault_id: vault.id,
        type: 'text',
        content: newMessage.trim(),
      });

      if (!messageResp.isSuccessful || !messageResp.data) {
        setError(messageResp.errors[0]?.description || 'Failed to send message');
        return;
      }

      const parentMessage = messageResp.data;
      // mark to scroll after we render the new message
      setScrollOnNext(true);

      // 2) If there are pending files, upload and create entries with parent_id
      if (pendingFiles.length > 0) {

        for (const file of pendingFiles) {
          try {
            const cloudinaryResponse = await cloudinaryService.uploadFile(file);
            const fileType = file.type.startsWith('image/') ? 'image' :
                             file.type.startsWith('video/') ? 'video' :
                             file.type.startsWith('audio/') ? 'audio' : 'document';
            const entryPayload = {
              filename: file.name,
              cloudinaryUrl: cloudinaryResponse.secure_url,
              publicId: cloudinaryResponse.public_id,
              size: cloudinaryResponse.bytes,
              format: cloudinaryResponse.format,
            };
            const attachResp = await vaultService.createVaultEntry({
              vault_id: vault.id,
              type: fileType,
              content: JSON.stringify(entryPayload),
              parent_id: parentMessage.id,
            } as any);
            if (attachResp.isSuccessful && attachResp.data) {
              setVaultEntries(prev => [...prev, attachResp.data!]);
            }
          } catch (e) {
            console.error('Attachment upload failed:', e);
            setError('One or more attachments failed to upload');
          }
        }

        setPendingFiles([]);
      }

      // 3) Update UI
      setVaultEntries(prev => [...prev, parentMessage]);
      setNewMessage('');
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
        setVaultEntries(prev => prev.filter(entry => entry.id !== messageId).filter((entry): entry is VaultEntry => entry !== null));
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
    
    if (!window.confirm('Are you sure you want to delete this media file? This action cannot be undone.')) {
      return;
    }
    
    setDeletingItems(prev => new Set([...prev, mediaId]));
    
    try {
      const mediaEntry = vaultEntries.find(entry => entry.id === mediaId);
      let publicId: string | null = null;
      
      if (mediaEntry && mediaEntry.content && user && vault) {
        try {
          // 🔥 Decrypt before parsing
          const decryptedContent = EncryptionUtils.safeDecrypt(mediaEntry.content, user.id, vault.id);
          const contentData = JSON.parse(decryptedContent);
          publicId = contentData.publicId;
        } catch {
          // If parsing fails, continue with deletion anyway
        }
      }
      
      const response = await vaultService.deleteVaultEntry(mediaId);
      
      if (response.isSuccessful) {
        setVaultEntries(prev => prev.filter(entry => entry.id !== mediaId));
        
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
        toast.promise(
          (async () => {
        const cloudinaryResponse = await cloudinaryService.uploadFile(file);
        
        const fileType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'document';

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
              setVaultEntries(prev => [...prev, response.data!]);
              return `File "${file.name}" uploaded successfully`;
            } else {
              throw new Error('Failed to create vault entry');
            }
          })(),
          {
            loading: `Uploading ${file.name}...`,
            success: (message) => message,
            error: `Failed to upload ${file.name}`
          }
        );
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



  const handleRecipientsChanged = () => {
    fetchRecipients();
  };

  const attachFileToMessage = async (file: File, parentMessageId: string) => {
    setPendingFiles(prev => [...prev, file]);
    
    // Show immediate feedback
    toast.info(`Adding ${file.name} to message...`);
    
    toast.promise(
      (async () => {
      const cloudinaryResponse = await cloudinaryService.uploadFile(file);
      const fileType = file.type.startsWith('image/') ? 'image' :
                       file.type.startsWith('video/') ? 'video' :
                       file.type.startsWith('audio/') ? 'audio' : 'document';

      const entryPayload = {
        filename: file.name,
        cloudinaryUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        size: cloudinaryResponse.bytes,
        format: cloudinaryResponse.format,
      };

      const response = await vaultService.createVaultEntry({
        vault_id: vault!.id,
        type: fileType,
        content: JSON.stringify(entryPayload),
        parent_id: parentMessageId,
      });

      if (response.isSuccessful && response.data) {
          setVaultEntries(prev => [...prev, response.data!]);
          return `File "${file.name}" attached successfully`;
        } else {
          throw new Error('Failed to create vault entry');
        }
      })(),
      {
        loading: `Attaching ${file.name}...`,
        success: (message) => message,
        error: `Failed to attach ${file.name}`
      }
    );

      setPendingFiles(prev => prev.filter(f => f.name !== file.name));
  };

  // Auto-scroll to bottom only after sending a new message
  useEffect(() => {
    if (!scrollOnNext) return;
    const t = setTimeout(() => {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setScrollOnNext(false);
    }, 100);
    return () => clearTimeout(t);
  }, [vaultEntries.length, scrollOnNext]);

  // Initial scroll to bottom after entries load
  useEffect(() => {
    if (hasInitialScrolled) return;
    // Only when data is loaded and there are entries
    if (!loading && vaultEntries.length > 0) {
      const t = setTimeout(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setHasInitialScrolled(true);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [loading, vaultEntries.length, hasInitialScrolled]);

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
    <>
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

          {/* Tab Navigation removed: unified feed */}

            {/* Tab Content replaced with single feed */}
        <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messagesWithAttachments.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
                      <p className="text-base text-slate-400 px-4">Start preserving your thoughts and attach files</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messagesWithAttachments.map(({ message, attachments }, idx) => (
                      <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group">
                        <Card className="p-4 bg-slate-900/50 border-slate-700/50">
                          {/* Message header with edit */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Desktop: Editable message */}
                              <div className="hidden sm:block">
                                <EditableMessage
                                  entry={message as any}
                                  onSave={async (content: string) => {
                                    // call update endpoint
                                    try {
                                      await api.patch(`/vaults/entries/${message.id}`, { content });
                                        setVaultEntries(prev => prev.map(e => e.id === message.id ? { ...e, content } : e));
                                    } catch (e) {
                                      setError('Failed to update message');
                                    }
                                  }}
                                />
                              </div>
                              {/* Mobile: Read-only message */}
                              <div className="sm:hidden">
                                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                  {new Date(message.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {/* Desktop actions */}
                              <div className="hidden sm:flex items-center gap-2 ml-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="px-3 text-slate-400 hover:text-white" 
                                  onClick={() => handleDeleteMessage(message.id)}
                                  title="Delete message"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <AttachmentPicker
                                  onFilesSelected={async (files: File[]) => {
                                    for (const file of files) {
                                      await attachFileToMessage(file, message.id);
                                    }
                                  }}
                                  onError={(msg) => setError(msg)}
                                />
                              </div>

                              {/* Mobile kebab menu */}
                              <div className="sm:hidden ml-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="min-w-[10rem] bg-slate-900 border-slate-700">
                                    <DropdownMenuItem
                                      className="text-slate-200 focus:bg-slate-800"
                                      onClick={() => {
                                        // For mobile edit, we'll need to implement a different approach
                                        // For now, show a simple prompt or implement inline editing
                                        const newContent = prompt('Edit message:', message.content ?? '');
                                        if (!newContent) return;
                                        if (newContent !== message.content && newContent.trim() !== '') {
                                          const trimmedContent = newContent.trim();
                                          // Update the message
                                          api.patch(`/vaults/entries/${message.id}`, { content: trimmedContent })
                                            .then(() => {
                                              setVaultEntries(prev => prev.map(e => e.id === message.id ? { ...e, content: trimmedContent } : e));
                                            })
                                            .catch(() => setError('Failed to update message'));
                                        }
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit message
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-slate-200 focus:bg-slate-800"
                                      onClick={() => openFilePickerForMessage(async (files) => {
                                        for (const file of files) {
                                          await attachFileToMessage(file, message.id);
                                        }
                                      })}
                                    >
                                      <Paperclip className="w-4 h-4 mr-2" />
                                      Attach files
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-300 focus:bg-red-900/40"
                                      onClick={() => handleDeleteMessage(message.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete message
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>

                          {/* Attachments dropdown (only when present) */}
                          {attachments.length > 0 && (
                            <Collapsible className="mt-3">
                              <CollapsibleTrigger className="w-full flex items-center justify-between text-sm text-slate-300 hover:text-white bg-slate-800/40 border border-slate-700/50 rounded-md px-3 py-2">
                                <span>Attachments ({attachments.length})</span>
                                <ChevronDown className="w-4 h-4" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {attachments.map((att) => (
                                    <Card key={att.id} className="p-3 bg-slate-800/40 border-slate-700/50">
                                      <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                          <p className="text-sm text-white truncate">
                                            {(() => {
                                              try { const d = JSON.parse(att.content || '{}'); return d.filename || att.type; } catch { return att.type; }
                                            })()}
                                          </p>
                                          <p className="text-xs text-slate-400">{new Date(att.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                          {/* Desktop attachment actions */}
                                          <div className="hidden sm:flex items-center gap-2">
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="px-2 text-slate-300 hover:text-white"
                                              onClick={() => handleDownloadMedia({
                                                id: att.id,
                                                title: (() => { try { const d = JSON.parse(att.content || '{}'); return d.filename || 'download'; } catch { return 'download'; } })(),
                                                cloudinaryUrl: (() => { try { const d = JSON.parse(att.content || '{}'); return d.cloudinaryUrl; } catch { return undefined; } })(),
                                                type: att.type as any,
                                                publicId: (() => { try { const d = JSON.parse(att.content || '{}'); return d.publicId; } catch { return undefined; } })(),
                                              } as any)}
                                              title="Download"
                                            >
                                              <Download className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="px-2 text-red-400 hover:text-red-300" 
                                              onClick={() => handleDeleteMedia(att.id)}
                                              title="Delete attachment"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                          {/* Mobile attachment kebab */}
                                          <div className="sm:hidden">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                                                  <MoreVertical className="w-4 h-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="min-w-[10rem] bg-slate-900 border-slate-700">
                                                <DropdownMenuItem
                                                  className="text-slate-200 focus:bg-slate-800"
                                                  onClick={() => handleDownloadMedia({
                                                    id: att.id,
                                                    title: (() => { try { const d = JSON.parse(att.content || '{}'); return d.filename || 'download'; } catch { return 'download'; } })(),
                                                    cloudinaryUrl: (() => { try { const d = JSON.parse(att.content || '{}'); return d.cloudinaryUrl; } catch { return undefined; } })(),
                                                    type: att.type as any,
                                                    publicId: (() => { try { const d = JSON.parse(att.content || '{}'); return d.publicId; } catch { return undefined; } })(),
                                                  } as any)}
                                                >
                                                  <Download className="w-4 h-4 mr-2" />
                                                  Download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  className="text-red-300 focus:bg-red-900/40"
                                                  onClick={() => handleDeleteMedia(att.id)}
                                                >
                                                  <Trash2 className="w-4 h-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                    <div ref={feedEndRef} />
                  </div>
                )}
              </div>

              {/* Composer (message with attachments) */}
              <div className="p-4 bg-slate-800/20 flex-shrink-0">
                {/* Reuse existing composer with attachments preview */}
                <div className="flex items-end space-x-3 py-1">
                <div className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:ring-inset">
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent text-white placeholder:text-slate-400 border-0 outline-none resize-none py-1 leading-6 min-h-[2rem] custom-scrollbar"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ height: textareaHeight, overflowY: textareaAtMax ? 'auto' : 'hidden' }}
                  />
                </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage || uploadingFiles}
                    className="w-12 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  >
                    {sendingMessage || uploadingFiles ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-8 h-8" />
                    )}
                  </Button>
                </div>

                      </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {vault && (
      <VaultContactsDialog
        open={showContactsDialog}
        onOpenChange={setShowContactsDialog}
        vaultId={vault.id}
        vaultName={vault.name}
        contacts={contacts}
        onRecipientsChanged={handleRecipientsChanged}
      />
      )}

      <DeleteVaultDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        vaultId={vault.id}
        vaultName={vault.name}
        onDeleted={handleVaultDeleted}
      />

        <style>{`
          /* Always show a thin scrollbar when scrollable */
          .custom-scrollbar { scrollbar-width: thin; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.5); border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(51,65,85,0.3); border-radius: 3px; }
        `}</style>
    </>
  );
}