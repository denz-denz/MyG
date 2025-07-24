const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Routes', () => {
  it('should successfully sign up a new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
        username: 'testuser',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body.message).toBe('Signup successful');
  });

  it('should fail signup with existing email', async () => {
    await User.create({
      email: 'duplicate@example.com',
      password: 'hashedpass',
      username: 'dupuser',
    });

    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'duplicate@example.com',
        password: 'newpass',
        username: 'newuser',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email already in use');
  });

  it('should login an existing user with correct credentials', async () => {
    const hashedPassword = await require('bcryptjs').hash('validpass', 10);
    const user = await User.create({
      email: 'login@example.com',
      password: hashedPassword,
      username: 'loginuser',
    });

    const res = await request(app)
      .post('/auth/manual-login')
      .send({
        email: 'login@example.com',
        password: 'validpass',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('userId');
    expect(res.body.message).toBe('Login successful');
  });

  it('should reject login with incorrect password', async () => {
    const hashedPassword = await require('bcryptjs').hash('correctpass', 10);
    await User.create({
      email: 'wrongpass@example.com',
      password: hashedPassword,
      username: 'wrongpassuser',
    });

    const res = await request(app)
      .post('/auth/manual-login')
      .send({
        email: 'wrongpass@example.com',
        password: 'wrongpass',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Incorrect password');
  });
});