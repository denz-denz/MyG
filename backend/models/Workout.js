const mongoose = require('mongoose');
console.log("Workout type:", typeof Workout)
const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sets: {
        type: Number,
        required: true
    },
    reps: [{
        type: Number,
        required: true
    }],
    weight: [{
        type: Number,
        required: true
    }]
});
const WorkoutSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //links to User in User.js
        required: true},  
    date: {
        type: Date,
        default: Date.now
    },
    startTime: {type: Date, default: Date.now},
    endTime: { type: Date},
    exercises: [exerciseSchema]
    });
module.exports = mongoose.model('Workout', WorkoutSchema);