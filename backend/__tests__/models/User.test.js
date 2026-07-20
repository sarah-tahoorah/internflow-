const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

let mongoServer;

const baseIntern = {
  fullName: 'Test Intern',
  email: 'intern@test.com',
  password: 'secret123',
  role: 'intern',
  domain: 'Web Development',
  internshipDuration: 6,
};

const baseAdmin = {
  fullName: 'Test Admin',
  email: 'admin@test.com',
  password: 'secret123',
  role: 'admin',
  domain: 'Web Development',
  companyName: 'Acme',
  phoneNumber: '1234567890',
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('User model - password hashing', () => {
  it('hashes the password on save and can compare a correct password', async () => {
    const user = await User.create(baseIntern);

    expect(user.password).not.toBe('secret123');
    const stored = await User.findById(user._id).select('+password');
    expect(await stored.comparePassword('secret123')).toBe(true);
    expect(await stored.comparePassword('wrong')).toBe(false);
  });

  it('does not re-hash the password when it is not modified', async () => {
    const user = await User.create(baseIntern);
    const stored = await User.findById(user._id).select('+password');
    const originalHash = stored.password;

    stored.fullName = 'Renamed Intern';
    await stored.save();

    const reloaded = await User.findById(user._id).select('+password');
    expect(reloaded.password).toBe(originalHash);
    expect(await reloaded.comparePassword('secret123')).toBe(true);
  });
});

describe('User model - role-specific fields', () => {
  it('clears company/phone fields for interns', async () => {
    const user = await User.create({ ...baseIntern, companyName: 'Ignored', phoneNumber: '9999999999' });
    expect(user.companyName).toBeUndefined();
    expect(user.phoneNumber).toBeUndefined();
    expect(user.internshipDuration).toBe(6);
  });

  it('clears internshipDuration for admins and keeps company details', async () => {
    const user = await User.create({ ...baseAdmin, internshipDuration: 6 });
    expect(user.internshipDuration).toBeUndefined();
    expect(user.companyName).toBe('Acme');
    expect(user.phoneNumber).toBe('1234567890');
  });

  it('rejects an admin without a company name', async () => {
    await expect(User.create({ ...baseAdmin, companyName: undefined }))
      .rejects.toThrow(/companyName/);
  });

  it('rejects an admin without a phone number', async () => {
    await expect(User.create({ ...baseAdmin, phoneNumber: undefined }))
      .rejects.toThrow();
  });
});

describe('User model - validation', () => {
  it('rejects an invalid email format', async () => {
    await expect(User.create({ ...baseIntern, email: 'not-an-email' }))
      .rejects.toThrow();
  });

  it('lowercases the email', async () => {
    const user = await User.create({ ...baseIntern, email: 'MixedCase@Test.COM' });
    expect(user.email).toBe('mixedcase@test.com');
  });

  it('rejects a domain outside the allowed enum', async () => {
    await expect(User.create({ ...baseIntern, domain: 'Underwater Basket Weaving' }))
      .rejects.toThrow();
  });

  it('produces a bcrypt-format hash', async () => {
    const user = await User.create(baseIntern);
    const stored = await User.findById(user._id).select('+password');
    expect(await bcrypt.compare('secret123', stored.password)).toBe(true);
  });
});
