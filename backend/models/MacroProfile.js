const mongoose = require('mongoose');
const MacroProfileSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //links to User in User.js
        required: true},  
    weight: {type: Number, required: true},
    height: {type: Number, required: true},
    age: {type: Number, required: true},
    gender: {type: String, enum: ['male','female'], required: true},
    activityLevel: {type: String, enum: ['sedentary','moderate','active'], required:true},
    goal: {type: String, enum: ['lose', 'maintain', 'gain'], required:true},
    calories: {type: Number},
    protein: {type:Number},
    carb: {type:Number},
    fat: {type:Number}
});
module.exports = mongoose.model('MacroProfile', MacroProfileSchema);