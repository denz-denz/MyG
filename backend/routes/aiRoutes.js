const express = require('express');
const { OpenAI } = require('openai');
const ChatHistory = require('../models/ChatHistory');
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Use .env 

router.post('/ai-coach', async (req,res)=>{
    const {userId, question} = req.body;
    if (!question){
        return res.status(400).json({message: "no question provided!"});
    }
    if (!userId) {
        return res.status(400).json({messages: "no userId"});
    }
    try{ 
        let chatHist = await ChatHistory.findOne({userId});
        if (!chatHist) {
            chatHist = new ChatHistory({userId, messages:[]}); //first question
        }
        const systemPrompt = `You are a helpful science-based fitness assistant looking to maximise hypertrophy. As a science-based lifter, you are looking to maximise muscle growth through mechanical tension and minimise central nervous system fatigue, and suggest exercises that are stable as well as easy to progressive overload. For example, exercises like the squat, bench and deadlift would be considered suboptimal unless the user really wants to do it or is a powerlifter as those exercises are very taxing on the central nervous sytem, and are not as stable as compared to using the smith or cables. Also, try to match muscular leverages and resistance profiles to suggest good exercises that best fits the resistance profile of the target muscle. Try to give good ordering of exercises too, so if the user aims to grow his shoulders, recommend doing shoulder exercises as his first exercise. Advise based on this chat history: ${chatHist.messages.map(m=>`${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;
        const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
        ],
        temperature: 0.7 //creativity scale
    });
        chatHist.messages.push({role:'user', content:question});
        res.json({response: aiResponse.choices[0].message.content});
    }
    catch (err) {
        console.error("error in ai-coach", err.message);
        res.status(500).json({message: "AI coach unable to serve you at this moment", error: err.message});
    }
});

router.post('/macros-calculator', async (req,res)=>{
    const {foodInput} = req.body;
    if (!foodInput){
        return res.status(400).json({message: "no question provided!"});
    }
    try{ 
        const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a fitness coach that is in charge of my macro calculation. Be as accurate as possible and fact check across different sites to ensure the macros you give me are completely accurate. Return the response in json format like this {\"calories\": number , \"protein\":number, \"carbs\":number,\"fat\":number} so that i can easily access each value from the frontend.Respond only in JSON. Do not include any explanation or text outside the JSON" },
            { role: "user", content: "what is the macros of " + foodInput }
        ],
        temperature: 0.7 //creativity scale
    });
        res.json({response: aiResponse.choices[0].message.content});
    }
    catch (err) {
        console.error("error in ai-coach", err.message);
        res.status(500).json({message: "AI coach unable to serve you at this moment", error: err.message});
    }

});
module.exports = router;
   