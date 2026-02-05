const prisma = require("../db/prisma");
const { getAIResponse } = require("./openai.service");

async function startChat() {
  return prisma.chatSession.create({});
}

async function sendMessage(sessionId, userMessage) {
  // Save user message
  await prisma.message.create({
    data: {
      role: "user",
      content: userMessage,
      sessionId
    }
  });

  // Fetch full conversation
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" }
  });

  // Format for OpenAI
  const formattedMessages = [
    { role: "system", content: "You are a helpful AI assistant." },
    ...messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  // Get AI reply
  const aiReply = await getAIResponse(formattedMessages);

  // Save AI message
  await prisma.message.create({
    data: {
      role: "assistant",
      content: aiReply,
      sessionId
    }
  });

  return aiReply;
}

module.exports = { startChat, sendMessage };
