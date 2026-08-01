import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppearanceService } from './appearance.service';

describe('AppearanceService', () => {
  const prismaMock = {
    profile: { findUnique: jest.fn(), update: jest.fn() },
    theme: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    appearance: { findUnique: jest.fn(), update: jest.fn() },
  };

  let appearanceService: AppearanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    appearanceService = new AppearanceService(prismaMock as any);
  });

  describe('listThemes', () => {
    it('throws NotFoundException when the user has no profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(null);

      await expect(
        appearanceService.listThemes('user-without-profile'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lists both system themes and the profile own custom themes', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.theme.findMany.mockResolvedValue([{ id: 'theme-1' }]);

      await appearanceService.listThemes('user-1');

      expect(prismaMock.theme.findMany).toHaveBeenCalledWith({
        where: { OR: [{ isSystem: true }, { profileId: 'profile-1' }] },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('getByUserId', () => {
    it('throws NotFoundException when the user has no profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(null);

      await expect(
        appearanceService.getByUserId('user-without-profile'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when appearance was never provisioned', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        id: 'profile-1',
        favoriteThemeKeys: [],
      });
      prismaMock.appearance.findUnique.mockResolvedValue(null);

      await expect(appearanceService.getByUserId('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('merges favoriteThemeKeys from the profile into the appearance payload', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        id: 'profile-1',
        favoriteThemeKeys: ['aurora', 'tech'],
      });
      prismaMock.appearance.findUnique.mockResolvedValue({
        profileId: 'profile-1',
        primaryColor: '#fff',
      });

      const result = await appearanceService.getByUserId('user-1');

      expect(result.favoriteThemeKeys).toEqual(['aurora', 'tech']);
      expect(result.primaryColor).toBe('#fff');
    });
  });

  describe('update', () => {
    it('rejects a themeId that is not a system theme or the profile own theme', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.theme.findFirst.mockResolvedValue(null);

      await expect(
        appearanceService.update('user-1', {
          themeId: 'not-owned-theme',
        } as any),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.appearance.update).not.toHaveBeenCalled();
    });

    it('updates the appearance when the theme is valid', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.theme.findFirst.mockResolvedValue({ id: 'theme-1' });
      prismaMock.appearance.update.mockResolvedValue({ themeId: 'theme-1' });

      const result = await appearanceService.update('user-1', {
        themeId: 'theme-1',
      });

      expect(result).toEqual({ themeId: 'theme-1' });
      expect(prismaMock.appearance.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { profileId: 'profile-1' } }),
      );
    });
  });

  describe('createCustomTheme', () => {
    it('creates a non-system theme scoped to the caller profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.theme.create.mockImplementation(({ data }) =>
        Promise.resolve(data),
      );

      const created = await appearanceService.createCustomTheme('user-1', {
        name: 'Mi tema',
        baseConfig: {},
      });

      expect(created.isSystem).toBe(false);
      expect(created.profileId).toBe('profile-1');
      expect(created.key).toContain('custom-profile-1-');
    });
  });

  describe('deleteCustomTheme', () => {
    it('throws NotFoundException when the theme does not belong to the caller', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.theme.findFirst.mockResolvedValue(null);

      await expect(
        appearanceService.deleteCustomTheme('user-1', 'theme-x'),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.theme.delete).not.toHaveBeenCalled();
    });

    it('wraps a delete failure (theme still in use) as BadRequestException', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.theme.findFirst.mockResolvedValue({
        id: 'theme-1',
        profileId: 'profile-1',
      });
      prismaMock.theme.delete.mockRejectedValue(new Error('FK constraint'));

      await expect(
        appearanceService.deleteCustomTheme('user-1', 'theme-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleFavoriteTheme', () => {
    it('adds a theme key to favorites when not already favorited', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        id: 'profile-1',
        favoriteThemeKeys: [],
      });
      prismaMock.profile.update.mockResolvedValue({});

      const result = await appearanceService.toggleFavoriteTheme(
        'user-1',
        'aurora',
      );

      expect(result.favoriteThemeKeys).toEqual(['aurora']);
      expect(prismaMock.profile.update).toHaveBeenCalledWith({
        where: { id: 'profile-1' },
        data: { favoriteThemeKeys: ['aurora'] },
      });
    });

    it('removes a theme key from favorites when already favorited', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        id: 'profile-1',
        favoriteThemeKeys: ['aurora', 'tech'],
      });
      prismaMock.profile.update.mockResolvedValue({});

      const result = await appearanceService.toggleFavoriteTheme(
        'user-1',
        'aurora',
      );

      expect(result.favoriteThemeKeys).toEqual(['tech']);
    });
  });
});
