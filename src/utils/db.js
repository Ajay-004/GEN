const mongoose = require('mongoose');

/**
 * Establishes and returns a Mongoose connection to a specified MongoDB URI.
 * @param {string} uri - The MongoDB connection URI.
 * @param {string} connectionName - A logical name for this connection (e.g., 'chatDB', 'authDB').
 * @returns {Promise<mongoose.Connection>} - A promise that resolves to the Mongoose Connection object.
 */
const connectDB = async (uri, connectionName) => {
  try {
    const conn = await mongoose.createConnection(uri, {
      // Options below are deprecated in Mongoose 6.x+, but harmless if present
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log(`MongoDB '${connectionName}' connected successfully!`);
    return conn; // Return the specific connection instance
  } catch (err) {
    console.error(`MongoDB '${connectionName}' connection error:`, err.message);
    process.exit(1); // Exit process if a critical database connection fails
  }
};

module.exports = connectDB;
