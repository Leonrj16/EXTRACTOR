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

  it('never returns pagePasswordHash or customDomainToken from getByUserId', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({
      userId: 'user-1',
      username: 'me',
      pagePasswordHash: 'secret-hash',
      customDomainToken: 'secret-token',
    });

    const result = await service.getByUserId('user-1');

    expect(result).not.toHaveProperty('pagePasswordHash');
    expect(result).not.toHaveProperty('customDomainToken');
  });

  it('hashes a plaintext pagePassword before saving and never returns the hash', async () => {
    prismaMock.profile.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ username: 'me', pagePasswordHash: data.pagePasswordHash }),
    );

    const result = await service.update('user-1', { pagePassword: 'plain-text-password' });

    const updateCall = prismaMock.profile.update.mock.calls[0][0];
    expect(updateCall.data.pagePasswordHash).toEqual(expect.any(String));
    expect(updateCall.data.pagePasswordHash).not.toBe('plain-text-password');
    expect(updateCall.data.pagePassword).toBeUndefined();
    expect(result).not.toHaveProperty('pagePasswordHash');
  });

  it('leaves the stored password hash untouched when pagePassword is omitted', async () => {
    prismaMock.profile.update.mockResolvedValue({ username: 'me' });

    await service.update('user-1', { displayName: 'New name' });

    const updateCall = prismaMock.profile.update.mock.calls[0][0];
    expect(updateCall.data.pagePasswordHash).toBeUndefined();
  });
});
