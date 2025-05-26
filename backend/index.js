console.log('this is the right file');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
dotenv.config(); // Load environment variables
const authRoutes = require('./routes/authRoutes');
app.use(express.json());
app.use('/auth', authRoutes);
// 🔌 Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start your server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
console.log("Using Google Client ID:", process.env.GOOGLE_CLIENT_ID);


