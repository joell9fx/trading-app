import { useEffect, useMemo, useRef } from 'react';
import { HubMessage, HubUser } from './types';
import { Message } from './message';
import { ScrollText, Pin } from 'lucide-react';

interface ChatWindowProps {
  messages: HubMessage[];
  currentUser: HubUser;
  onReact: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string, pinned: boolean) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  isLoading?: boolean;
  onLoadOlder?: () => void;
  loadingOlder?: boolean;
  hasMore?: boolean;
}

export function ChatWindow({
  messages,
  currentUser,
  onReact,
  onPin,
  onDelete,
  onReply,
  isLoading,
  onLoadOlder,
  loadingOlder,
  hasMore,
}: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const pinned = useMemo(() => messages.filter((m) => m.is_pinned), [messages]);
  const isModerator = currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR';

  return (
    <div className="flex flex-col h-full bg-gray-950/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {pinned.length ? (
        <div className="border-b border-amber-400/30 bg-amber-500/10 px-4 py-2 flex items-center gap-2 text-amber-100">
          <Pin className="h-4 w-4" />
          <span className="text-sm font-semibold">Pinned</span>
          <span className="text-xs text-amber-200/80">Showing {pinned.length} message(s)</span>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-5 p-6"
        onScroll={(e) => {
          const top = (e.target as HTMLDivElement).scrollTop;
          if (top <= 24 && hasMore && !loadingOlder && onLoadOlder) {
            onLoadOlder();
          }
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <ScrollText className="h-5 w-5 animate-pulse" />
            Loading messages...
          </div>
        ) : messages.length ? (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isOwn={message.author_id === currentUser.id}
              currentUserId={currentUser.id}
              onReact={onReact}
              onPin={isModerator ? onPin : undefined}
              onDelete={isModerator ? onDelete : undefined}
              onReply={onReply}
              canModerate={isModerator}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-12">
            <ScrollText className="h-10 w-10 mx-auto mb-3 text-gray-600" />
            <p className="font-semibold text-white">No messages yet</p>
            <p className="text-gray-500">Start the conversation!</p>
          </div>
        )}
        {loadingOlder && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ScrollText className="h-4 w-4 animate-pulse" />
            Loading earlier messages...
          </div>
        )}
      </div>
    </div>
  );
}

