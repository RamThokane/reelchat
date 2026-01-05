const Message = require('../models/Message');
const User = require('../models/User');

// Store online users
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.username} (${socket.id})`);

    // Update user online status
    await User.findByIdAndUpdate(user._id, { isOnline: true });
    
    // Add to online users map
    onlineUsers.set(user._id.toString(), {
      socketId: socket.id,
      username: user.username,
      avatar: user.avatar
    });

    // Join general room
    socket.join('general');

    // Broadcast online users list
    const onlineUsersList = await User.find({ isOnline: true }).select('username avatar _id');
    io.emit('users:online', onlineUsersList);

    // Notify others that user joined
    socket.broadcast.emit('user:joined', {
      userId: user._id,
      username: user.username,
      avatar: user.avatar
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { content, room = 'general', recipientId, isPrivate = false } = data;

        if (!content || content.trim() === '') {
          return socket.emit('error', { message: 'Message content is required' });
        }

        // Create and save message
        const message = await Message.create({
          sender: user._id,
          content: content.trim(),
          room,
          recipient: isPrivate ? recipientId : null,
          isPrivate
        });

        // Populate sender info
        await message.populate('sender', 'username avatar');

        const messageData = {
          _id: message._id,
          content: message.content,
          sender: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar
          },
          room: message.room,
          isPrivate: message.isPrivate,
          createdAt: message.createdAt
        };

        if (isPrivate && recipientId) {
          // Private message - send only to sender and recipient
          const recipientSocket = onlineUsers.get(recipientId);
          if (recipientSocket) {
            io.to(recipientSocket.socketId).emit('message:received', messageData);
          }
          socket.emit('message:received', messageData);
        } else {
          // Public message - broadcast to room
          io.to(room).emit('message:received', messageData);
        }
      } catch (error) {
        console.error('Message send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { room = 'general', recipientId } = data;
      
      const typingData = {
        userId: user._id,
        username: user.username
      };

      if (recipientId) {
        const recipientSocket = onlineUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('user:typing', typingData);
        }
      } else {
        socket.to(room).emit('user:typing', typingData);
      }
    });

    socket.on('typing:stop', (data) => {
      const { room = 'general', recipientId } = data;
      
      const typingData = {
        userId: user._id,
        username: user.username
      };

      if (recipientId) {
        const recipientSocket = onlineUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('user:stopped-typing', typingData);
        }
      } else {
        socket.to(room).emit('user:stopped-typing', typingData);
      }
    });

    // Handle joining a room
    socket.on('room:join', (room) => {
      socket.join(room);
      console.log(`${user.username} joined room: ${room}`);
    });

    // Handle leaving a room
    socket.on('room:leave', (room) => {
      socket.leave(room);
      console.log(`${user.username} left room: ${room}`);
    });

    // Handle private chat room
    socket.on('private:join', (recipientId) => {
      const privateRoom = [user._id.toString(), recipientId].sort().join('-');
      socket.join(privateRoom);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${user.username} (${socket.id})`);

      // Update user offline status
      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastSeen: Date.now()
      });

      // Remove from online users
      onlineUsers.delete(user._id.toString());

      // Broadcast updated online users list
      const onlineUsersList = await User.find({ isOnline: true }).select('username avatar _id');
      io.emit('users:online', onlineUsersList);

      // Notify others that user left
      socket.broadcast.emit('user:left', {
        userId: user._id,
        username: user.username
      });
    });
  });
};

module.exports = socketHandler;
