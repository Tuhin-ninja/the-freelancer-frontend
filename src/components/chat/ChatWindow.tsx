import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User } from '@/types/api';
import { ChatService } from '@/services/chat';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: User | null;
  onMessageSent: (message: Message) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUser,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const otherParticipant = conversation.participants?.find(p => p && p.id !== currentUser?.id);

  console.log('🔍 ChatWindow Debug Info:');
  console.log('- Conversation ID:', conversation.id);
  console.log('- Current User ID:', currentUser?.id);
  console.log('- Participants:', conversation.participants);
  console.log('- Other Participant:', otherParticipant);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation && otherParticipant) {
      console.log('🔄 Conversation changed, clearing messages and loading new ones');
      setMessages([]); // Clear previous messages
      loadMessages();
    }
  }, [conversation.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!otherParticipant) {
      console.error('No other participant found');
      return;
    }

    try {
      setLoading(true);
      console.log(`🔄 Loading messages with user ${otherParticipant.id} (${otherParticipant.name})`);
      console.log('📋 Current conversation:', conversation);
      console.log('👤 Current user:', currentUser?.id);
      console.log('👥 Other participant:', otherParticipant);
      
      const response = await ChatService.getMessages(otherParticipant.id);
      // Reverse to show oldest first
      setMessages(response.content.reverse());
      console.log(`✅ Loaded ${response.content.length} messages for conversation with ${otherParticipant.name}`);
      console.log('📨 Messages:', response.content);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

    const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !currentUser) return;

    const messageContent = newMessage.trim();
    const recipient = conversation.participants?.find(p => p && p.id !== currentUser.id);

    if (!recipient) {
      console.error("Could not find recipient in conversation");
      console.error("Conversation participants:", conversation.participants);
      console.error("Current user ID:", currentUser.id);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: messageContent,
      messageType: 'TEXT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: currentUser,
      isRead: false
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    // Ensure textarea is cleared
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
    
    setSending(true);

    try {
        console.log("=== DEBUGGING USER IDS ===");
        console.log("Current user object:", JSON.stringify(currentUser, null, 2));
        console.log("Recipient object:", JSON.stringify(recipient, null, 2));
        console.log("Current user ID raw:", currentUser.id);
        console.log("Current user ID type:", typeof currentUser.id);
        console.log("Recipient ID raw:", recipient.id);
        console.log("Recipient ID type:", typeof recipient.id);
        
        // More aggressive cleaning - handle arrays, objects, etc.
        let cleanSenderId;
        let cleanReceiverId;
        
        if (Array.isArray(currentUser.id)) {
            cleanSenderId = currentUser.id[0]?.toString() || '';
        } else if (typeof currentUser.id === 'object') {
            cleanSenderId = Object.values(currentUser.id)[0]?.toString() || '';
        } else {
            cleanSenderId = String(currentUser.id);
        }
        
        if (Array.isArray(recipient.id)) {
            cleanReceiverId = recipient.id[0]?.toString() || '';
        } else if (typeof recipient.id === 'object') {
            cleanReceiverId = Object.values(recipient.id)[0]?.toString() || '';
        } else {
            cleanReceiverId = String(recipient.id);
        }
        
        // Remove any non-numeric characters
        cleanSenderId = cleanSenderId.replace(/[^\d]/g, '');
        cleanReceiverId = cleanReceiverId.replace(/[^\d]/g, '');
        
        console.log("Clean sender ID:", cleanSenderId);
        console.log("Clean receiver ID:", cleanReceiverId);
        console.log("=== END DEBUGGING ===");
        
        if (!cleanSenderId || !cleanReceiverId) {
            throw new Error(`Invalid IDs: senderId=${cleanSenderId}, receiverId=${cleanReceiverId}`);
        }
        
        const sentMessage = await ChatService.sendMessage({
            senderId: cleanSenderId,
            receiverId: cleanReceiverId,
            content: messageContent,
            messageType: 'TEXT',
            replyToId: undefined,
            attachments: []
        });

      setMessages(prev => prev.map(m => m.id === tempId ? sentMessage : m));
      onMessageSent(sentMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return '';
    }
  };

  const shouldShowDateSeparator = (currentMessage: Message, index: number): boolean => {
    if (index === 0) return true;
    
    const previousMessage = messages[index - 1];
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-80px)]">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                {otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{otherParticipant?.name || 'Unknown User'}</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gray-50">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser?.id;
            const showDateSeparator = shouldShowDateSeparator(message, index);

            return (
              <React.Fragment key={message.id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex justify-center py-3">
                    <span className="bg-white border border-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                )}

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className={`max-w-md px-4 py-2.5 rounded-xl shadow-sm ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
                <p className={`text-xs text-gray-400 ${isOwnMessage ? 'text-right' : 'text-left ml-10'}`}>
                  {formatMessageTime(message.createdAt)}
                </p>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white shadow-lg">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[48px] max-h-32 bg-white text-gray-900 placeholder-gray-500 shadow-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={sending}
            />
            
            {/* Action buttons in input */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-1">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Add emoji"
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Send className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
