# 🤖 AI Chat Assistant with WebSocket & Google Integration

A real-time AI chat application built with **WebSocket** technology, featuring Google Gemini AI and Google Custom Search integration.

## ✨ Features

- 🔌 **Real-time WebSocket Communication** - Instant, bidirectional messaging
- 🌊 **Streaming AI Responses** - See responses appear word-by-word in real-time
- 🔍 **Google Search Integration** - Optional web search to enhance AI responses
- 🤖 **Google Gemini AI** - Powered by Google's advanced AI model
- 💾 **Session Management** - Persistent chat history stored in PostgreSQL
- 🎨 **Modern UI** - Beautiful, responsive interface with animations
- 🟢 **Connection Status** - Visual indicator for WebSocket connection state

## 🏗️ Architecture

```
User → WebSocket → Backend (Socket.io) → Google Gemini AI
                                        → Google Search API
                      ↓
                 PostgreSQL (Prisma)
```

## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))
- Google Custom Search Engine ID (Optional, for web search)

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Edit `Backend/.env` and add:

```env
PORT=5000
DATABASE_URL="your_postgresql_connection_string"

# Google Gemini API Key (Required)
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_api_key_here

# Google Custom Search Engine ID (Optional - for web search)
# Get from: https://programmablesearchengine.google.com/
GOOGLE_SEARCH_ENGINE_ID=36b747c4e11964d25
```

### 3. Set Up Database

```bash
cd Backend
npx prisma generate
npx prisma db push
```

### 4. Frontend Setup

```bash
cd Frontend
npm install
```

### 5. Start the Application

**Backend (Terminal 1):**
```bash
cd Backend
npm start
```

**Frontend (Terminal 2):**
```bash
cd Frontend
npm run dev
```

Open your browser at `http://localhost:5173`

## 🎯 How to Use

1. **Start Chatting**: Type a message and press Send
2. **Enable Google Search**: Toggle "🔍 Use Google Search" to get real-time web results
3. **Watch Streaming**: AI responses appear in real-time as they're generated
4. **New Conversation**: Click "+ New Chat" to start fresh
5. **Connection Status**: Green dot = Connected, Red dot = Disconnected

## 🔌 WebSocket Events

### Client → Server
- `start-chat` - Create new chat session
- `send-message` - Send message with optional search
- `typing` - Send typing indicator

### Server → Client
- `ai-response-chunk` - Streaming response chunks
- `ai-response-complete` - Response finished
- `message-received` - Message acknowledged
- `error` - Error notification

## 🧩 Project Structure

```
AIChatAssistant/
├── Backend/
│   ├── src/
│   │   ├── app.js                    # Express app
│   │   ├── server.js                 # WebSocket server
│   │   ├── controllers/
│   │   │   ├── chat.controller.js    # HTTP endpoints
│   │   │   └── websocket.controller.js # WebSocket handlers
│   │   └── services/
│   │       ├── google.service.js     # Google AI & Search
│   │       ├── chat.service.js       # Chat logic
│   │       └── openai.service.js     # OpenAI (legacy)
│   └── .env                          # Configuration
│
└── Frontend/
    ├── src/
    │   ├── App.jsx                   # Main component
    │   ├── hooks/
    │   │   └── useSocket.js          # WebSocket hook
    │   └── App.css                   # Styles
    └── vite.config.js
```

## 🔧 API Configuration

### Get Google Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste into `.env` file

### Create Custom Search Engine (Optional)

1. Go to: https://programmablesearchengine.google.com/
2. Click "Add" to create a new search engine
3. Set "Search the entire web" option
4. Get your Search Engine ID (cx parameter)
5. Add to `.env` file

## 🌟 Key Technologies

- **Backend**: Node.js, Express, Socket.io, Prisma
- **Frontend**: React, Socket.io-client, Vite
- **Database**: PostgreSQL
- **AI**: Google Gemini API
- **Search**: Google Custom Search API

## 🐛 Troubleshooting

### WebSocket Connection Failed
- Check if backend is running on port 5000
- Verify firewall settings
- Check browser console for errors

### AI Responses Not Working
- Verify `GOOGLE_API_KEY` is set correctly in `.env`
- Check API quota at Google Cloud Console
- Ensure database is connected

### Search Not Working
- Add `GOOGLE_SEARCH_ENGINE_ID` to `.env`
- Toggle "Use Google Search" checkbox in UI
- Check API key has Custom Search API enabled

## 📝 Example Usage

**Simple Chat:**
```
User: "What is machine learning?"
AI: [Streams response in real-time]
```

**With Google Search:**
```
User: "Latest news about AI in 2026" [With search enabled]
AI: [Shows Google search results + AI analysis]
```

## 🔐 Security Notes

- Never commit `.env` file with real API keys
- Use environment variables in production
- Enable CORS only for trusted origins
- Implement rate limiting for production use

## 📈 Future Enhancements

- [ ] User authentication
- [ ] Multiple chat sessions
- [ ] File upload support
- [ ] Voice input/output
- [ ] Chat export functionality
- [ ] Admin dashboard

## 🤝 Contributing

Feel free to fork and submit pull requests!

## 📄 License

MIT License - feel free to use for your projects!

---

**Made with ❤️ using WebSockets, React, and Google AI**
