const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

// We will export a function that takes the connection instance
module.exports = (authConnection) => {
  const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true, // Ensure usernames are unique
      trim: true    // Remove whitespace from both ends
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure emails are unique
      trim: true,
      lowercase: true, // Store emails in lowercase
      match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6 // Minimum password length
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  // Pre-save hook to hash the password before saving a new user or updating password
  UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) { // Only hash if the password has been modified (or is new)
      const salt = await bcrypt.genSalt(10); // Generate a salt
      this.password = await bcrypt.hash(this.password, salt); // Hash the password
    }
    next(); // Continue to save the user
  });

  // Method to compare entered password with hashed password in the database
  UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Create the model using the provided connection instance
  return authConnection.model('User', UserSchema);
};
