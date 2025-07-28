#MyG App
A mobile fitness tracker with smart AI coaching and macro planning. Built using React Native, Express.js, and MongoDB
 
#Project Ideation
The new trend of science-based lifting has taken over the gym community in the recent few years. Many gym-goers from beginners to avid ones like my project mate and I are mainly interested in the bodybuilding style of the gym, mainly focused on maximising hypertrophy and building as much muscle as we can. We have spent countless hours searching online for the optimal workout split/exercises to do, as well as strive for progressive overload(a gym term for basically increasing weights/reps) so as to become as jacked as possible. While we recognise that there are countless gym apps readily available for the average gym goer, we've noticed none of them are specialised for gym goers like us—what we call science based lifters. It’s easy to feel confused on how to go about lifting optimally, especially as a beginner with a myriad of information online as well as feeling isolated and unmotivated, making it harder to stay consistent and achieve long-term results. We hope to create an application specially targeted to science based lifters, something that could keep us striving for personal growth(literally), make fitness more accessible, and provide the personalized support we need. 
That’s why we decided to create this platform. We want to revolutionise gym apps for gym goers like us. With this application, we aim to offer a more advanced solution to what is already available, tracking not only weight and reps but also important factors like rest timing and RIR(reps in reserve), adding fun to the gym through gamification(such as tiers for different muscle groups). We also hope to integrate AI and offer your very own personal AI assistant coach which you can readily ask for advice while resting/working out. By combining these features, we hope to make science based lifting more accessible and popular to help gym goers like us look like our favourite gym influencer.


Target Audience
-- Specifically targetted to science-based lifters of varying experience
-- gym-goers looking for personalised advice

#Tech Stack
**Frontend**: Swift
**Backend**: Express.js
**Database**: MongoDB
**Authentication**: bcryptjs
**AI**: OpenAI api for AI assistant
**Version Control System** git/github
**Testing** Postman(backend testing), Xcode + render(complete testing)

#installation
refer to forDeployment folder

#Features
- Authentication
    - Manual signup/login with password hashing (bcryptjs)

- Workout Logging
    - Start session
    - Add exercise (name, sets, reps, weights)
    - Delete exercise
    - Auto-calculate exercise volume
    - log exercise
    - get progress by name of exercise

- Macro scanner
    - uses open ai api to calculate macros based on user picture input

- AI-powered chatbot for quick access to fitness tips while training
    - uses open ai api to offer science based and optimal advice based on user question
    - AI prompted with appropriate information on science based lifting
- Muscle tier analysis
    - uses open ai to help analyse user lifts and provide them with detailed analysis of their respective body parts
- Macro friendly restaurant map
    - Fetches data from singapore HPB and displays a map of all macro-friendly restaurants in Singapore

End-to-End Testing

We implemented comprehensive end-to-end tests using both automated and user testing methods:

Backend: Jest + Supertest
	•	Tested core API routes like:
	•	/auth/signup and /auth/manual-login
	•	/workout/start, /workout/:id/add-exercise, /workout/:id/log
	•	/ai/ai-coach and /ai/muscle-tier-analysis
	•	Simulated realistic flows using a test MongoDB environment (mongodb-memory-server)

Frontend: Cursor in Xcode
	•	Used Cursor to simulate user interactions with the SwiftUI frontend
	•	Validated:
	•	Signup/login UI logic
	•	Workout form validation
	•	AI Coach interaction flow
	•	Macro Calculator form submission
	•	Ensured the frontend handled backend errors gracefully and rendered real-time feedback properly

User Testing: Google Forms
	•	Collected feedback from users on:
	•	App usability and clarity
	•	Accuracy of macro results and AI suggestions
	•	Suggestions for improvement and feature requests

🧠 Reflections

As our first large-scale full-stack project, MyG has been an incredible learning journey.

We initially overscoped, imagining a long list of advanced features. But through iterative development and testing, we focused on building a working, well-scoped MVP. From debugging edge cases to integrating external APIs, we’ve grown significantly as developers.

We’re proud to say that MyG works — and exceeds most standard lifting apps by combining hypertrophy science, AI, and intuitive UX.
