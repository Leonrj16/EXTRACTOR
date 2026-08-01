import { BadRequestException, ConflictException } from '@nestjs/common';
import * as dns from 'node:dns/promises';
import { ProfilesService } from './profiles.service';

jest.mock('node:dns/promises');

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

  it('never returns pagePasswordHash from getByUserId, but keeps customDomainToken (the owner needs it to configure DNS)', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({
      userId: 'user-1',
      username: 'me',
      pagePasswordHash: 'secret-hash',
      customDomainToken: 'verification-token',
    });

    const result = await service.getByUserId('user-1');

    expect(result).not.toHaveProperty('pagePasswordHash');
    expect(result).toHaveProperty('customDomainToken', 'verification-token');
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

  describe('setCustomDomain', () => {
    it('rejects a domain already claimed by another profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ userId: 'someone-else' });

      await expect(service.setCustomDomain('user-1', 'taken.com')).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.profile.update).not.toHaveBeenCalled();
    });

    it('issues a fresh token and resets verification when the domain changes', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(null);
      prismaMock.profile.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ username: 'me', ...data }),
      );

      const result = await service.setCustomDomain('user-1', 'MyDomain.com');

      const updateCall = prismaMock.profile.update.mock.calls[0][0];
      expect(updateCall.data.customDomain).toBe('mydomain.com');
      expect(updateCall.data.customDomainToken).toEqual(expect.any(String));
      expect(updateCall.data.customDomainVerifiedAt).toBeNull();
      expect((result as { customDomainToken: string }).customDomainToken).toEqual(
        expect.any(String),
      );
    });
  });

  describe('verifyCustomDomain', () => {
    it('rejects when no domain has been configured yet', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ customDomain: null, customDomainToken: null });

      await expect(service.verifyCustomDomain('user-1')).rejects.toThrow(BadRequestException);
    });

    it('rejects when the TXT record lookup fails (not propagated yet)', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        customDomain: 'mydomain.com',
        customDomainToken: 'expected-token',
      });
      (dns.resolveTxt as jest.Mock).mockRejectedValue(new Error('ENOTFOUND'));

      await expect(service.verifyCustomDomain('user-1')).rejects.toThrow(BadRequestException);
    });

    it('rejects when the TXT record exists but does not match the token', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        customDomain: 'mydomain.com',
        customDomainToken: 'expected-token',
      });
      (dns.resolveTxt as jest.Mock).mockResolvedValue([['some-other-value']]);

      await expect(service.verifyCustomDomain('user-1')).rejects.toThrow(BadRequestException);
      expect(prismaMock.profile.update).not.toHaveBeenCalled();
    });

    it('marks the domain verified when the TXT record matches', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({
        customDomain: 'mydomain.com',
        customDomainToken: 'expected-token',
      });
      (dns.resolveTxt as jest.Mock).mockResolvedValue([['expected-token']]);
      prismaMock.profile.update.mockResolvedValue({ customDomainVerifiedAt: new Date() });

      await service.verifyCustomDomain('user-1');

      expect(prismaMock.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { customDomainVerifiedAt: expect.any(Date) } }),
      );
    });
  });
});
