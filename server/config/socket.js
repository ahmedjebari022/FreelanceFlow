const socketIO = require("socket.io");
const Order = require("../models/Order");

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Add these settings for better connection management
    pingTimeout: 60000,
    pingInterval: 25000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  io.on("connection", (socket) => {
    //console.log("User connected:", socket.id);

    // Join order chat room
    socket.on("join-order", (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`User joined order-${orderId}`);
    });

    // Leave order chat room
    socket.on("leave-order", (orderId) => {
      socket.leave(`order-${orderId}`);
      //console.log(`User left order-${orderId}`);
    });

    // User subscription to notifications
    socket.on("subscribe-user", (userId) => {
      socket.join(`user-${userId}`);
      //console.log(`User subscribed to notifications: user-${userId}`);
    });

    socket.on("disconnect", () => {
      //console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
