'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Megaphone,
  Smile,
  Paperclip,
  MoreVertical,
  Pin,
  Heart,
  Reply,
} from 'lucide-react';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatMessage } from '@/types';
import toast from 'react-hot-toast';

const channels = [
  { id: 'general', name: 'General', icon: MessageSquare, description: 'General trading discussion' },
  { id: 'signals', name: 'Signals', icon: Hash, description: 'Signal discussion and analysis' },
  { id: 'announcements', name: 'Announcements', icon: Megaphone, description: 'Important announcements' },
];

export default function ChatPage() {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const messagesQuery = query(
      collection(db, 'chatMessages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];
      
      // Filter by current channel and reverse to show newest at bottom
      const filteredMessages = messagesData
        .filter(msg => msg.channel === currentChannel)
        .reverse();
      
      setMessages(filteredMessages);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentChannel, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'chatMessages'), {
        content: newMessage.trim(),
        channel: currentChannel,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        type: 'text',
        reactions: [],
        isPinned: false,
        tags: [],
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChannelIcon = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.icon || MessageSquare;
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Channels
            </h2>
            <div className="space-y-2">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const isActive = currentChannel === channel.id;
                const canAccess = channel.id !== 'announcements' || isAdmin;
                
                if (!canAccess) return null;

                return (
                  <button
                    key={channel.id}
                    onClick={() => setCurrentChannel(channel.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{channel.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-900">
          {/* Channel Header */}
          <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const Icon = getChannelIcon(currentChannel);
                  return <Icon className="h-6 w-6 text-primary-600" />;
                })()}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    #{channels.find(c => c.id === currentChannel)?.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {channels.find(c => c.id === currentChannel)?.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
                  <Users className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-3 group"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-300">
                        {message.createdBy === user?.id ? 'You' : message.createdBy.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {message.createdBy === user?.id ? 'You' : `User ${message.createdBy.slice(-4)}`}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.isPinned && (
                          <Pin className="h-3 w-3 text-primary-600" />
                        )}
                      </div>
                      <div className="bg-white dark:bg-dark-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-dark-700">
                        <p className="text-gray-900 dark:text-white">{message.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
                          <Heart className="h-3 w-3" />
                          <span>React</span>
                        </button>
                        <button className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
                          <Reply className="h-3 w-3" />
                          <span>Reply</span>
                        </button>
                        {isAdmin && (
                          <button className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-danger-600 transition-colors">
                            <MoreVertical className="h-3 w-3" />
                            <span>Moderate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Start the conversation by sending a message!
                </p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 p-4">
            <form onSubmit={sendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${channels.find(c => c.id === currentChannel)?.name}...`}
                    className="w-full resize-none border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
