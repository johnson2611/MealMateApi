const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupKitchenSocket } = require('./sockets/kitchen');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

setupKitchenSocket(io);

server.listen(PORT, () => {
  console.log(`
🍽️  MealMate API running!
🚀  Server:   http://localhost:${PORT}
📚  API Docs: http://localhost:${PORT}/api/docs
❤️   Health:   http://localhost:${PORT}/health
  `);
});

module.exports = server;
