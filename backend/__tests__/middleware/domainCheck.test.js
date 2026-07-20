jest.mock('../../models/User');

const User = require('../../models/User');
const {
  enforceDomain,
  validateInternAccess,
  validateTaskDomain,
} = require('../../middleware/domainCheck');
const { mockRequest, mockResponse, mockNext } = require('../helpers');

const buildFindQuery = (resolvedValue) => ({
  select: jest.fn().mockResolvedValue(resolvedValue),
});

describe('domainCheck middleware - enforceDomain', () => {
  it('passes through for non-admin users', async () => {
    const req = mockRequest({ user: { role: 'intern', domain: 'Web Development' } });
    const res = mockResponse();
    const next = mockNext();

    await enforceDomain(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.adminDomain).toBeUndefined();
  });

  it('sets req.adminDomain for admins with a domain', async () => {
    const req = mockRequest({ user: { role: 'admin', domain: 'Data Science' } });
    const res = mockResponse();
    const next = mockNext();

    await enforceDomain(req, res, next);

    expect(req.adminDomain).toBe('Data Science');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 403 for admins without a domain', async () => {
    const req = mockRequest({ user: { role: 'admin' } });
    const res = mockResponse();
    const next = mockNext();

    await enforceDomain(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Admin must have a domain assigned' });
  });
});

describe('domainCheck middleware - validateInternAccess', () => {
  it('passes through for non-admin users', async () => {
    const req = mockRequest({ user: { role: 'intern' }, body: { internId: 'i1' } });
    const res = mockResponse();
    const next = mockNext();

    await validateInternAccess(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(User.find).not.toHaveBeenCalled();
  });

  it('passes through when no interns are targeted', async () => {
    const req = mockRequest({ user: { role: 'admin', domain: 'Web Development' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    await validateInternAccess(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(User.find).not.toHaveBeenCalled();
  });

  it('allows access when all interns match the admin domain (internId)', async () => {
    User.find.mockReturnValue(buildFindQuery([{ domain: 'Web Development' }]));
    const req = mockRequest({
      user: { role: 'admin', domain: 'Web Development' },
      body: { internId: 'i1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await validateInternAccess(req, res, next);

    expect(User.find).toHaveBeenCalledWith({ _id: { $in: ['i1'] }, role: 'intern' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('supports the assignedTo array of interns', async () => {
    User.find.mockReturnValue(
      buildFindQuery([{ domain: 'Web Development' }, { domain: 'Web Development' }])
    );
    const req = mockRequest({
      user: { role: 'admin', domain: 'Web Development' },
      body: { assignedTo: ['i1', 'i2'] },
    });
    const res = mockResponse();
    const next = mockNext();

    await validateInternAccess(req, res, next);

    expect(User.find).toHaveBeenCalledWith({ _id: { $in: ['i1', 'i2'] }, role: 'intern' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when some interns are not found', async () => {
    User.find.mockReturnValue(buildFindQuery([{ domain: 'Web Development' }]));
    const req = mockRequest({
      user: { role: 'admin', domain: 'Web Development' },
      body: { assignedTo: ['i1', 'i2'] },
    });
    const res = mockResponse();
    const next = mockNext();

    await validateInternAccess(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'One or more interns not found' });
  });

  it('returns 403 when an intern belongs to a different domain', async () => {
    User.find.mockReturnValue(buildFindQuery([{ domain: 'Data Science' }]));
    const req = mockRequest({
      user: { role: 'admin', domain: 'Web Development' },
      body: { internId: 'i1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await validateInternAccess(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied: You can only assign tasks to Web Development interns',
      violation: 'DOMAIN_MISMATCH',
    });
  });

  it('returns 500 when the lookup throws', async () => {
    User.find.mockImplementation(() => {
      throw new Error('db down');
    });
    const req = mockRequest({
      user: { role: 'admin', domain: 'Web Development' },
      body: { internId: 'i1' },
    });
    const res = mockResponse();
    const next = mockNext();

    await validateInternAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db down' });
  });
});

describe('domainCheck middleware - validateTaskDomain', () => {
  it('passes through for non-admin users', () => {
    const req = mockRequest({ user: { role: 'intern' }, body: { domain: 'Data Science' } });
    const res = mockResponse();
    const next = mockNext();

    validateTaskDomain(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('defaults the task domain to the admin domain when omitted', () => {
    const req = mockRequest({ user: { role: 'admin', domain: 'Web Development' }, body: {} });
    const res = mockResponse();
    const next = mockNext();

    validateTaskDomain(req, res, next);

    expect(req.body.domain).toBe('Web Development');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('allows a task domain matching the admin domain', () => {
    const req = mockRequest({
      user: { role: 'admin', domain: 'Web Development' },
      body: { domain: 'Web Development' },
    });
    const res = mockResponse();
    const next = mockNext();

    validateTaskDomain(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 403 for a mismatched task domain', () => {
    const req = mockRequest({
      user: { role: 'admin', domain: 'Web Development' },
      body: { domain: 'Data Science' },
    });
    const res = mockResponse();
    const next = mockNext();

    validateTaskDomain(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied: You can only create Web Development tasks',
      violation: 'DOMAIN_MISMATCH',
    });
  });
});
