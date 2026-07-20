jest.mock('../../models/User');
jest.mock('jsonwebtoken');

const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { register, login, getMe } = require('../../controllers/authController');
const { mockRequest, mockResponse } = require('../helpers');

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };
  jwt.sign.mockReturnValue('signed.token');
});

afterEach(() => {
  process.env = OLD_ENV;
});

describe('authController - register', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = mockRequest({ body: { email: 'a@b.com' } });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please provide all required fields' });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('requires company name for admin registration', async () => {
    const req = mockRequest({
      body: { fullName: 'A', email: 'a@b.com', password: 'secret', role: 'admin', phoneNumber: '1234567890' },
    });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Company Name is required for admin registration' });
  });

  it('requires phone number for admin registration', async () => {
    const req = mockRequest({
      body: { fullName: 'A', email: 'a@b.com', password: 'secret', role: 'admin', companyName: 'Acme' },
    });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Phone Number is required for admin registration' });
  });

  it('validates the admin phone number format', async () => {
    const req = mockRequest({
      body: {
        fullName: 'A', email: 'a@b.com', password: 'secret', role: 'admin',
        companyName: 'Acme', phoneNumber: 'not-a-number',
      },
    });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please provide a valid phone number (10-15 digits)' });
  });

  it('returns 400 when the user already exists', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing' });
    const req = mockRequest({
      body: { fullName: 'A', email: 'a@b.com', password: 'secret', role: 'intern' },
    });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('creates an intern with an internship duration and returns a token', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'u1', fullName: 'A', email: 'a@b.com', role: 'intern', domain: 'Web Development',
    });
    const req = mockRequest({
      body: {
        fullName: 'A', email: 'a@b.com', password: 'secret', role: 'intern',
        domain: 'Web Development', internshipDuration: 6,
      },
    });
    const res = mockResponse();

    await register(req, res);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'A', email: 'a@b.com', password: 'secret', role: 'intern',
      domain: 'Web Development', internshipDuration: 6,
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      token: 'signed.token',
      user: expect.objectContaining({ _id: 'u1', role: 'intern' }),
    }));
  });

  it('creates an admin with company details', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'a1', fullName: 'Boss', email: 'boss@b.com', role: 'admin', domain: 'Web Development',
    });
    const req = mockRequest({
      body: {
        fullName: 'Boss', email: 'boss@b.com', password: 'secret', role: 'admin',
        domain: 'Web Development', companyName: 'Acme', phoneNumber: '1234567890',
      },
    });
    const res = mockResponse();

    await register(req, res);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Acme', phoneNumber: '1234567890', role: 'admin',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 when creation throws', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockRejectedValue(new Error('db error'));
    const req = mockRequest({
      body: { fullName: 'A', email: 'a@b.com', password: 'secret', role: 'intern' },
    });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db error' });
  });
});

describe('authController - login', () => {
  it('returns 400 when email or password is missing', async () => {
    const req = mockRequest({ body: { email: 'a@b.com' } });
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please provide email and password' });
  });

  it('returns 401 when the user does not exist', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const req = mockRequest({ body: { email: 'a@b.com', password: 'secret' } });
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('returns 401 when the password does not match', async () => {
    const user = { comparePassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const req = mockRequest({ body: { email: 'a@b.com', password: 'wrong' } });
    const res = mockResponse();

    await login(req, res);

    expect(user.comparePassword).toHaveBeenCalledWith('wrong');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('logs in successfully and returns a token', async () => {
    const user = {
      _id: 'u1', fullName: 'A', email: 'a@b.com', role: 'intern', domain: 'Web Development',
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const req = mockRequest({ body: { email: 'a@b.com', password: 'secret' } });
    const res = mockResponse();

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      token: 'signed.token',
      user: expect.objectContaining({ _id: 'u1' }),
    }));
  });

  it('returns 500 when the lookup throws', async () => {
    User.findOne.mockImplementation(() => {
      throw new Error('db error');
    });
    const req = mockRequest({ body: { email: 'a@b.com', password: 'secret' } });
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db error' });
  });
});

describe('authController - getMe', () => {
  it('returns the authenticated user', async () => {
    const req = mockRequest({ user: { _id: 'u1', role: 'intern' } });
    const res = mockResponse();

    await getMe(req, res);

    expect(res.json).toHaveBeenCalledWith({ _id: 'u1', role: 'intern' });
  });
});
