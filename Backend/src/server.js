const app = require("./app");
const { Server } = require("socket.io");
const http = require("http");
const { initializeWebSocket } = require("./controllers/websocket.controller");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // In production, specify your frontend URL
    methods: ["GET", "POST"],
  },
});

// Initialize WebSocket handlers
initializeWebSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

// Keep the process alive
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
