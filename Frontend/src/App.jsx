import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start a new chat session
  const startChat = async () => {
    try {
      const response = await axios.post("/api/chat/start");
      setSessionId(response.data.sessionId);
      setMessages([]);
      return response.data.sessionId;
    } catch (error) {
      console.error("Error starting chat:", error);
      throw error;
    }
  };

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to UI
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Start session if not exists
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await startChat();
      }

      // Send message to backend
      const response = await axios.post(
        `/api/chat/${currentSessionId}/message`,
        {
          message: userMessage,
        },
      );

      // Add AI response to UI
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Start new conversation
  const newChat = () => {
    setSessionId(null);
    setMessages([]);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Chat Assistant</h1>
        <button onClick={newChat} className="new-chat-btn">
          + New Chat
        </button>
      </header>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>Welcome to AI Chat Assistant!</h2>
              <p>Start a conversation by typing a message below.</p>
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

          {loading && (
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

        <form onSubmit={sendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
