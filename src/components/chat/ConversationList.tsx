import React, { useState, useEffect } from 'react';
import { Conversation, User } from '@/types/api';
import { motion } from 'framer-motion';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  loading: boolean;
  currentUser: User | null;
}

// Simple date formatter - using client-side only to prevent hydration mismatch
const useFormatMessageTime = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const formatMessageTime = (dateString: string): string => {
    if (!isClient) return ''; // Return empty string during SSR
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'now';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d`;
      
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };
  
  return formatMessageTime;
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  loading,
  currentUser
}) => {
  const formatMessageTime = useFormatMessageTime();
  const getOtherParticipant = (conversation: Conversation): User | null => {
    if (!currentUser) return null;
    
    // For chat-based conversations, participants[0] is the other user
    console.log(conversation);
    if (conversation.participants && conversation.participants.length > 0) {
      const otherUser = conversation.participants.find(p => p.id !== currentUser.id);
      if (otherUser) return otherUser;
      
      // If no participant matches (shouldn't happen), return the first one
      return conversation.participants[0];
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="p-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 mb-2">
            <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No conversations yet</p>
        <p className="text-sm text-gray-400 mt-1">Start a new conversation to begin chatting</p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const isSelected = selectedConversation?.id === conversation.id;
        const hasUnread = conversation.unreadCount && conversation.unreadCount > 0;

        return (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
            className={`cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-50 border-r-4 border-blue-500'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onConversationSelect(conversation)}
          >
            <div className="flex items-center p-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* Online indicator (you can implement this based on your backend) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>

              {/* Conversation Info */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium truncate ${
                    hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'
                  }`}>
                    {otherParticipant?.name || 'Unknown User'}
                  </h3>
                  
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 ml-2">
                      {formatMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm truncate ${
                    hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {conversation.lastMessage?.content || 'Start a conversation...'}
                  </p>

                  {/* Unread badge */}
                  {/* {hasUnread && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  )} */}
                </div>

                {/* User role badge */}
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    otherParticipant?.role === 'freelancer'
                      ? 'bg-green-100 text-green-800'
                      : otherParticipant?.role === 'client'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {otherParticipant?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ConversationList;
