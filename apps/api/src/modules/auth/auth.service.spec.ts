import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  const usersMock = { findByEmail: jest.fn() };
  const prismaMock = {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const jwtMock = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
  const configMock = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.accessSecret': 'secret',
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };
      return values[key];
    }),
  };

  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(
      usersMock as any,
      prismaMock as any,
      jwtMock as any,
      configMock as any,
    );
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      usersMock.findByEmail.mockResolvedValue(null);

      await expect(authService.login('nobody@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the user is disabled', async () => {
      usersMock.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        passwordHash: 'hash',
        role: 'ADMIN',
        status: 'DISABLED',
      });

      await expect(authService.login('a@a.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      usersMock.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        passwordHash: 'hash',
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('a@a.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns a token pair on valid credentials', async () => {
      usersMock.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        passwordHash: 'hash',
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-secret');
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt1' });

      const result = await authService.login('a@a.com', 'correct-password');

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.refreshToken).toMatch(/^rt1\./);
      expect(prismaMock.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rejects a malformed refresh token', async () => {
      await expect(authService.refresh('not-a-valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects when the stored token was revoked', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'rt1',
        tokenHash: 'hashed',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 10_000),
        user: { id: 'u1', email: 'a@a.com', role: 'ADMIN' },
      });

      await expect(authService.refresh('rt1.secret')).rejects.toThrow(UnauthorizedException);
    });

    it('rotates the refresh token and returns a new pair when valid', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'rt1',
        tokenHash: 'hashed',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
        user: { id: 'u1', email: 'a@a.com', role: 'ADMIN' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-secret');
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt2' });

      const result = await authService.refresh('rt1.secret');

      expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result.refreshToken).toMatch(/^rt2\./);
    });
  });
});
