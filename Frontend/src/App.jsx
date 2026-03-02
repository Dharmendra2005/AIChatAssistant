import { useState, useRef, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const messagesEndRef = useRef(null);

  const { isConnected, sessionId, startChat, sendMessage } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Auto-start chat session on mount
  useEffect(() => {
    if (isConnected && !sessionId) {
      startChat().catch((error) => {
        console.error("Error starting chat:", error);
      });
    }
  }, [isConnected, sessionId]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected || !sessionId) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to UI
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setStreamingMessage("");

    try {
      sendMessage(
        userMessage,
        useGoogleSearch,
        // onChunk - receive streaming response
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        },
        // onComplete - response finished
        (fullResponse) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullResponse },
          ]);
          setStreamingMessage("");
          setLoading(false);
        },
        // onError - handle errors
        (error) => {
          console.error("Error sending message:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, something went wrong. Please try again.",
            },
          ]);
          setStreamingMessage("");
          setLoading(false);
        },
      );
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // Start new conversation
  const newChat = async () => {
    setMessages([]);
    setStreamingMessage("");
    try {
      await startChat();
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Chat Assistant</h1>
        <div className="header-controls">
          <label className="search-toggle">
            <input
              type="checkbox"
              checked={useGoogleSearch}
              onChange={(e) => setUseGoogleSearch(e.target.checked)}
            />
            <span>🔍 Use Google Search</span>
          </label>
          <button onClick={newChat} className="new-chat-btn">
            + New Chat
          </button>
        </div>
        <div className="connection-status">
          {isConnected ? (
            <span className="status-connected">🟢 Connected</span>
          ) : (
            <span className="status-disconnected">🔴 Disconnected</span>
          )}
        </div>
      </header>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>Welcome to AI Chat Assistant!</h2>
              <p>Start a conversation by typing a message below.</p>
              <p className="search-hint">
                💡 Toggle "Use Google Search" to get real-time web results with
                AI responses!
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}

          {/* Show streaming message in real-time */}
          {streamingMessage && (
            <div className="message assistant streaming">
              <div className="message-avatar">🤖</div>
              <div className="message-content">{streamingMessage}</div>
            </div>
          )}

          {loading && !streamingMessage && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              useGoogleSearch
                ? "Ask anything, I'll search Google for you..."
                : "Type your message..."
            }
            disabled={loading || !isConnected}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !isConnected}
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
