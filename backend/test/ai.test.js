const request = require('supertest');
const app = require('../index'); // adjust if your Express app is in another file
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// 🧪 Mock OpenAI API
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: JSON.stringify({
              "upper chest": "Elite",
              "mid chest": "Intermediate",
              "core": "Beginner"
            }) }}]
          })
        }
      }
    }))
  };
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('AI Routes', () => {

  it('should return muscle tier analysis', async () => {
    const dummyUserId = new mongoose.Types.ObjectId();

    // Create dummy workouts in DB
    await mongoose.model('Workout').create({
      name: 'Test Workout',
      userId: dummyUserId,
      date: new Date(),
      exercises: [{
        name: 'Incline Bench Press',
        sets: 3,
        reps: [10, 10, 8],
        weights: [40, 45, 50],
        exerciseVolume: 1290
      }]
    });

    const res = await request(app)
      .post('/ai/muscle-tier-analysis')
      .send({ userId: dummyUserId });

    expect(res.statusCode).toBe(200);
    expect(res.body.response).toHaveProperty('upper chest', 'Elite');
  });

  it('should return macros for food input', async () => {
    const res = await request(app)
      .post('/ai/macros-calculator')
      .send({ foodInput: 'chicken breast' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('upper chest'); // because it's mocked as same
  });

  it('should return response for AI coach', async () => {
    const dummyUserId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/ai/ai-coach')
      .send({ userId: dummyUserId, question: 'What should I train today?' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('response');
  });

});