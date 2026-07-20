jest.mock('../../models/InviteToken');

const InviteToken = require('../../models/InviteToken');
const { createInvite, getInvites } = require('../../controllers/inviteController');
const { mockRequest, mockResponse } = require('../helpers');

const OLD_ENV = process.env;

afterEach(() => {
  process.env = OLD_ENV;
});

describe('inviteController - createInvite', () => {
  it('returns 400 when email or role is missing', async () => {
    const req = mockRequest({ body: { email: 'a@b.com' }, user: { _id: 'admin1' } });
    const res = mockResponse();

    await createInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and role are required' });
    expect(InviteToken.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid role', async () => {
    const req = mockRequest({ body: { email: 'a@b.com', role: 'superuser' }, user: { _id: 'admin1' } });
    const res = mockResponse();

    await createInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid role' });
  });

  it('creates an invite with a token and link', async () => {
    process.env = { ...OLD_ENV, FRONTEND_URL: 'https://app.test' };
    InviteToken.create.mockResolvedValue({});
    const req = mockRequest({ body: { email: 'a@b.com', role: 'intern' }, user: { _id: 'admin1' } });
    const res = mockResponse();

    await createInvite(req, res);

    expect(InviteToken.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'a@b.com', role: 'intern', createdBy: 'admin1',
    }));
    const createArgs = InviteToken.create.mock.calls[0][0];
    expect(createArgs.token).toMatch(/^[0-9a-f]{64}$/);
    expect(createArgs.expiresAt).toBeInstanceOf(Date);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.invite.email).toBe('a@b.com');
    expect(payload.invite.inviteLink).toBe(`https://app.test/register?token=${createArgs.token}`);
  });

  it('falls back to localhost when FRONTEND_URL is unset', async () => {
    process.env = { ...OLD_ENV };
    delete process.env.FRONTEND_URL;
    InviteToken.create.mockResolvedValue({});
    const req = mockRequest({ body: { email: 'a@b.com', role: 'admin' }, user: { _id: 'admin1' } });
    const res = mockResponse();

    await createInvite(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.invite.inviteLink).toContain('http://localhost:3000/register?token=');
  });

  it('returns 500 when creation throws', async () => {
    InviteToken.create.mockRejectedValue(new Error('db error'));
    const req = mockRequest({ body: { email: 'a@b.com', role: 'intern' }, user: { _id: 'admin1' } });
    const res = mockResponse();

    await createInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db error' });
  });
});

describe('inviteController - getInvites', () => {
  it('returns invites sorted by creation date', async () => {
    const invites = [{ email: 'a@b.com' }];
    const query = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(invites),
    };
    InviteToken.find.mockReturnValue(query);
    const req = mockRequest({ user: { _id: 'admin1' } });
    const res = mockResponse();

    await getInvites(req, res);

    expect(query.populate).toHaveBeenCalledWith('createdBy', 'fullName email');
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.json).toHaveBeenCalledWith(invites);
  });

  it('returns 500 when the query throws', async () => {
    InviteToken.find.mockImplementation(() => {
      throw new Error('db error');
    });
    const req = mockRequest({ user: { _id: 'admin1' } });
    const res = mockResponse();

    await getInvites(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db error' });
  });
});
