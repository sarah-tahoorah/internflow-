jest.mock('../../models/User');

const User = require('../../models/User');
const { getInterns } = require('../../controllers/userController');
const { mockRequest, mockResponse } = require('../helpers');

const buildFindQuery = (resolvedValue) => ({
  select: jest.fn().mockResolvedValue(resolvedValue),
});

describe('userController - getInterns', () => {
  it('scopes the query to the admin domain for admins', async () => {
    const interns = [{ fullName: 'Ann' }];
    User.find.mockReturnValue(buildFindQuery(interns));
    const req = mockRequest({ user: { role: 'admin', domain: 'Web Development' } });
    const res = mockResponse();

    await getInterns(req, res);

    expect(User.find).toHaveBeenCalledWith({ role: 'intern', domain: 'Web Development' });
    expect(res.json).toHaveBeenCalledWith(interns);
  });

  it('does not scope by domain for non-admin users', async () => {
    User.find.mockReturnValue(buildFindQuery([]));
    const req = mockRequest({ user: { role: 'intern', domain: 'Web Development' } });
    const res = mockResponse();

    await getInterns(req, res);

    expect(User.find).toHaveBeenCalledWith({ role: 'intern' });
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('returns 500 when the query fails', async () => {
    User.find.mockImplementation(() => {
      throw new Error('boom');
    });
    const req = mockRequest({ user: { role: 'intern' } });
    const res = mockResponse();

    await getInterns(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  });
});
