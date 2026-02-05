const chatService = require("../services/chat.service");

exports.startChat = async (req, res) => {
  try {
    const session = await chatService.startChat();
    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    const reply = await chatService.sendMessage(sessionId, message);

    res.json({ reply });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
};
