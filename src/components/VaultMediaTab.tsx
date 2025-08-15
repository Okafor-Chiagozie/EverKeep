import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Image,
  Video,
  Mic,
  FileText,
  Paperclip,
  Play,
  Download,
  Trash2,
  Loader2,
  File
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mediaUtils } from '@/utils/mediaUtils';

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

interface VaultMediaTabProps {
  mediaEntries: LocalVaultEntry[];
  onDeleteMedia: (mediaId: string) => void;
  onDownloadMedia: (entry: LocalVaultEntry) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadingFiles: boolean;
  deletingItems?: Set<string>;
}

export function VaultMediaTab({
  mediaEntries,
  onDeleteMedia,
  onDownloadMedia,
  fileInputRef,
  uploadingFiles,
  deletingItems = new Set()
}: VaultMediaTabProps) {
  const mediaEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when entries change
  useEffect(() => {
    const scrollToBottom = () => {
      if (mediaEndRef.current) {
        mediaEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [mediaEntries]);

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
      case 'document': return File;
      case 'text': return FileText;
      default: return FileText;
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {mediaEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Image className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No files yet</h3>
              <p className="text-base text-slate-400 mb-6 px-4">Upload photos, videos, audio recordings, and documents</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMedia(entry.id);
                      }}
                      className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 p-1 bg-red-500/80 hover:bg-red-500 rounded-full z-10"
                      title="Delete media"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                    
                    <div className="aspect-square bg-slate-700/50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-600/50 transition-colors overflow-hidden relative">
                      {deletingItems.has(entry.id) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      {entry.cloudinaryUrl ? (
                        entry.type === 'image' ? (
                          <img 
                            src={mediaUtils.getThumbnailUrl(entry.cloudinaryUrl, 200, 200)} 
                            alt={entry.title}
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy"
                          />
                        ) : entry.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <video 
                              src={entry.cloudinaryUrl}
                              className="w-full h-full object-cover rounded-lg"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="w-8 h-8 text-white opacity-80" />
                            </div>
                          </div>
                        ) : entry.type === 'document' ? (
                          <div className="relative w-full h-full bg-slate-600 flex items-center justify-center">
                            <File className="w-12 h-12 text-slate-300" />
                            <div className="absolute bottom-1 left-1 right-1">
                              <div className="bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center truncate">
                                {mediaUtils.getFileExtension(entry.title).toUpperCase() || 'DOC'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <IconComponent className="w-8 h-8 text-slate-400" />
                        )
                      ) : (
                        <IconComponent className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <h4 className="font-medium text-white text-sm truncate mb-1">{entry.title}</h4>
                    <p className="text-xs text-slate-400">{formatTime(entry.timestamp)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {entry.type}
                      </Badge>
                      <div className="flex space-x-1">
                        {entry.type === 'video' && entry.cloudinaryUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(entry.cloudinaryUrl, '_blank');
                            }}
                            title="Preview video"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        {entry.type === 'document' && entry.cloudinaryUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              mediaUtils.openDocument({
                                id: entry.id,
                                title: entry.title,
                                cloudinaryUrl: entry.cloudinaryUrl,
                                type: entry.type
                              });
                            }}
                            title="Open document"
                          >
                            <FileText className="w-3 h-3" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-auto hover:bg-slate-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadMedia(entry);
                          }}
                          title="Download file"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
            <div ref={mediaEndRef} />
          </div>
        )}
      </div>

      {/* Media Upload Area - Fixed at bottom */}
      <div className="p-4 bg-slate-800/20 flex-shrink-0">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFiles}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            {uploadingFiles ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Paperclip className="w-4 h-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}