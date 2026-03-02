const prisma = require("../db/prisma");
const { streamGoogleAIResponse } = require("../services/google.service");

/**
 * Initialize WebSocket handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function initializeWebSocket(io) {
  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle new chat session creation
    socket.on("start-chat", async (callback) => {
      try {
        const session = await prisma.chatSession.create({});
        console.log(`📝 New chat session created: ${session.id}`);

        if (callback) {
          callback({ success: true, sessionId: session.id });
        }
      } catch (error) {
        console.error("Error starting chat:", error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    // Handle incoming chat messages
    socket.on("send-message", async (data) => {
      try {
        const { sessionId, message, useSearch = false } = data;

        if (!sessionId || !message) {
          socket.emit("error", {
            message: "Session ID and message are required",
          });
          return;
        }

        console.log(
          `💬 Message received from ${socket.id}: "${message.substring(0, 50)}..."`,
        );

        // Save user message to database
        await prisma.message.create({
          data: {
            role: "user",
            content: message,
            sessionId,
          },
        });

        // Emit acknowledgment
        socket.emit("message-received", {
          message: "Processing your request...",
        });

        // Fetch conversation history
        const messages = await prisma.message.findMany({
          where: { sessionId },
          orderBy: { createdAt: "asc" },
        });

        // Format messages for AI
        const formattedMessages = [
          {
            role: "system",
            content:
              "You are a helpful AI assistant with access to Google search.",
          },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ];

        let fullResponse = "";

        // Stream AI response back to client
        await streamGoogleAIResponse(
          formattedMessages,
          (chunk) => {
            fullResponse += chunk;
            socket.emit("ai-response-chunk", { chunk });
          },
          useSearch,
        );

        // Save AI response to database
        await prisma.message.create({
          data: {
            role: "assistant",
            content: fullResponse,
            sessionId,
          },
        });

        // Signal completion
        socket.emit("ai-response-complete", { fullResponse });
        console.log(`✅ Response sent to ${socket.id}`);
      } catch (error) {
        console.error("Error processing message:", error);
        socket.emit("error", { message: error.message });
      }
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      socket.broadcast.emit("user-typing", { userId: socket.id, ...data });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initializeWebSocket };
