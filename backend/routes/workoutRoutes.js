const express = require('express');
const Workout = require('../models/Workout');
const mongoose = require('mongoose');
const router = express.Router();
const {OpenAI} = require('openai');
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

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
        const volume = calculateExerciseVolume(exercise);
        totalWorkoutVolume += volume;
    }
    return totalWorkoutVolume;
}

//start workout
router.post('/start', async (req,res) => {
    const {name, userId, date} = req.body;
    try {
        if (!userId) {
            return res.status(400).json({message: "invalid user!"});
        }
        //create empty workout
        const workout = new Workout({name, userId, date: date?new Date(date): new Date(), exercises: []});
        await workout.save();
         res.status(201).json({
            message: "Workout session started",
            workoutId: workout._id,
            workout: workout
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
    else if (reps.length != sets || reps.some(num=>num<0)) {
        return res.status(400).json({message: "Invalid rep data"});
    }
    else if (weights.length != sets || weights.some(num=>num<0)) {
        return res.status(400).json({message: "Invalid weight data"});
    }
    
    try {
        const workout = await Workout.findById(req.params.id);
        const normalisedName = name.trim().toLowerCase();
        if (!workout) {
            return res.status(404).json({ message: "Workout not found!" });
        }
        const newExercise = {name:normalisedName, sets, reps, weights};
        newExercise.exerciseVolume = calculateExerciseVolume(newExercise);
        workout.exercises.push(newExercise);
        workout.workoutVolume += newExercise.exerciseVolume;
        await workout.save();
        res.status(200).json({
            message: "Exercise added successfully",
            workout: workout
          });
    }
    catch (err) {
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
            workout:workout
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
        const workoutVolume = calculateWorkoutVolume(workout.exercises);
        console.log(workout.exercises)
        await workout.save();
        //formatted current workout logged
        const workoutSummary = workout.exercises.map(e => {
            const sets = e.reps.map((rep, i) => {
              const weight = e.weights[i] ?? '0';
              return `${rep} reps @ ${weight}kg`;
            }).join(', ');
            return `- ${e.name}: ${sets}`;
        }).join('\n');
        const userId = workout.userId;
        const allWorkouts = await Workout.find({ userId }).sort({ date: -1 }).limit(20);
        //formatted all workouts
        const workoutHistory = allWorkouts.map(w => {
            const date = new Date(w.date).toLocaleDateString();
            const details = w.exercises.map(e => {
                const sets = e.reps.map((rep, i) => {
                    const weight = e.weights[i] ?? '0';
                    return `${rep} reps @ ${weight}kg`;
                }).join(', ');
                return `- ${e.name}: ${sets}`;
            }).join('\n');
            return `Workout on ${date}:\n${details}`;
        }).join('\n\n');

        const aiPrompt = `You are a helpful science-based fitness assistant looking to maximise hypertrophy. As a science-based lifter, you are looking to maximise muscle growth through mechanical tension and minimise central nervous system fatigue, and suggest exercises that are stable as well as easy to progressive overload. For example, exercises like the squat, bench and deadlift would be considered suboptimal unless the user really wants to do it or is a powerlifter as those exercises are very taxing on the central nervous sytem, and are not as stable as compared to using the smith or cables. Also, try to match muscular leverages and resistance profiles to suggest good exercises/machines that best fits the resistance profile of the target muscle. The optimal rep range we are looking for here is 6-12. We try not to overdo the volume for each exercise(typically 2-3 sets is optimal). Here's the user's workout today:\n${workoutSummary}\n\n Here are the user's recent workout history:\n${workoutHistory}\n\nPlease give 2-3 concise suggestions based on current workout and all workouts done to improve hypertrophy, stability, or recovery. For example, if you see that a user keeps on training a specific body part, you can let him know which exact body part he keeps working on and advise him to train other parts more. If you notice that the volume of a specific exercise is decreasing, you can suggest lower volume for more recovery etc etc. Make sure your suggestions are not general and more more specifically targetted to this user. Return it as plain bullet points. If the user did an optimal exercise with optimal rep range and you have no criticism, just reply with encouragement.`;
        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful and science-based lifting assistant.' },
              { role: 'user', content: aiPrompt }
            ],
            temperature: 0.7
          });
        const suggestions = aiResponse.choices[0].message.content;
        res.status(201).json({
            message: "Workout logged successfully!",
            workoutId: workout._id,
            workout: workout,
            suggestions: suggestions
          });
    }
    catch (err) {
        res.status(500).json({message: "Failed to log workout!", error: err.message});
    }
});

//get specific exercise progress
router.get('/:userId/:exerciseName/progress', async (req,res) => {
    const {userId, exerciseName} = req.params;
    const normalize = str => str.replace(/\s+/g, '').toLowerCase();
    try{
        const allWorkouts = await Workout.find({userId});
        
        if (!allWorkouts) {
            console.log("no workout found");
            return res.status(400).json({message: "no workout logged yet!"});
        }
        if (!userId) {
            console.log("invalid userId");
            return res.status(400).json({message: "invalid UserId"});
        }
        const progress = {};
        allWorkouts.forEach(workout=>{
            const date = workout.date.toISOString().split('T')[0];
            workout.exercises.forEach(ex => {
                if (normalize(ex.name) == normalize(exerciseName)) {
                    const volume = ex.exerciseVolume;
                    progress[date] = (progress[date] || 0) + volume;
                }
            })
        });
        const formattedProgress = Object.entries(progress).map(([date, volume]) => ({ date, volume }));
        formattedProgress.sort((a,b)=>new Date(a.date)-new Date(b.date));
        res.json(formattedProgress);
    }
    catch (err) {
        res.status(500).json({message: 'failed to retrieve exercise progress'});
    }
   
});

router.get('/:userId/exercise-list', async (req, res) => {
    const { userId } = req.params;
    const normalize = str => str.replace(/\s+/g, '').toLowerCase(); //standardise name to same as progress tracker
  
    try {
      const workouts = await Workout.find({ userId });
      const seen = new Map(); // hashmap to keep track of exercises seen
      workouts.forEach(workout => {
        workout.exercises.forEach(ex => {
          const key = normalize(ex.name);
          if (!seen.has(key)) {
            seen.set(key, ex.name); // keep the original form
          }
        });
      });
  
      const uniqueExercises = Array.from(seen.values());
      res.status(200).json(uniqueExercises); //always return array
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch exercise list", error: err.message });
    }
  });

//get all workouts done by user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
  
    try {
      const workouts = await Workout.find({ userId: new mongoose.Types.ObjectId(userId) });
      res.json(workouts);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

module.exports = router;