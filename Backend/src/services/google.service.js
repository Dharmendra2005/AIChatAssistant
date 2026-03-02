const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Search Google using Custom Search API
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Search results
 */
async function searchGoogle(query) {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query,
          num: 5, // Get top 5 results
        },
      },
    );

    return response.data.items || [];
  } catch (error) {
    console.error("Google Search API error:", error.message);
    return [];
  }
}

/**
 * Get AI response from Google Gemini with optional search integration
 * @param {Array} messages - Chat history
 * @param {boolean} useSearch - Whether to search Google first
 * @returns {Promise<string>} - AI response
 */
async function getGoogleAIResponse(messages, useSearch = false) {
  try {
    const userMessage = messages[messages.length - 1]?.content || "";

    let contextInfo = "";

    // If user wants search results, fetch from Google
    if (useSearch) {
      const searchResults = await searchGoogle(userMessage);

      if (searchResults.length > 0) {
        contextInfo = "\n\nHere's what I found on Google:\n";
        searchResults.forEach((result, index) => {
          contextInfo += `\n${index + 1}. ${result.title}\n${result.snippet}\nLink: ${result.link}\n`;
        });
      }
    }

    // Use Gemini AI to generate response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build conversation context
    const conversationHistory = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `${conversationHistory}${contextInfo}\n\nPlease provide a helpful and informative response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Google AI error:", error.message);

    // Fallback response
    return "I'm having trouble connecting to Google AI right now. Please make sure your GOOGLE_API_KEY is set correctly in the .env file.";
  }
}

/**
 * Stream AI response from Google Gemini
 * @param {Array} messages - Chat history
 * @param {Function} onChunk - Callback for each text chunk
 * @param {boolean} useSearch - Whether to search Google first
 */
async function streamGoogleAIResponse(messages, onChunk, useSearch = false) {
  try {
    const userMessage = messages[messages.length - 1]?.content || "";

    let contextInfo = "";

    // If user wants search results, fetch from Google
    if (useSearch) {
      const searchResults = await searchGoogle(userMessage);

      if (searchResults.length > 0) {
        contextInfo = "\n\n🔍 Google Search Results:\n";
        searchResults.forEach((result, index) => {
          contextInfo += `\n${index + 1}. **${result.title}**\n${result.snippet}\n🔗 ${result.link}\n`;
        });

        // Send search results first
        onChunk(contextInfo);
        onChunk("\n\n💬 AI Analysis:\n");
      }
    }

    // Use Gemini AI to generate response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Build conversation context
    const conversationHistory = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt =
      useSearch && contextInfo
        ? `Based on the search results and conversation history, provide a comprehensive answer.\n\n${conversationHistory}`
        : conversationHistory;

    const result = await model.generateContentStream(prompt);

    // Stream the response
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText);
    }
  } catch (error) {
    console.error("Google AI streaming error:", error.message);
    onChunk(
      "\n\n❌ Error: Unable to get AI response. Please check your Google API configuration.",
    );
  }
}

module.exports = {
  searchGoogle,
  getGoogleAIResponse,
  streamGoogleAIResponse,
};
