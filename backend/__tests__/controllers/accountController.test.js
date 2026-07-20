jest.mock('../../models/User');
jest.mock('../../models/Task');
jest.mock('../../models/Submission');
jest.mock('../../models/Attendance');

const User = require('../../models/User');
const Task = require('../../models/Task');
const Submission = require('../../models/Submission');
const Attendance = require('../../models/Attendance');
const { deleteAccount } = require('../../controllers/accountController');
const { mockRequest, mockResponse } = require('../helpers');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

const buildFindByIdQuery = (resolvedValue) => ({
  select: jest.fn().mockResolvedValue(resolvedValue),
});

describe('accountController - deleteAccount', () => {
  it('returns 400 when password is not provided', async () => {
    const req = mockRequest({ body: {}, user: { _id: 'u1' } });
    const res = mockResponse();

    await deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password is required to delete account' });
  });

  it('returns 404 when the user is not found', async () => {
    User.findById.mockReturnValue(buildFindByIdQuery(null));
    const req = mockRequest({ body: { password: 'secret' }, user: { _id: 'u1' } });
    const res = mockResponse();

    await deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('returns 401 when the password is invalid', async () => {
    const user = { role: 'intern', comparePassword: jest.fn().mockResolvedValue(false) };
    User.findById.mockReturnValue(buildFindByIdQuery(user));
    const req = mockRequest({ body: { password: 'wrong' }, user: { _id: 'u1' } });
    const res = mockResponse();

    await deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password. Account deletion cancelled.' });
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('deletes an intern and their submissions/attendance/task links', async () => {
    const user = { role: 'intern', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findById.mockReturnValue(buildFindByIdQuery(user));
    Submission.deleteMany.mockResolvedValue({});
    Attendance.deleteMany.mockResolvedValue({});
    Task.updateMany.mockResolvedValue({});
    User.findByIdAndDelete.mockResolvedValue({});
    const req = mockRequest({ body: { password: 'secret' }, user: { _id: 'u1' } });
    const res = mockResponse();

    await deleteAccount(req, res);

    expect(Submission.deleteMany).toHaveBeenCalledWith({ internId: 'u1' });
    expect(Attendance.deleteMany).toHaveBeenCalledWith({ internId: 'u1' });
    expect(Task.updateMany).toHaveBeenCalledWith(
      { assignedTo: 'u1' },
      { $pull: { assignedTo: 'u1' } }
    );
    expect(Task.deleteMany).not.toHaveBeenCalled();
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('u1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('deletes an admin and their created tasks', async () => {
    const user = { role: 'admin', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findById.mockReturnValue(buildFindByIdQuery(user));
    Task.deleteMany.mockResolvedValue({});
    User.findByIdAndDelete.mockResolvedValue({});
    const req = mockRequest({ body: { password: 'secret' }, user: { _id: 'admin1' } });
    const res = mockResponse();

    await deleteAccount(req, res);

    expect(Task.deleteMany).toHaveBeenCalledWith({ createdBy: 'admin1' });
    expect(Submission.deleteMany).not.toHaveBeenCalled();
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('admin1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 500 when deletion throws', async () => {
    User.findById.mockImplementation(() => {
      throw new Error('db down');
    });
    const req = mockRequest({ body: { password: 'secret' }, user: { _id: 'u1' } });
    const res = mockResponse();

    await deleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to delete account. Please try again.' });
  });
});
