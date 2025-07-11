const express = require('express');
const multer = require('multer');
const {
  handleChatMessage,
  getConversationHistory,
  getRecentChats,
  deleteConversation,
  exportChatAsJsonDownload,
} = require('../controllers/chatControllers');

const router = express.Router();

// ✅ Use memory storage to keep uploaded file in RAM for immediate Gemini use
const upload = multer({ storage: multer.memoryStorage() });

// ==============================
// Chat Message (Text + Image)
// ==============================
router.post('/message', upload.single('file'), handleChatMessage);

// ==============================
// Get Chat History by chatId
// ==============================
router.get('/history/:userId/:chatId', getConversationHistory);

// ==============================
// List Recent Chats for User
// ==============================
router.get('/recent-chats/:userId', getRecentChats);

// ==============================
// Delete a Conversation
// ==============================
router.delete('/:userId/:chatId', deleteConversation);

// ==============================
// Export Chat as JSON Download
// ==============================
router.get('/export-chat/:userId/:chatId', exportChatAsJsonDownload);

module.exports = router;
