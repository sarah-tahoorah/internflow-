jest.mock('jsonwebtoken');
jest.mock('../../models/User');

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { protect } = require('../../middleware/auth');
const { mockRequest, mockResponse, mockNext } = require('../helpers');

const buildUserQuery = (resolvedValue) => ({
  select: jest.fn().mockResolvedValue(resolvedValue),
});

describe('auth middleware - protect', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = OLD_ENV;
    console.error.mockRestore();
  });

  it('authenticates a valid Bearer token and attaches the user', async () => {
    const user = { _id: 'u1', role: 'intern' };
    jwt.verify.mockReturnValue({ id: 'u1' });
    User.findById.mockReturnValue(buildUserQuery(user));

    const req = mockRequest({ headers: { authorization: 'Bearer good.token' } });
    const res = mockResponse();
    const next = mockNext();

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('good.token', 'test-secret');
    expect(User.findById).toHaveBeenCalledWith('u1');
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when no authorization header is present', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    await protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
  });

  it('returns 401 when the header does not start with Bearer', async () => {
    const req = mockRequest({ headers: { authorization: 'Basic abc' } });
    const res = mockResponse();
    const next = mockNext();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
  });

  it('returns 401 when the token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('bad token');
    });

    const req = mockRequest({ headers: { authorization: 'Bearer bad.token' } });
    const res = mockResponse();
    const next = mockNext();

    await protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
  });

  it('returns 401 when the decoded user no longer exists', async () => {
    jwt.verify.mockReturnValue({ id: 'missing' });
    User.findById.mockReturnValue(buildUserQuery(null));

    const req = mockRequest({ headers: { authorization: 'Bearer good.token' } });
    const res = mockResponse();
    const next = mockNext();

    await protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
});
