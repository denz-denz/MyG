const express = require('express');
const MacroProfile = require('../models/MacroProfile');
const router = express.Router();
function calculateMacros({weight,height,age,gender,activitylevel,goal}) {
    let calculatedCalories = 0;
    let calculatedProtein = 0;
    let calculatedCarb = 0;
    let calculatedFat = 0
    const bmr = gender === 'male'
                ? 10 * weight + 6.25 * height - 5 * age + 5
                : 10 * weight + 6.25 * height - 5 * age - 161;
    const activityMultiplier = {
        sedentary: 1.2,
        moderate: 1.5,
        active: 1.8
    };
    const maintanenceCalories = bmr * activityMultiplier[activityLevel];
    if (goal === 'maintain') {
        calculatedCalories = maintanenceCalories;
        calculatedProtein = (0.4 * calculatedCalories) / 4;
        calculatedCarb = (0.4 * calculatedCalories) / 4;
        calculatedFat = (0.2 * calculatedCalories) / 9;
    }
    else if (goal === 'lose') {
        calculatedCalories = maintananceCalories - 300;
        calculatedProtein = (0.45 * calculatedCalories) / 4;
        calculatedCarb = (0.35 * calculatedCalories) / 4;
        calculatedFat = (0.2 * calculatedCalories) / 9;
    }
    else {
        calculatedCalories = maintanenceCalories + 300;
        calculatedProtein = (0.3 * calculatedCalories) / 4;
        calculatedCarb = (0.4 * calculatedCalories) / 4;
        calculatedFat = (0.3 * calculatedCalories) / 9;
    }
    return {
        calories: Math.round(calculatedCalories),
        protein: Math.round(calculatedProtein),
        carb: Math.round(calculatedCarb),
        fat: Math.round(calculatedFat)
    };
}

//generate MacroProfile of user
router.post('/generate-profile', async (req,res) => {
    const {userId, weight, height, age, gender, activityLevel, goal} = req.body;
    if (!userId) {
        return res.status(400).json({ message: "Invalid UserId" });
    }
    else if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        return res.status(400).json({ message: "Missing input fields" });
    }
    try {
        const macros = calculateMacros({weight,height,age,gender,activitylevel,goal});
        const profile = new MacroProfile(userId,weight,height,age,gender,activityLevel,goal,macros, macros.calories, macros.protein, macros.carb, macros.fat);
        await profile.save();
        res.status(201).json({
            message: "Macro Profile created",
            profile
        });
    }
    catch (err) {
        console.error("error creating macro profile", err.message);
        res.status(500).json({
            message: "Failed to crated macro profile",
            error: err.message
        });
    }       
});


