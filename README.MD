#MyG App
A mobile fitness tracker with smart AI coaching and macro planning. Built using React Native, Express.js, and MongoDB
 
#Project Ideation
The new trend of science-based lifting has taken over the gym community in the recent few years. Many gym-goers from beginners to avid ones like my project mate and I are mainly interested in the bodybuilding style of the gym, mainly focused on maximising hypertrophy and building as much muscle as we can. We have spent countless hours searching online for the optimal workout split/exercises to do, as well as strive for progressive overload(a gym term for basically increasing weights/reps) so as to become as jacked as possible. While we recognise that there are countless gym apps readily available for the average gym goer, we've noticed none of them are specialised for gym goers like us—what we call science based lifters. It’s easy to feel confused on how to go about lifting optimally, especially as a beginner with a myriad of information online as well as feeling isolated and unmotivated, making it harder to stay consistent and achieve long-term results. We hope to create an application specially targeted to science based lifters, something that could keep us striving for personal growth(literally), make fitness more accessible, and provide the personalized support we need. 
That’s why we decided to create this platform. We want to revolutionise gym apps for gym goers like us. With this application, we aim to offer a more advanced solution to what is already available, tracking not only weight and reps but also important factors like rest timing and RIR(reps in reserve), adding fun to the gym through gamification(such as tiers for different muscle groups). We also hope to integrate AI and offer your very own personal AI assistant coach which you can readily ask for advice while resting/working out. By combining these features, we hope to make science based lifting more accessible and popular to help gym goers like us look like our favourite gym influencer.

Project Timeline & Scope
** Phase 1 (MileStone 1): Completed Features
-- Manual Login/Signup (works with frontend)
-- Google Auth(works in backend)
-- Routes for basic workout logging(start,add,log,get)

**Phase 2 (upcoming)
-- Integrate Google Auth with frontend
-- Integrate workout tracking with frontend to be able to track progress
-- Implement AI assistant coach that offers personalised feedback for users
-- Work on creating a macro profile for users
-- Work on adding a macro tracker 

Target Audience
-- Specifically targetted to science-based lifters of varying experience
-- gym-goers looking for personalised advice

#Tech Stack
**Frontend**: Swift
**Backend**: Express.js
**Database**: MongoDB
**Authentication**: bcryptjs + Google Auth Library
**AI**: OpenAI api for AI assistant
**Version Control System** git/github

#installation
git clone https://github.com/denz-denz/MyG.git
cd MyG
npm install
npm run dev

#Features
- User sign-up and login (manual and Google OAuth)
    - Manual signup/login with password hashing (bcryptjs)
    - Google signup/login with OAuth2

- Workout Logging
    - Start session
    - Add exercise (name, sets, reps, weights)
    - Auto-calculate exercise volume
    - log exercise
    - get lifts by name of exercise

- Macro calculator
    - uses open ai api to calculate macros based on user input and return in json format

- AI-powered chatbot for quick access to fitness tips while training
    - uses open ai api to offer science based and optimal advice based on user question
    - AI prompted with appropriate information on science based lifting



#API routes summary
-- auth/signup POST manual registration
-- auth/manual-login POST  manual login
-- auth/google-login POST google signup/login
-- workout/start  POST start workout
-- workout/:id/add-exercise PATCH add exercise to workout
-- workout/:id/remove-exercise PATCH remove exercise from workout
--workout/:id/log PATCH submit workout to database
--ai/ai-coach POST submit question to open ai for answers
--ai/macros-calculator POST submit food input, receive macros

#Proof of concept
--authentication tested in postman and everything works
--authentication tested with frontend and manual login and signin works
--backend correctly connects with mongodb and saves users and workouts correctly
--ai routes work in postman and gives fairly science-based advice
