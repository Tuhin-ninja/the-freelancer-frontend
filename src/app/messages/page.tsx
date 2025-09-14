'use client';
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ChatService } from '@/services/chat';
import { Conversation, Message, User } from '@/types/api';
import { MessageCircle, Search, Plus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import UserSearchModal from '@/components/chat/UserSearchModal';

const ChatPage = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading conversations from server...');
      
      // Use the recent messages API to get conversations with actual message history
      const data = await ChatService.getRecentConversations();
      console.log('📱 Loaded recent conversations:', data);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async (recipient: User) => {
    console.log('🚀 Messages Page: Starting new conversation with:', recipient);
    try {
      // Validate recipient
      if (!recipient || !recipient.id) {
        console.error('❌ Invalid recipient:', recipient);
        return;
      }

      // Show loading state for conversation creation
      setCreatingConversation(true);
      
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants?.some(p => p?.id === recipient.id)
      );
      
      if (existingConversation) {
        // If conversation already exists, just select it
        setSelectedConversation(existingConversation);
        setShowUserSearch(false);
        console.log(`📱 Opening existing conversation with ${recipient.name} (@${recipient.handle})`);
        return;
      }
      
      // Create local conversation (messages will be created when first message is sent)
      console.log(`🔄 Creating local conversation with ${recipient.name} (@${recipient.handle})...`);
      
      const tempId = Date.now() * -1; // negative temporary id
      const now = new Date().toISOString();
      const conversation: Conversation = {
        id: tempId,
        participantIds: [user!.id, recipient.id],
        participants: [user as User, recipient],
        lastMessage: undefined,
        unreadCount: 0,
        createdAt: now,
        updatedAt: now
      };

      // Update conversations list locally
      setConversations(prev => [conversation, ...prev]);

      // Select the new conversation and close modal
      setSelectedConversation(conversation);
      setShowUserSearch(false);

      console.log(`🎉 Local conversation opened with ${recipient.name} (@${recipient.handle})`);
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = (message: Message) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message }
          : conv
      )
    );
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
          <p className="text-gray-500">You need to be logged in to access chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-full rounded-lg shadow-xl overflow-hidden">
        {/* Sidebar - Conversation List */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "circOut" }}
          className={`${isMobile && selectedConversation ? 'hidden' : 'flex'} flex-col w-full md:w-[340px] lg:w-[380px] border-r border-gray-200 bg-gray-50`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
              <button
                onClick={() => setShowUserSearch(true)}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                title="New Message"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations.filter(c =>
                c.participants?.some(p => 
                  p && p.name && (
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.handle?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                )
              )}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              loading={loading}
              currentUser={user}
            />
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className={`${isMobile && !selectedConversation ? 'hidden' : 'flex'} flex-1 flex flex-col`}>
          <AnimatePresence>
            {selectedConversation ? (
              <>
                {/* Mobile Back Button */}
                {isMobile && (
                  <div className="p-4 border-b border-gray-200 bg-white md:hidden">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center text-blue-500 hover:text-blue-600"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to conversations
                    </button>
                  </div>
                )}

                <ChatWindow
                  conversation={selectedConversation}
                  currentUser={user}
                  onMessageSent={handleMessageSent}
                />
              </>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center bg-gradient-to-br from-white to-gray-50"
              >
                <div className="text-center p-6">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Messages</h2>
                  <p className="text-gray-500 mb-4">Select a conversation to start chatting</p>
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
                  >
                    Start New Conversation
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleNewConversation}
        creatingConversation={creatingConversation}
      />
    </div>
  );
};

export default ChatPage;
