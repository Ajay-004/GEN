// User model will be passed from server.js
let User; 

// Function to set the User model, called from server.js
const setUserModel = (model) => {
  User = model;
};

/**
 * Handles user registration.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!User) {
    console.error('User model not initialized in authController.');
    return res.status(500).json({ message: 'Server configuration error: User model not available.' });
  }

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    // Create a new user instance
    user = new User({
      username,
      email,
      password // Password will be hashed by the pre-save hook in the User model
    });

    await user.save(); // Save the new user to the database

    // Respond with success. In a real app, you might generate a JWT here.
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully!',
      userId: user._id // Returning userId for frontend to use (simplified for this context)
    });

  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * Handles user login.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!User) {
    console.error('User model not initialized in authController.');
    return res.status(500).json({ message: 'Server configuration error: User model not available.' });
  }

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Login successful. In a real app, you would generate and send a JWT.
    res.status(200).json({ 
      success: true, 
      message: 'Logged in successfully!',
      userId: user._id // Returning userId for frontend to use (simplified for this context)
    });

  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  setUserModel // Export the setter function
};
