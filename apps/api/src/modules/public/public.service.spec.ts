import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PublicService } from './public.service';

jest.mock('bcrypt');

describe('PublicService', () => {
  const prismaMock = {
    profile: { findUnique: jest.fn() },
    link: { findUnique: jest.fn() },
    contactSubmission: { create: jest.fn() },
  };

  let service: PublicService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PublicService(prismaMock as any);
  });

  describe('getPublicProfile', () => {
    it('throws NotFoundException for a profile that does not exist', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(null);

      await expect(service.getPublicProfile('nobody')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for an unpublished profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ isPublished: false });

      await expect(service.getPublicProfile('me')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns only the gated shape for a password-protected profile — no links, no appearance, no hash', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        isPublished: true,
        isPasswordProtected: true,
        pagePasswordHash: 'secret-hash',
        customDomainToken: 'secret-token',
        username: 'me',
        displayName: 'Mi Perfil',
        avatarUrl: null,
        bio: 'bio',
        seoTitle: null,
        seoDescription: null,
        links: [{ id: 'l1' }],
        appearance: { primaryColor: '#fff' },
      });

      const result = await service.getPublicProfile('me');

      expect(result).toEqual({
        isPasswordProtected: true,
        username: 'me',
        displayName: 'Mi Perfil',
        avatarUrl: null,
        bio: 'bio',
        seoTitle: null,
        seoDescription: null,
      });
    });

    it('returns the full profile (minus secrets) when not password-protected', async () => {
      const profile = {
        isPublished: true,
        isPasswordProtected: false,
        pagePasswordHash: null,
        customDomainToken: 'secret-token',
        username: 'me',
        links: [{ id: 'l1' }],
        appearance: { primaryColor: '#fff' },
      };
      prismaMock.profile.findUnique.mockResolvedValue(profile);

      const result = await service.getPublicProfile('me');

      expect(result).not.toHaveProperty('customDomainToken');
      expect(result).not.toHaveProperty('pagePasswordHash');
      expect((result as { links: unknown[] }).links).toEqual([{ id: 'l1' }]);
    });
  });

  describe('unlockProfile', () => {
    it('throws UnauthorizedException on a wrong password', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        isPublished: true,
        isPasswordProtected: true,
        pagePasswordHash: 'hashed',
        links: [],
        appearance: {},
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.unlockProfile('me', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns the full profile (minus secrets) on a correct password', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        isPublished: true,
        isPasswordProtected: true,
        pagePasswordHash: 'hashed',
        customDomainToken: 'secret-token',
        username: 'me',
        links: [{ id: 'l1' }],
        appearance: { primaryColor: '#fff' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.unlockProfile('me', 'correct');

      expect(result).not.toHaveProperty('pagePasswordHash');
      expect(result).not.toHaveProperty('customDomainToken');
      expect((result as { links: unknown[] }).links).toEqual([{ id: 'l1' }]);
    });
  });
});
