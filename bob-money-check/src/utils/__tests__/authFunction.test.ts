/**
 * @jest-environment node
 */

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_jwt_token'),
  verify: jest.fn().mockReturnValue({ email: 'test@example.com' }),
}));

// Mock database - define mock before using
const mockDb = {
  transaction: jest.fn(),
  select: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    }),
  }),
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ id: 'user-1', token: 'mock-token' }]),
    }),
  }),
  update: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    }),
  }),
};

jest.mock('../db', () => ({
  db: {
    transaction: jest.fn(),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'user-1', token: 'mock-token' }]),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

// Import after mocking
import { SignIn, logout, MassiveLogout, logoutAllExcept, changePassword, CreateAdmin } from '../authFunction';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('authFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SignIn', () => {
    it('should return success with token when credentials are valid', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'Student',
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'token-1', token: 'jwt-token' }]),
        }),
      });

      const result = await SignIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should return error when user is not found', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await SignIn('nonexistent@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should return error when password does not match', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'Student',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await SignIn('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout a token', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 'token-1' }]),
          }),
        }),
      });

      (mockDb.update as jest.Mock).mockReturnValue(mockUpdate);

      const result = await logout('test-token');

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('MassiveLogout', () => {
    it('should logout all tokens for a user', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
          }),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 'token-1' }]),
          }),
        }),
      });

      (mockDb.update as jest.Mock).mockReturnValue(mockUpdate);

      const result = await MassiveLogout('test-token');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return null when token not found', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await MassiveLogout('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  describe('logoutAllExcept', () => {
    it('should logout all tokens except the current one', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
          }),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 'token-1' }]),
          }),
        }),
      });

      (mockDb.update as jest.Mock).mockReturnValue(mockUpdate);

      const result = await logoutAllExcept('current-token');

      expect(result).toBeDefined();
    });

    it('should return null when token not found', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await logoutAllExcept('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        id: 'user-1',
        password: 'hashed_password',
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (mockDb.update as jest.Mock).mockReturnValue(mockUpdate);

      const result = await changePassword('user-1', 'oldpassword', 'newpassword');

      expect(result.success).toBe(true);
    });

    it('should return error when user not found', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await changePassword('nonexistent', 'oldpassword', 'newpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should return error when current password is incorrect', async () => {
      const mockUser = {
        id: 'user-1',
        password: 'hashed_password',
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await changePassword('user-1', 'wrongpassword', 'newpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Current password is incorrect');
    });
  });

  describe('CreateAdmin', () => {
    it('should create admin with correct key', async () => {
      process.env.AdminSignUpKey = 'admin-key';

      (mockDb.transaction as jest.Mock).mockResolvedValue({
        success: true,
        jwtToken: 'mock-jwt-token',
        admin: { id: 'admin-1', email: 'admin@example.com' },
      });

      const result = await CreateAdmin('admin@example.com', 'Admin User', 'password123', 'admin-key');

      expect(result.success).toBe(true);
    });

    it('should fail with incorrect key', async () => {
      process.env.AdminSignUpKey = 'admin-key';

      const result = await CreateAdmin('admin@example.com', 'Admin User', 'password123', 'wrong-key');

      expect(result.success).toBe(false);
      expect(result.message).toBe('The key is not correct');
    });
  });
});
