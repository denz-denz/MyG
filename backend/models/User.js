const mongoose = require('mongoose');
//blueprint for user
const UserSchema = new mongoose.Schema({
    username: { type: String, sparse: true, unique: true }, //optional
    email: {type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] },
    password: { type: String }, //optional if google-login
    googleId: {type: String}, //optional if manual-login
    resetPasswordToken: {type:String},
    resetPasswordExpiry: {type: Date}
  });
module.exports = mongoose.model('User', UserSchema);