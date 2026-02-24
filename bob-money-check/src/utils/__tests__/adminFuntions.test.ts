/**
 * @jest-environment node
 */

// Mock database
jest.mock('../db', () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    transaction: jest.fn(),
  },
}));

// Import after mocking
import { seeAllStudents, GiveAdminClearance, SeeAllClearances, SeeAllUsedReceipts, toggleClearanceStatus, updateStudentDueFees } from '../adminFuntions';

describe('adminFuntions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('seeAllStudents', () => {
    const adminToken = 'admin-valid-token';

    it('should return student list when admin token is valid', async () => {
      // Mock isAdmin check - return true (user is admin)
      const { db } = require('../db');
      
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                innerJoin: jest.fn().mockResolvedValue([
                  { id: 'user-1', email: 'student@example.com', name: 'Test Student', matricule: 'STU001', due_sum: 100 },
                ]),
              }),
            }),
          }),
        });

      const result = await seeAllStudents(adminToken);

      expect(result.success).toBe(true);
    });

    it('should return unauthorized when token is invalid', async () => {
      // Mock isAdmin check - return false (not admin)
      const { db } = require('../db');
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await seeAllStudents('invalid-token');

      expect(result.success).toBe(false);
      expect(result.message).toBe('You are not authorized');
    });
  });

  describe('GiveAdminClearance', () => {
    const adminToken = 'admin-valid-token';

    it('should grant clearance when admin token is valid', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'student-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        });

      (db.transaction as jest.Mock).mockResolvedValue({});

      const result = await GiveAdminClearance(adminToken, 'student@example.com');

      expect(result.success).toBe(true);
    });

    it('should return error when student not found', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await GiveAdminClearance(adminToken, 'nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.message).toBe('student not found');
    });

    it('should return unauthorized when token is invalid', async () => {
      const { db } = require('../db');
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await GiveAdminClearance('invalid-token', 'student@example.com');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Not authorized');
    });
  });

  describe('SeeAllClearances', () => {
    const adminToken = 'admin-valid-token';

    it('should return clearance list when admin token is valid', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([
                { id: 'clearance-1', userId: 'user-1', date: new Date(), active: true, usedReceipts: 'receipt-1', userName: 'Test User', userEmail: 'test@example.com' },
              ]),
            }),
          }),
        });

      const result = await SeeAllClearances(adminToken);

      expect(result.success).toBe(true);
    });

    it('should return unauthorized when token is invalid', async () => {
      const { db } = require('../db');
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await SeeAllClearances('invalid-token');

      expect(result.success).toBe(false);
    });
  });

  describe('SeeAllUsedReceipts', () => {
    const adminToken = 'admin-valid-token';

    it('should return used receipts list when admin token is valid', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue([
                  { receiptId: 'receipt-1', paymentDate: new Date(), userId: 'user-1', createdAt: new Date(), clearanceId: 'clearance-1', userName: 'Test User', userEmail: 'test@example.com', clearanceDate: new Date(), clearanceActive: true, clearanceUsedReceipts: 'receipt-1' },
                ]),
              }),
            }),
          }),
        });

      const result = await SeeAllUsedReceipts(adminToken);

      expect(result.success).toBe(true);
    });

    it('should return unauthorized when token is invalid', async () => {
      const { db } = require('../db');
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await SeeAllUsedReceipts('invalid-token');

      expect(result.success).toBe(false);
    });
  });

  describe('toggleClearanceStatus', () => {
    const adminToken = 'admin-valid-token';

    it('should activate clearance when admin token is valid', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'clearance-1', active: false }]),
            }),
          }),
        });

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await toggleClearanceStatus(adminToken, 'clearance-1', true);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Clearance activated');
    });

    it('should return error when clearance not found', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await toggleClearanceStatus(adminToken, 'nonexistent-clearance', true);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Clearance not found');
    });
  });

  describe('updateStudentDueFees', () => {
    const adminToken = 'admin-valid-token';

    it('should update due fees when admin token is valid', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ student_id: 'student-1', due_sum: 100 }]),
            }),
          }),
        });

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await updateStudentDueFees(adminToken, 'student-1', 200);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Due fees updated successfully');
    });

    it('should return error when student not found', async () => {
      const { db } = require('../db');
      
      // Mock isAdmin check
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'Admin' }]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await updateStudentDueFees(adminToken, 'nonexistent-student', 200);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Student not found');
    });
  });
});
