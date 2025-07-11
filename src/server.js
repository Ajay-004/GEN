// server.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db'); // DB connection utility

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');

// Import model factories
const createUserModel = require('./models/user');
const createConversationModel = require('./models/conversation');

// Import controller setter functions
const { setUserModel } = require('./controllers/authController');
const { setConversationModel } = require('./controllers/chatControllers');

const app = express();
const PORT = process.env.PORT || 5000;

let authDbConnection;
let chatDbConnection;

/**
 * Initialize and connect to databases,
 * then assign models to controllers
 */
const initializeDatabases = async () => {
  try {
    // Connect to each MongoDB
    authDbConnection = await connectDB(process.env.AUTH_MONGODB_URI, 'Auth Database');
    chatDbConnection = await connectDB(process.env.MONGODB_URI, 'Chat Database');

    // Initialize models with their respective connections
    const User = createUserModel(authDbConnection);
    const Conversation = createConversationModel(chatDbConnection);

    // Inject models into controllers
    setUserModel(User);
    setConversationModel(Conversation);

    console.log('[✔] All databases connected and models initialized.');
  } catch (error) {
    console.error('[❌] Failed to connect to MongoDB:', error);
    process.exit(1); // Exit if database connection fails
  }
};

// Call database initialization before routes are used
initializeDatabases();

// Global middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Server] Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('🌐 PicoBot Backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening at http://localhost:${PORT}`);
});
