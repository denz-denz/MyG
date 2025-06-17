const mongoose = require('mongoose');
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
    weights: [{
        type: Number,
        required: true
    }],
    exerciseVolume: {type: Number, default: 0}
});
const WorkoutSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //links to User in User.js
        required: true},  
    date: {
        type: Date,
        default: new Date()
    },
    exercises: [exerciseSchema],
    workoutVolume: {type: Number, default: 0}
    });
module.exports = mongoose.model('Workout', WorkoutSchema);