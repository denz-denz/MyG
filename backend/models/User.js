const mongoose = require('mongoose');
//blueprint for user
const UserSchema = new mongoose.Schema({
    username: { type: String, sparse: true, unique: true }, //optional
    email: {type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] },
    password: { type: String, required: true },
    googleId: {type: String}
  });
module.exports = mongoose.model('User', UserSchema);