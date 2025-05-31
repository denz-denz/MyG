console.log("this is the right file lol!!!")
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const cors = require("cors");
app.use(cors());
dotenv.config(); // Load environment variables
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/auth', authRoutes);
app.use('/workout', workoutRoutes);
app.use('/ai', aiRoutes);

//  Connect to MongoDB
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



