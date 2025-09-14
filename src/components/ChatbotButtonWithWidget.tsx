"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';

const ChatbotButtonWithWidget: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
        title="Chat with AI Assistant"
        onClick={() => setOpen((prev) => !prev)}
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
      {open && <ChatbotWidget />}
    </>
  );
};

export default ChatbotButtonWithWidget;
