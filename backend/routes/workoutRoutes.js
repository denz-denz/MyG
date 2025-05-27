const express = require('express');
const Workout = require('../models/Workout');
const router = express.Router();
//start workout
router.post('/start', async (req,res) => {
    const {userId, date} = req.body;
    try {
        if (!userId) {
            return res.status(400).json({message: "invalid user!"});
        }
        //create empty workout
        const workout = new Workout({userId, date: date?new Date(date): new Date(), startTime:new Date, exercises: []});
        await workout.save();
        res.status(201).json({
            message: "Workout session started",
            workoutId: workout._id,
            date: workout.date
          });
    }
    catch (err) {
        console.error("Error starting workout:", err.message);
        res.status(500).json({message: "Failed to start workout!", error: err.message});
    }
});

//add exercises
router.patch('/:id/add-exercise', async (req,res)=> {
    const {name,sets,reps,weights} = req.body;
    if (!name || !sets || !Array.isArray(reps) || !Array.isArray(weights)) {
        return res.status(400).json({ message: "Invalid exercise added!" });
    }
    else if (sets <= 0 || reps.length <= 0 || weights.length <= 0) {
        return res.status(400).json({message: "Invalid exercise data!"});
    }
    else if (reps.length != sets) {
        return res.status(400).json({message: "Invalid rep data"});
    }
    else if (weights.length != sets) {
        return res.status(400).json({message: "Invalid weight data"});
    }
    
    try {
        const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, {
            $push: {
                exercises: { name, sets, reps, weights }
              }
            },
            {new: true}
        );
        if (!updatedWorkout) {
            return res.status(404).json({ message: "Workout not found!" });
        }
        res.status(200).json({
            message: "Exercise added successfully",
            workout: updatedWorkout
          });
    }
    catch (err) {
        console.error("Error adding exercise:", err.message);
    res.status(500).json({ message: "Failed to add exercise", error: err.message });
    }
});

//remove entire exercise
router.patch('/:id/remove-exercise', async (req,res) => {
    const {name} = req.body;
    try {
        const workout =  await Workout.findByIdAndUpdate(
            req.params.id,
            {
              $pull: {
                exercises: { name }  // delete exercise with matching name
              }
            },
            { new: true }
          );
      
        if (!workout){
            return res.status(404).json({message: "Workout not found"});
        }
        await workout.save();
        res.status(200).json({
            message: "Exercise removed!",
            workout
        });
    }
    catch (err) {
        console.error("error removing exercise:", err.message);
        res.status(500).json({message: "Failed to remove exercise!", error: err.message});
    }
})

//delete workout
router.delete('/:id', async (req,res) => {
    try {
        const deletedWorkout = await Workout.findByIdAndDelete(req.params.id);
        if (!deletedWorkout) {
            return res.status(404).json({message: "Workout not found!"});
        }
        res.status(200).json({message: "Workout deleted successfully"});
    }
    catch (err) {
        console.error("error deleting wokrkout!");
        res.status(500).json({message: "Failed to delete workout", error:err.message});
    }
});

//log workout 
router.patch('/:id/log', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout){
            return res.status(404).json({message: "Workout not found"});
        }
        else if (!Array.isArray(workout.exercises) || workout.exercises.length <= 0) {
            return res.status(400).json({message: "Invalid workout logged!"});
        }
        //const workout = new Workout({userId, date:date?new Date(date):Date.now, exercises});
        workout.endTime = new Date();
        const durationMs = workout.endTime - workout.startTime;
        const duration = durationMs/60000
        await workout.save();
        res.status(201).json({
            message: "Workout logged successfully!",
            workoutId: workout._id,
            startTime: workout.startTime, 
            endTime: workout.endTime,
            duration: duration,
            exercises: workout.exercises
          });
    }
    catch (err) {
        console.error("error logging workout:", err.message);
        res.status(500).json({message: "Failed to log workout!", error: err.message});
    }
});
module.exports = router;