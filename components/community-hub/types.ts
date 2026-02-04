export type HubRole = 'ADMIN' | 'MODERATOR' | 'TRADER' | 'MEMBER' | 'VIEWER';

export interface HubUser {
  id: string;
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: HubRole;
}

export interface HubAttachment {
  url: string;
  name?: string | null;
  type?: string | null;
  size?: number | null;
}

export interface HubReaction {
  emoji: string;
  user_id: string;
  id?: string;
}

export interface HubChannel {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: 'general' | 'forex' | 'crypto' | 'signals' | 'mentorship' | 'announcements';
  is_private?: boolean;
  created_by?: string | null;
  unread_count?: number;
  last_message_at?: string | null;
}

export interface HubMessage {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
  author_id: string;
  channel_id: string;
  attachments: HubAttachment[];
  is_pinned?: boolean;
  thread_parent_id?: string | null;
  profiles?: {
    id?: string;
    name?: string | null;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    role?: HubRole;
  } | null;
  reactions?: HubReaction[];
}

