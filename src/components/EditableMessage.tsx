import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Check, X } from 'lucide-react';

interface EditableMessageProps {
  entry: { id: string; content: string };
  onSave: (content: string) => Promise<void> | void;
}

export function EditableMessage({ entry, onSave }: EditableMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(entry.content || '');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [atMax, setAtMax] = useState(false);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(value.length, value.length);
    }
  }, [isEditing]);

  // Auto-resize up to 10 lines and toggle overflow only at max height
  useEffect(() => {
    if (!isEditing || !textareaRef.current) return;
    const ta = textareaRef.current;
    ta.style.height = 'auto';
    const styles = window.getComputedStyle(ta);
    const lineHeight = parseFloat(styles.lineHeight || '20');
    const max = lineHeight * 8; // 8 lines
    const next = Math.min(ta.scrollHeight, max);
    ta.style.height = `${next}px`;
    setAtMax(next >= max - 1);
  }, [isEditing, value]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      setSaving(true);
      await onSave(trimmed);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-white break-words overflow-wrap-anywhere whitespace-pre-wrap"
          aria-label="Message content"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 8 as any,
            WebkitBoxOrient: 'vertical' as any,
            overflow: 'hidden',
          }}
        >
          {entry.content}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          onClick={() => { setValue(entry.content || ''); setIsEditing(true); }}
          aria-label="Edit message"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/50">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent text-white placeholder:text-slate-400 border-0 outline-none resize-none py-0 custom-scrollbar"
          placeholder="Edit message"
          rows={1}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
              e.preventDefault();
              handleSave();
            } else if (e.key === 'Escape') {
              setIsEditing(false);
              setValue(entry.content || '');
            }
          }}
          aria-label="Edit message input"
          style={{ overflowY: atMax ? 'auto' : 'hidden' }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-green-400 hover:text-green-300"
          onClick={handleSave}
          disabled={saving || !value.trim()}
          aria-label="Save message"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          onClick={() => { setIsEditing(false); setValue(entry.content || ''); }}
          disabled={saving}
          aria-label="Cancel edit"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 