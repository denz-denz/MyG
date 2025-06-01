const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true }
  });
const ChatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //links to User in User.js
        required: true},  
    messages: [MessageSchema]
});
module.exports = mongoose.model('ChatHistory', ChatHistorySchema);