import { FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Paperclip, SendHorizonal, Smile } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onUpload?: (files: FileList) => void;
  disabled?: boolean;
  isSending?: boolean;
}

export function MessageInput({ value, onChange, onSend, onUpload, disabled, isSending }: MessageInputProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled || isSending) return;
    onSend();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-950/80 border border-gray-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Share an insight, ask a question, or drop a chart..."
          className="min-h-[70px] bg-gray-900 border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400"
          disabled={disabled}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="text-gray-400 hover:text-amber-200 hover:bg-gray-900"
            title="Upload image or file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            className="text-gray-600 hover:text-gray-400"
            title="Emoji picker (coming soon)"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !value.trim()}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-300 hover:to-yellow-400"
          >
            {isSending ? (
              <div className="h-5 w-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            ) : (
              <SendHorizonal className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
        <ImageIcon className="h-3 w-3" />
        <span>Images/PDF up to 8MB. Announcements are admin-only.</span>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && onUpload) onUpload(e.target.files);
          if (fileRef.current) fileRef.current.value = '';
        }}
      />
    </form>
  );
}

