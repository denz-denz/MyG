const express = require('express');
const Workout = require('../models/Workout');
const router = express.Router();

function calculateExerciseVolume(exercise) {
    let exerciseVolume = 0;
    if (!exercise.reps || !exercise.weights || exercise.reps.length !== exercise.weights.length) {
        return 0; // or throw an error
    }
    for (let i = 0; i < exercise.reps.length; i++){
        const rep = exercise.reps[i];
        const weight = exercise.weights[i];
        exerciseVolume += rep * weight
    }
    return exerciseVolume;
  }
function calculateWorkoutVolume(exercises) {
    let totalWorkoutVolume = 0;
    for (const exercise of exercises) {
        console.log("🔍 Checking exercise:", exercise.name);
        console.log("  reps:", exercise.reps);
        console.log("  weights:", exercise.weights);

        const volume = calculateExerciseVolume(exercise);
        console.log("  ➤ Calculated volume:", volume);

        totalWorkoutVolume += volume;
    }
    console.log(totalWorkoutVolume);
    return totalWorkoutVolume;
}

//start workout
router.post('/start', async (req,res) => {
    console.log("start path hit");
    const {userId, date} = req.body;
    console.log(date);
    try {
        if (!userId) {
            return res.status(400).json({message: "invalid user!"});
        }
        //create empty workout
        const workout = new Workout({userId, date: date?new Date(date): new Date(), startTime:new Date(), exercises: []});
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
    //console.log("RECEIVED:", { reps, weights });
    //console.log("FULL req.body:", req.body);
    if (!name || !sets || !Array.isArray(reps) || !Array.isArray(weights)) {
        return res.status(400).json({ message: "Invalid exercise added!" });
    }
    else if (sets <= 0 || reps.length <= 0 || weights.length <= 0) {
        return res.status(400).json({message: "Invalid exercise data!"});
    }
    else if (reps.length != sets || reps.some(num=>num<0)) {
        return res.status(400).json({message: "Invalid rep data"});
    }
    else if (weights.length != sets || weights.some(num=>num<0)) {
        return res.status(400).json({message: "Invalid weight data"});
    }
    
    try {
        //const workout = await Workout.findById(req.params.id);
        const workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ message: "Workout not found!" });
        }
        const newExercise = {name, sets, reps, weights};
        newExercise.exerciseVolume = calculateExerciseVolume(newExercise);
        /*if (!updatedWorkout) {
            return res.status(404).json({ message: "Workout not found!" });
        }*/
        workout.exercises.push(newExercise);
        workout.totalVolume = calculateWorkoutVolume(workout.exercises);
        await workout.save();
        res.status(200).json({
            message: "Exercise added successfully",
            exerciseVolume: newExercise.exerciseVolume,
            workoutVolume: workout.totalVolume,
            workout: workout
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
            currentWorkoutVolume: calculateWorkoutVolume(workout.exercises),
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
        const duration = durationMs/60000;
        const workoutVolume = calculateWorkoutVolume(workout.exercises);
        await workout.save();
        res.status(201).json({
            message: "Workout logged successfully!",
            workoutId: workout._id,
            startTime: workout.startTime, 
            endTime: workout.endTime,
            duration: duration,
            workoutVolume: workoutVolume,
            exercises: workout.exercises
          });
    }
    catch (err) {
        console.error("error logging workout:", err.message);
        res.status(500).json({message: "Failed to log workout!", error: err.message});
    }
});
router.get('/:userId/:exerciseName/progress', async (req,res) => {
    const {userId, exerciseName} = req.params;
    try{
        const allWorkouts = await Workout.find({userId});
        if (!allWorkouts) {
            return res.status(400).json({message: "no workout logged yet!"});
        }
        if (!userId) {
            return res.status(400).json({message: "invalid UserId"});
        }
        const progress = {};
        allWorkouts.forEach(workout=>{
            const date = workout.date.toISOString().split('T')[0];
            workout.exercises.forEach(ex => {
                if (ex.name == exerciseName) {
                    const volume = ex.exerciseVolume;
                    progress[date] = (progress[date] || 0) + volume;
                }
            })
        });
        const formattedProgress = Object.entries(progress).map(([date, volume]) => ({ date, volume }));
        formattedProgress.sort((a,b)=>new Date(a.date)-new Date(b.date));
        console.log(formattedProgress);
        res.json(formattedProgress);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({message: 'failed to retrieve exercise progress'});
    }
   
});
module.exports = router;