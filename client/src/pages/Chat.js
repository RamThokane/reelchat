import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Header from '../components/Header';
import UserList from '../components/UserList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { token } = useAuth();
  const { 
    onlineUsers, 
    messages, 
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    clearMessages,
    addMessages,
    connected,
    error
  } = useSocket();

  // Load message history
  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    clearMessages();
    
    try {
      let url;
      if (selectedUser) {
        url = `/api/messages/private/${selectedUser._id}`;
      } else {
        url = '/api/messages/general';
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        addMessages(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedUser, token, clearMessages, addMessages]);

  // Load messages when chat selection changes
  useEffect(() => {
    if (connected) {
      loadMessages();
    }
  }, [selectedUser, connected, loadMessages]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show desktop notification for new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && document.hidden && Notification.permission === 'granted') {
      new Notification('New Message - ReelChat', {
        body: `${lastMessage.sender.username}: ${lastMessage.content}`,
        icon: '/favicon.ico'
      });
    }
  }, [messages]);

  const handleSendMessage = (content) => {
    sendMessage(content, {
      room: selectedUser ? null : 'general',
      recipientId: selectedUser?._id,
      isPrivate: !!selectedUser
    });
  };

  const handleTypingStart = () => {
    startTyping({
      room: selectedUser ? null : 'general',
      recipientId: selectedUser?._id
    });
  };

  const handleTypingStop = () => {
    stopTyping({
      room: selectedUser ? null : 'general',
      recipientId: selectedUser?._id
    });
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  // Filter typing users based on current chat
  const filteredTypingUsers = selectedUser 
    ? typingUsers.filter(u => u.userId === selectedUser._id)
    : typingUsers;

  return (
    <div className="chat-container">
      <Header />
      
      <div className="chat-main">
        <UserList 
          users={onlineUsers}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
        />
        
        <div className="chat-area">
          <div className="chat-area-header">
            <h2>
              {selectedUser 
                ? `💬 Chat with ${selectedUser.username}`
                : '🌐 General Chat'
              }
            </h2>
          </div>

          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}

          {loadingMessages ? (
            <div className="loading-messages">
              <div className="loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : (
            <MessageList 
              messages={messages}
              typingUsers={filteredTypingUsers}
            />
          )}
          
          <MessageInput 
            onSendMessage={handleSendMessage}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
