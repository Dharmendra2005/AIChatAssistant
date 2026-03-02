import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Change this to your backend URL

/**
 * Custom hook for managing WebSocket connection
 */
export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Start a new chat session
   */
  const startChat = () => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error("Socket not initialized"));
        return;
      }

      socketRef.current.emit("start-chat", (response) => {
        if (response.success) {
          setSessionId(response.sessionId);
          resolve(response.sessionId);
        } else {
          reject(new Error(response.error || "Failed to start chat"));
        }
      });
    });
  };

  /**
   * Send a message and listen for streaming response
   * @param {string} message - User message
   * @param {boolean} useSearch - Whether to use Google search
   * @param {Function} onChunk - Callback for each response chunk
   * @param {Function} onComplete - Callback when response is complete
   * @param {Function} onError - Callback for errors
   */
  const sendMessage = (message, useSearch, onChunk, onComplete, onError) => {
    if (!socketRef.current || !sessionId) {
      onError?.(new Error("Not connected or no active session"));
      return;
    }

    const socket = socketRef.current;

    // Set up listeners for this message
    const handleChunk = (data) => {
      onChunk?.(data.chunk);
    };

    const handleComplete = (data) => {
      onComplete?.(data.fullResponse);
      // Clean up listeners
      socket.off("ai-response-chunk", handleChunk);
      socket.off("ai-response-complete", handleComplete);
      socket.off("error", handleError);
    };

    const handleError = (data) => {
      onError?.(new Error(data.message));
      // Clean up listeners
      socket.off("ai-response-chunk", handleChunk);
      socket.off("ai-response-complete", handleComplete);
      socket.off("error", handleError);
    };

    const handleReceived = (data) => {
      // Optional: handle message received acknowledgment
      console.log("Message received by server:", data.message);
    };

    // Register listeners
    socket.on("ai-response-chunk", handleChunk);
    socket.on("ai-response-complete", handleComplete);
    socket.on("error", handleError);
    socket.on("message-received", handleReceived);

    // Send the message
    socket.emit("send-message", {
      sessionId,
      message,
      useSearch,
    });
  };

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = (isTyping) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit("typing", { sessionId, isTyping });
    }
  };

  return {
    isConnected,
    sessionId,
    startChat,
    sendMessage,
    sendTypingIndicator,
    socket: socketRef.current,
  };
}
