// src/sockets/kitchen.js
const jwt = require('jsonwebtoken');

const kitchenRooms = new Map(); // roomId -> { users, currentStep, recipe, messages }

const setupKitchenSocket = (io) => {
  const kitchenNs = io.of('/kitchen');

  // Authenticate socket connections via JWT
  kitchenNs.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  kitchenNs.on('connection', (socket) => {
    console.log(`👨‍🍳 User ${socket.userId} connected to kitchen`);

    // Join a cooking room
    socket.on('join_room', ({ roomId, username, recipe }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;

      if (!kitchenRooms.has(roomId)) {
        kitchenRooms.set(roomId, { users: [], currentStep: 0, recipe, messages: [] });
      }

      const room = kitchenRooms.get(roomId);
      if (!room.users.find((u) => u.id === socket.userId)) {
        room.users.push({ id: socket.userId, username });
      }

      kitchenNs.to(roomId).emit('user_joined', {
        username,
        users: room.users,
        currentStep: room.currentStep,
        recipe: room.recipe,
      });
    });

    // Advance cooking step
    socket.on('next_step', () => {
      const room = kitchenRooms.get(socket.roomId);
      if (!room) return;
      const totalSteps = room.recipe?.instructions?.length || 0;
      if (room.currentStep < totalSteps - 1) {
        room.currentStep++;
        kitchenNs.to(socket.roomId).emit('step_changed', {
          currentStep: room.currentStep,
          movedBy: socket.username,
        });
      }
    });

    // Go back a step
    socket.on('prev_step', () => {
      const room = kitchenRooms.get(socket.roomId);
      if (!room || room.currentStep === 0) return;
      room.currentStep--;
      kitchenNs.to(socket.roomId).emit('step_changed', {
        currentStep: room.currentStep,
        movedBy: socket.username,
      });
    });

    // Chat message in the kitchen
    socket.on('chat_message', ({ message }) => {
      const room = kitchenRooms.get(socket.roomId);
      if (!room || !message?.trim()) return;
      const msg = {
        id: Date.now(),
        username: socket.username,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };
      room.messages.push(msg);
      kitchenNs.to(socket.roomId).emit('new_message', msg);
    });

    // Sync a timer for everyone
    socket.on('start_timer', ({ duration, label }) => {
      kitchenNs.to(socket.roomId).emit('timer_started', {
        duration,
        label,
        startedBy: socket.username,
        startedAt: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      const room = kitchenRooms.get(socket.roomId);
      if (room) {
        room.users = room.users.filter((u) => u.id !== socket.userId);
        kitchenNs.to(socket.roomId).emit('user_left', {
          username: socket.username,
          users: room.users,
        });
        // Clean up empty rooms
        if (room.users.length === 0) {
          kitchenRooms.delete(socket.roomId);
        }
      }
      console.log(`👋 User ${socket.userId} left the kitchen`);
    });
  });
};

module.exports = { setupKitchenSocket };
