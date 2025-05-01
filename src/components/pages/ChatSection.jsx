import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/authContext';
import { useLocation } from 'react-router-dom';

const ChatSection = ({ proposalId, investorId, businessData, investorData }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { userDetails } = useAuth();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Determine if current user is business owner or investor
  const isBusinessOwner = location.pathname === '/common-page' && 
                         userDetails?.userId === businessData?.userId;
  
  const currentUserModel = isBusinessOwner ? 'BusinessProposal' : 'Investor';
  const currentUserId = isBusinessOwner ? proposalId : investorId;

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [proposalId, investorId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chats/get-by-proposal-investor/${proposalId}/${investorId}`
      );
      const data = await response.json();
      if (data.status && data.data) {
        // Only update messages if there are new ones to avoid UI flicker
        const newMessages = data.data.all_chats || [];
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Create optimistic message
    const optimisticMessage = {
      message: newMessage,
      senderModel: currentUserModel,
      sender: currentUserId,
      createdAt: new Date().toISOString(),
      pending: true // Flag to identify optimistic messages
    };

    // Update UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      // Try to add message to existing chat
      const addMessageResponse = await fetch(
        `${API_BASE_URL}/api/chats/add-message/proposal/${proposalId}/investor/${investorId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: optimisticMessage.message,
            senderId: currentUserId,
            senderModel: currentUserModel
          }),
        }
      );

      if (!addMessageResponse.ok) {
        // If no existing chat, create new chat
        const messageData = {
          proposal: proposalId,
          investor: investorId,
          message: optimisticMessage.message,
          senderId: currentUserId,
          senderModel: currentUserModel
        };

        const createResponse = await fetch(`${API_BASE_URL}/api/chats/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to send message');
        }
      }

      // Remove pending status after successful send
      setMessages(prev => 
        prev.map(msg => 
          msg === optimisticMessage ? { ...msg, pending: false } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message from UI
      setMessages(prev => prev.filter(msg => msg !== optimisticMessage));
      // Show error to user
      alert('Failed to send message. Please try again.');
    }
  };

  const getSenderName = (message) => {
    if (message.senderModel === 'BusinessProposal') {
      return businessData?.businessLegalName || 'Business Owner';
    }
    return investorData?.fullName || 'Investor';
  };

  const isCurrentUserMessage = (message) => {
    return message.senderModel === currentUserModel && 
           message.sender === currentUserId;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-96px)] bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        <p className="text-sm text-gray-500">
          {isBusinessOwner ? 
            `Chatting with ${investorData?.fullName}` : 
            `Chatting with ${businessData?.businessLegalName}`}
        </p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} 
                   className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[70%]">
                  <div className={`px-4 py-2 rounded-lg ${
                    isCurrentUserMessage(message) 
                      ? `bg-green-50 text-green-900 ${message.pending ? 'opacity-70' : ''}` 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    isCurrentUserMessage(message) ? 'text-right' : 'text-left'
                  }`}>
                    {getSenderName(message)} • {
                      message.pending ? 'Sending...' : formatMessageTime(message.createdAt)
                    }
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSection;