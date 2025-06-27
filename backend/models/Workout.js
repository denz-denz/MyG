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
    name:{type: String, required: true},
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
    WorkoutSchema.set('toJSON', {
        virtuals: true,          // include virtuals like `id`
        versionKey: false,       // removes `__v`
        transform: function (doc, ret) {
          ret.id = ret._id.toString();  // create `id` from `_id`
          delete ret._id;               // remove `_id`
        }
      });
module.exports = mongoose.model('Workout', WorkoutSchema);