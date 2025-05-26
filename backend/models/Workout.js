const mongoose = require('mongoose');
const WorkoutSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //links to User in User.js
        required: true},  
    date: {
        type: String,
        required: true
    },
    exercises: [
        {
            name: { type: String, required:true},
            sets: {type: Number,
                    validate: {
                        validator: function (val) {
                            return val.length > 0;
                        },
                        message: 'Number of sets must exceed 0.'
                    }
                }, 
            reps: {type: [Number], 
                    validate: {
                        validator: function (val) {
                          return val.length === this.sets;
                        },
                        message: 'Number of reps must match the number of sets.'
                      }
                },
            weight: {type: [Number],  validate: {
                    validator: function (val) {
                      return val.length === this.sets;
                    },
                    message: 'Number of weights must match the number of sets.'
                  }
            }
        }
    ]
    });