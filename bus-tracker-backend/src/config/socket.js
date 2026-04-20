let io = null;

// Called once in server.js to attach Socket.IO to the HTTP server
const initSocket = (httpServer) => {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : '*',
      methods: ['GET', 'POST'],
    },
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

// Call this anywhere in the app to get the io instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized — call initSocket(server) first');
  }
  return io;
};

module.exports = { initSocket, getIO };