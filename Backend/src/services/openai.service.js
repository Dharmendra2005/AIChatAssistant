// Mock mode - set to false when you have valid OpenAI API credits
const USE_MOCK = false;

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAIResponse(messages) {
  // Use mock response for testing without OpenAI API
  if (USE_MOCK) {
    const userMessage = messages[messages.length - 1]?.content || "";
    return `This is a mock AI response. You said: "${userMessage}". To enable real AI responses, set USE_MOCK to false in openai.service.js and add OpenAI credits.`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  return response.choices[0].message.content;
}

module.exports = { getAIResponse };
