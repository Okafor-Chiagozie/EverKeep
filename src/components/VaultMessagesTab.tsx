import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare,
  Send,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocalVaultEntry {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  title: string;
  content: string;
  timestamp: Date;
  encrypted: boolean;
  folderName?: string;
}

interface VaultMessagesTabProps {
  textEntries: LocalVaultEntry[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  textareaHeight: number;
  setTextareaHeight: (height: number) => void;
  sendingMessage: boolean;
  onSendMessage: () => void;
  onDeleteMessage: (messageId: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function VaultMessagesTab({
  textEntries,
  newMessage,
  setNewMessage,
  textareaHeight,
  setTextareaHeight,
  sendingMessage,
  onSendMessage,
  onDeleteMessage,
  onKeyDown
}: VaultMessagesTabProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const minHeight = 40;
      const maxHeight = 120;
      
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight + 4, minHeight), maxHeight);
      const finalHeight = scrollHeight > maxHeight - 4 ? maxHeight : newHeight;
      
      textarea.style.height = `${finalHeight}px`;
      setTextareaHeight(finalHeight);
    }
  }, [newMessage, setTextareaHeight]);

  // Auto-scroll to bottom when entries change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [textEntries]);

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

  return (
    <>
      {/* Messages Area - Scrollable middle content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                transition={{ delay: index * 0.1 }}
                className="flex justify-end group"
              >
                <div className="max-w-[80%] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rounded-tr-md p-4">
                  <div className="text-white">
                    <p className="text-base whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                    <span className="text-xs text-blue-100">{formatTime(entry.timestamp)}</span>
                    <button
                      onClick={() => onDeleteMessage(entry.id)}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 p-1 bg-transparent hover:bg-white/10 rounded"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3 text-blue-100 hover:text-red-300" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
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
              onKeyDown={onKeyDown}
              disabled={sendingMessage}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
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
            onClick={onSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-[40px] py-6 mb-[0.3rem]"
          >
            {sendingMessage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}