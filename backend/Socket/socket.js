import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import UserBlock from '../Models/UserBlockSchema.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
});

const userSocketmap = {};

export const getReciverSocketId = (receverId) => {
  return userSocketmap[receverId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== 'undefined') {
    userSocketmap[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketmap));

  socket.on('setOnlineStatus', () => {
    io.emit('getOnlineUsers', Object.keys(userSocketmap));
  });

  socket.on('disconnect', () => {
    delete userSocketmap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketmap));
  });
});

export { app, io, server };
