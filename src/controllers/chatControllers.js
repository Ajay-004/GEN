let Conversation;
const { generateTextWithTogether } = require('../api/together'); // ✅ Together AI logic
require("dotenv").config();

const setConversationModel = (model) => {
  Conversation = model;
};

const handleChatMessage = async (req, res) => {
  const { userId, message, language = 'en', chatId } = req.body;
  const uploadedFile = req.file;

  if (!userId || (!message && !uploadedFile)) {
    return res.status(400).json({ error: 'User ID and message or file required.' });
  }

  try {
    const chatName = `Chat ${new Date().toLocaleString()}`;
    let conversation;

    // Create new chat or load existing one
    if (!chatId || chatId.startsWith('new_chat_')) {
      conversation = new Conversation({ userId, name: chatName, messages: [] });
    } else {
      conversation = await Conversation.findById(chatId);
      if (!conversation) {
        conversation = new Conversation({ userId, name: chatName, messages: [] });
      }
    }

    // Create user message object
    const userMsg = {
      sender: 'user',
      text: message || `Uploaded a file (${uploadedFile?.originalname})`,
      ...(uploadedFile && {
        fileData: uploadedFile.buffer.toString('base64'),
        fileMimeType: uploadedFile.mimetype
      }),
    };

    // Save user's message to MongoDB
    conversation.messages.push(userMsg);
    conversation.updatedAt = new Date();
    await conversation.save();

    // ✅ Generate AI reply using Together.ai with memory (last 6 messages)
    const aiReply = await generateTextWithTogether(conversation.messages, language, 6); // You can change 6 to any number

    // Save AI reply to MongoDB
    const aiMsg = { sender: 'chefGPT', text: aiReply };
    conversation.messages.push(aiMsg);
    conversation.updatedAt = new Date();
    await conversation.save();

    // Respond to frontend
    res.json({
      success: true,
      chatId: conversation._id.toString(),
      chatName: conversation.name,
      userMessage: userMsg,
      chefGPTMessage: aiMsg
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Server error during chat.' });
  }
};

const getConversationHistory = async (req, res) => {
  const { userId, chatId } = req.params;
  if (!userId || !chatId) return res.status(400).json({ error: 'Missing userId or chatId' });

  try {
    const convo = await Conversation.findById(chatId);
    if (!convo || convo.userId !== userId) return res.json({ messages: [] });
    res.json({ messages: convo.messages });
  } catch {
    res.status(500).json({ error: 'Error fetching history' });
  }
};

const getRecentChats = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const chats = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('_id name updatedAt');

    res.json({ chats: chats.map(c => ({
      id: c._id.toString(),
      name: c.name,
      updatedAt: c.updatedAt
    })) });
  } catch {
    res.status(500).json({ error: 'Error fetching chats' });
  }
};

const deleteConversation = async (req, res) => {
  const { userId, chatId } = req.params;
  try {
    const result = await Conversation.findOneAndDelete({ userId, _id: chatId });
    if (!result) return res.status(404).json({ message: 'Chat not found' });
    res.json({ success: true, message: 'Chat deleted' });
  } catch {
    res.status(500).json({ error: 'Error deleting chat' });
  }
};

const exportChatAsJsonDownload = async (req, res) => {
  const { userId, chatId } = req.params;
  try {
    const chat = await Conversation.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const data = {
      name: chat.name,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map(({ _id, ...msg }) => msg)
    };

    const filename = `${data.name.replace(/[^a-z0-9]/gi, '_')}_${new Date(data.createdAt).toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch {
    res.status(500).json({ error: 'Error exporting chat' });
  }
};

module.exports = {
  handleChatMessage,
  getConversationHistory,
  getRecentChats,
  deleteConversation,
  exportChatAsJsonDownload,
  setConversationModel,
};
