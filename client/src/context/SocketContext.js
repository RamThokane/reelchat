import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Connection failed. Please try again.');
      setConnected(false);
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    // Handle online users
    newSocket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    // Handle user joined
    newSocket.on('user:joined', (userData) => {
      setOnlineUsers(prev => {
        if (!prev.find(u => u._id === userData.userId)) {
          return [...prev, { _id: userData.userId, username: userData.username, avatar: userData.avatar }];
        }
        return prev;
      });
    });

    // Handle user left
    newSocket.on('user:left', (userData) => {
      setOnlineUsers(prev => prev.filter(u => u._id !== userData.userId));
      setTypingUsers(prev => prev.filter(u => u.userId !== userData.userId));
    });

    // Handle incoming messages
    newSocket.on('message:received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Handle typing indicators
    newSocket.on('user:typing', (data) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    newSocket.on('user:stopped-typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Send message
  const sendMessage = useCallback((content, options = {}) => {
    if (!socket || !connected) {
      setError('Not connected to server');
      return;
    }

    socket.emit('message:send', {
      content,
      room: options.room || 'general',
      recipientId: options.recipientId || null,
      isPrivate: options.isPrivate || false
    });
  }, [socket, connected]);

  // Start typing indicator
  const startTyping = useCallback((options = {}) => {
    if (!socket || !connected) return;
    
    socket.emit('typing:start', {
      room: options.room || 'general',
      recipientId: options.recipientId || null
    });
  }, [socket, connected]);

  // Stop typing indicator
  const stopTyping = useCallback((options = {}) => {
    if (!socket || !connected) return;
    
    socket.emit('typing:stop', {
      room: options.room || 'general',
      recipientId: options.recipientId || null
    });
  }, [socket, connected]);

  // Join a room
  const joinRoom = useCallback((room) => {
    if (!socket || !connected) return;
    socket.emit('room:join', room);
  }, [socket, connected]);

  // Leave a room
  const leaveRoom = useCallback((room) => {
    if (!socket || !connected) return;
    socket.emit('room:leave', room);
  }, [socket, connected]);

  // Join private chat
  const joinPrivateChat = useCallback((recipientId) => {
    if (!socket || !connected) return;
    socket.emit('private:join', recipientId);
  }, [socket, connected]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Add messages (for loading history)
  const addMessages = useCallback((newMessages) => {
    setMessages(prev => [...newMessages, ...prev]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    socket,
    connected,
    onlineUsers,
    messages,
    typingUsers,
    error,
    sendMessage,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
    joinPrivateChat,
    clearMessages,
    addMessages,
    clearError
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
