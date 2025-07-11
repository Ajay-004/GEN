const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'chefGPT'],
  },
  text: {
    type: String,
    default: '',
  },
  fileData: {
    type: String, // base64 string (optional)
  },
  fileMimeType: {
    type: String, // image/png, etc. (optional)
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false }); // Don't generate separate _id for embedded messages

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: 'Untitled Chat',
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

// Export a model factory function
module.exports = (chatConnection) => {
  return chatConnection.model('Conversation', conversationSchema);
};
