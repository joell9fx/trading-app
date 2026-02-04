import Image from 'next/image';
import { HubMessage } from './types';
import { MessageSquare, Pin, Trash2 } from 'lucide-react';

interface MessageProps {
  message: HubMessage;
  isOwn: boolean;
  onReact: (messageId: string, emoji: string) => void;
  currentUserId: string;
  onPin?: (messageId: string, pinned: boolean) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  canModerate?: boolean;
  reactionOptions?: string[];
}

const DEFAULT_REACTIONS = ['👍', '🔥', '🚀', '💡', '🎯'];

function Avatar({ message }: { message: HubMessage }) {
  const initials =
    message.profiles?.full_name?.slice(0, 2).toUpperCase() ||
    message.profiles?.name?.slice(0, 2).toUpperCase() ||
    message.profiles?.email?.charAt(0)?.toUpperCase() ||
    'U';

  if (message.profiles?.avatar_url) {
    return (
      <Image
        src={message.profiles.avatar_url}
        alt={message.profiles.full_name || message.profiles.name || initials}
        width={40}
        height={40}
        unoptimized
        className="h-10 w-10 rounded-full object-cover border border-gray-800"
      />
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-semibold flex items-center justify-center border border-gray-900">
      {initials}
    </div>
  );
}

function Attachment({ url, type, name }: { url: string; type?: string | null; name?: string | null }) {
  const isImage = type?.startsWith('image/');
  if (isImage) {
    return (
      <Image
        src={url}
        alt={name || 'attachment'}
        width={800}
        height={600}
        unoptimized
        className="max-h-48 rounded-lg border border-gray-800 object-cover w-auto"
      />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-amber-200 hover:border-amber-300"
    >
      <MessageSquare className="h-4 w-4" />
      <span className="truncate max-w-[180px]">{name || url}</span>
    </a>
  );
}

export function Message({
  message,
  isOwn,
  onReact,
  currentUserId,
  onPin,
  onDelete,
  onReply,
  canModerate,
  reactionOptions = DEFAULT_REACTIONS,
}: MessageProps) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const name =
    message.profiles?.full_name ||
    message.profiles?.name ||
    message.profiles?.email?.split('@')[0] ||
    'Unknown';

  const reactionCounts = (message.reactions || []).reduce<Record<string, { count: number; mine: boolean }>>((acc, r) => {
    const key = r.emoji;
    if (!acc[key]) acc[key] = { count: 0, mine: false };
    acc[key].count += 1;
    if (r.user_id === currentUserId) {
      acc[key].mine = true;
    }
    return acc;
  }, {});

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse text-right' : 'flex-row'}`}>
      <Avatar message={message} />
      <div className={`max-w-[72%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <p className="text-sm font-semibold text-white">{isOwn ? 'You' : name}</p>
          <span className="text-xs text-gray-500">{time}</span>
          {message.is_pinned && (
            <span className="text-[10px] uppercase tracking-wide bg-amber-500/20 text-amber-200 px-2 py-1 rounded-full border border-amber-400/50">
              Pinned
            </span>
          )}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border ${
            isOwn
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black border-amber-300'
              : 'bg-gray-900 text-gray-100 border-gray-800'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          {message.attachments?.length ? (
            <div className="mt-3 space-y-2">
              {message.attachments.map((att) => (
                <Attachment key={att.url} url={att.url} type={att.type} name={att.name} />
              ))}
            </div>
          ) : null}
        </div>
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex items-center gap-1">
            {reactionOptions.map((emoji) => {
              const data = reactionCounts[emoji];
              const hasReactions = !!data;
              const mine = !!data?.mine;
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    mine
                      ? 'bg-amber-500/30 border-amber-300 text-amber-900'
                      : hasReactions
                      ? 'border-amber-300/60 text-amber-200'
                      : 'border-gray-800 text-gray-500 hover:border-amber-300/40'
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  {data?.count ? <span>{data.count}</span> : null}
                </button>
              );
            })}
          </div>
          {onReply && (
            <button
              onClick={() => onReply(message.id)}
              className="text-xs text-gray-500 hover:text-amber-200 inline-flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Reply
            </button>
          )}
          {canModerate && (
            <div className="flex items-center gap-2">
              {onPin && (
                <button
                  onClick={() => onPin(message.id, !message.is_pinned)}
                  className="text-xs text-gray-500 hover:text-amber-200 inline-flex items-center gap-1"
                >
                  <Pin className="h-3 w-3" />
                  {message.is_pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

