const { authorize } = require('../../middleware/roleCheck');
const { mockRequest, mockResponse, mockNext } = require('../helpers');

describe('roleCheck middleware - authorize', () => {
  it('calls next() when the user role is allowed', () => {
    const req = mockRequest({ user: { role: 'admin' } });
    const res = mockResponse();
    const next = mockNext();

    authorize('admin', 'intern')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('responds 403 when the user role is not allowed', () => {
    const req = mockRequest({ user: { role: 'intern' } });
    const res = mockResponse();
    const next = mockNext();

    authorize('admin')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User role intern is not authorized to access this route',
    });
  });

  it('rejects every role when no roles are permitted', () => {
    const req = mockRequest({ user: { role: 'admin' } });
    const res = mockResponse();
    const next = mockNext();

    authorize()(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows any of several permitted roles', () => {
    const res = mockResponse();
    const next = mockNext();
    authorize('admin', 'intern')(mockRequest({ user: { role: 'intern' } }), res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
