const { ChatTogetherAI } = require("@langchain/community/chat_models/togetherai");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");
require("dotenv").config();

const generateTextWithTogether = async (messages, language = 'en', memoryLimit = 6) => {
  const apiKey = process.env.TOGETHER_API_KEY;

  if (!apiKey) {
    throw new Error("TogetherAI API key not found. Please set TOGETHER_API_KEY in your .env file.");
  }

  const model = new ChatTogetherAI({
    togetherAIApiKey: apiKey,
    modelName: "meta-llama/Llama-3.3-70B-Instruct-Turbo", // ✅ Free & fast
    temperature: 0.7,
    maxTokens: 512,
  });

  // ✅ Clean prompt with no missing variable
  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage("You are ChefGPT, a helpful nutrition assistant. Reply in English."),
    new MessagesPlaceholder("history"),
    new HumanMessage("{input}"),
  ]);

  // ✅ Limit to last N messages (excluding current one)
  const historyMessages = messages
    .slice(-(memoryLimit + 1)) // last N+1 messages
    .slice(0, -1)              // exclude current input
    .map(msg =>
      msg.sender === 'user'
        ? new HumanMessage(msg.text)
        : new AIMessage(msg.text)
    );

  const currentMessage = messages[messages.length - 1];

  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    history: historyMessages,
    input: currentMessage.text, // ✅ fixes {input} error
  });

  return response.content;
};

module.exports = { generateTextWithTogether };
