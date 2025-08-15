import { Paperclip } from 'lucide-react';

interface AttachmentPickerProps {
  onFilesSelected: (files: File[]) => void | Promise<void>;
  accept?: string;
  maxFileSizeMB?: number;
  onError?: (message: string) => void;
}

export function AttachmentPicker({ onFilesSelected, accept = 'image/*,video/*,audio/*,application/pdf', maxFileSizeMB = 25, onError }: AttachmentPickerProps) {
  const id = `attach-input-${Math.random().toString(36).slice(2)}`;

  const validate = (files: FileList): File[] => {
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    const picked: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > maxBytes) {
        onError?.(`"${file.name}" is larger than ${maxFileSizeMB}MB`);
        continue;
      }
      picked.push(file);
    }
    return picked;
  };

  return (
    <>
      <label htmlFor={id} className="cursor-pointer flex items-center text-slate-300 hover:text-white text-sm px-2 py-1 rounded hover:bg-slate-700/40">
        <Paperclip className="w-4 h-4 mr-1" />
        <span>Attach</span>
      </label>
      <input
        id={id}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            const valid = validate(files);
            if (valid.length > 0) onFilesSelected(valid);
            // clear selection to allow re-picking the same files
            e.currentTarget.value = '';
          }
        }}
      />
    </>
  );
} 