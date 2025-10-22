import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import UserBlock from '../Models/UserBlockSchema.js'; // Import the UserBlock model
import Conversation from '../Models/conversationModel.js';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

const userSocketmap = {}; // {userId: socketId}

export const getReciverSocketId = (receverId) => {
  return userSocketmap[receverId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  // Store user socket in the map
  if (userId !== 'undefined') userSocketmap[userId] = socket.id;


  socket.on('setOnlineStatus', async () => {
    try {
      const blockedUsers = await UserBlock.find({
        $or: [{ blocker: userId }, { blocked: userId }],
      });

      const blockedUserIds = blockedUsers.map((block) =>
        block.blocker.toString() === userId ? block.blocked.toString() : block.blocker.toString()
      );

      // Notify only users who are not blocked or who haven't blocked the current user
      const visibleUsers = Object.keys(userSocketmap).filter(
        (onlineUserId) => !blockedUserIds.includes(onlineUserId)
      );
      
      io.emit('getOnlineUsers', visibleUsers);
    } catch (error) {
      console.error('Error setting online status:', error);
    }
  });

  // Automatically call setOnlineStatus when a user connects
  // socket.emit('setOnlineStatus');


  io.emit('getOnlineUsers', Object.keys(userSocketmap));

  // Listen for the message send event
  socket.on('sendMessage', async ({ conversationId, senderId, receiverId, message }) => {
    try {
      // Check if either user has blocked the other
      const isBlockedBySender = await UserBlock.findOne({ blocker: senderId, blocked: receiverId });
      const isBlockedByReceiver = await UserBlock.findOne({ blocker: receiverId, blocked: senderId });

      if (isBlockedBySender || isBlockedByReceiver) {
        console.log(`User ${senderId} is blocked by ${receiverId} or vice versa. Cannot send message.`);
        socket.emit('blockError', 'You are blocked and cannot send messages.');
        return;
      }

      // Fetch the conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        console.log('Conversation not found.');
        return;
      }

      // Proceed to send the message if not blocked
      const receiverSocketId = getReciverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', { conversationId, senderId, message });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    delete userSocketmap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketmap));
  });
});

export { app, io, server };
