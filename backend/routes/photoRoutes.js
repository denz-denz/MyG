const express = require('express');
const multer = require('multer');
const detectLabels = require('../utils/vision');
const { OpenAI } = require('openai');
const router = express.Router();
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
const upload = multer({ storage: multer.memoryStorage() });

router.post('/photo-macros', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const base64 = req.file.buffer.toString('base64');

  try {
    const labels = await detectLabels(base64);
    const foodItem = labels[0] || 'unknown food';

    const gptPrompt = `
Estimate the macros for this given portion of ${foodItem} which is eaten in Singapore. Return only JSON like: {"dish":"...", "calories":123, "protein":10, "carbs":15, "fat":5. Ensure that calories is correct and it is calculated by multiplying carbs and protein in grams by 4 and fat in grams by 9 and summing them up.}
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Respond only in JSON. No extra text." },
        { role: "user", content: gptPrompt }
      ],
      temperature: 0.3
    });

    const macros = JSON.parse(aiResponse.choices[0].message.content);
    res.json({ foodItem, macros });

  } catch (err) {
    console.error("photo-macros error:", err.message);
    res.status(500).json({ error: "Unable to analyze image", detail: err.message });
  }
});

module.exports = router;