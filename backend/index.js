console.log("this is the right file lol!!!");
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const photoRoutes = require('./routes/photoRoutes');
app.use(cors());
dotenv.config(); // Load environment variables
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const aiRoutes = require('./routes/aiRoutes');


app.use('/auth', authRoutes);
app.use('/workout', workoutRoutes);
app.use('/ai', aiRoutes);
app.use('/smartscan', photoRoutes);


app.get('/', (req, res) => {
  console.log(`[Ping] ${req.method} ${req.url}`);
  res.send('✅ Backend is running!');
});
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

//connect to mongodb if not in testing mode
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
  }
module.exports = app;

