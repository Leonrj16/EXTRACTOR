import { BadRequestException, ConflictException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  const prismaMock = {
    profile: { findUnique: jest.fn(), update: jest.fn() },
  };

  let service: ProfilesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfilesService(prismaMock as any);
  });

  it('rejects a reserved username like "admin"', async () => {
    await expect(service.update('user-1', { username: 'admin' })).rejects.toThrow(
      BadRequestException,
    );
    expect(prismaMock.profile.update).not.toHaveBeenCalled();
  });

  it('rejects a username already taken by another profile', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ userId: 'someone-else' });

    await expect(service.update('user-1', { username: 'taken' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('allows keeping your own username', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ userId: 'user-1' });
    prismaMock.profile.update.mockResolvedValue({ username: 'user-1-name' });

    await expect(service.update('user-1', { username: 'user-1-name' })).resolves.toBeDefined();
  });
});
