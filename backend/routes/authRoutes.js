const express = require('express');
const bcrypt = require('bcryptjs'); //comparing password hash
const User = require('../models/User'); //goes to User.js file in models
const { OAuth2Client } = require('google-auth-library'); //for google login/signup
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();
//signup route
router.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;
    try {
        //check if email in use
        const existingUserEmail = await User.findOne({email});
        if (existingUserEmail) {
            return res.status(400).json({ message: "Email already in use" });
        }
        //check if username in use
        if (username) {
            const existingUserName = await User.findOne({username});
            if (existingUserName) {
                return res.status(400).json({ message: "username already in use" });
            }
        }
        //create hashed password
        const passwordHash = await bcrypt.hash(password, 10);
        //create new User
        const newUser = new User({username: username, email: email, password: passwordHash});
        //save to db
        await newUser.save();
        console.log("signup successful on backend")
        res.status(201).json({
            message: "Signup successful",
            userId: newUser._id,
            email: newUser.email,
            username: newUser.username
          });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
      }
        
    });
    
//manual login route
router.post('/manual-login' , async (req, res) => {
    console.log('login route hit');
    const { email, password } = req.body;
    try {
    // 1. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('incorrect password');
      return res.status(401).json({ message: "Incorrect password" });
    }

    // 3. Return success (you can add token logic later)
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      email: user.email
    });
    console.log('login done');

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//google login/signup route
/*router.post('/google-login', async (req,res)=> {
  console.log("📩 /auth/google-login was hit");
  const { idToken } = req.body;
  console.log("📨 Received Google ID Token:", idToken);
  try {
    // 1. Verify the token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;
    // 2. Check if user exists
    let user = await User.findOne({ email });

    // 3. If not, create a new user (Google signup)
    if (!user) {
      user = new User({
        username:name,
        email:email,
        googleId:googleId
      });
      await user.save();
    }

    // 4. Respond with user info or token (no password involved)
    res.status(200).json({
      message: "Google login successful",
      userId: user._id,
      email: user.email,
      username: user.username
    });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ message: "Google login failed" });
  }
});*/

const crypto = require('crypto'); // to generate random token

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No user with that email." });

    // generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour to expire

    // save to user
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    // for now, return link (in production, send email)
    const resetLink = `http://localhost:3000/auth/reset-password/${token}`;
    res.json({ message: "Password reset link generated", resetLink });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post('/reset-password/:token', async (req, res)=> {
  const {token} = req.params;
  console.log(token);
  const {newPassword} = req.body;
  try {
    const user = await User.findOne({resetPasswordToken:token,
      resetPasswordExpiry: {$gt: new Date()}
    });
    //console.log(user);
    console.log(user.resetPasswordToken);
    if (!user) {
      console.log("failing");
      return res.status(400).json({message: "Invalid or expired token"});
    }
    const passwordHash = await bcrypt.hash(newPassword,10);
    user.password = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    res.json({message: "Password reset successfully"});
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({message: "Server Error: ", error: err.message});
  }
});
module.exports = router;