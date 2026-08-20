import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LinksService } from './links.service';

describe('LinksService', () => {
  const prismaMock = {
    profile: { findUnique: jest.fn() },
    link: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let linksService: LinksService;

  beforeEach(() => {
    jest.clearAllMocks();
    linksService = new LinksService(prismaMock as any);
  });

  it('throws NotFoundException when the user has no profile', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null);

    await expect(linksService.list('user-without-profile')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates a link with an auto-incremented order when none is given', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
    prismaMock.link.count.mockResolvedValue(2);
    prismaMock.link.create.mockImplementation(({ data }) =>
      Promise.resolve(data),
    );

    const created = await linksService.create('user-1', {
      title: 'Nuevo enlace',
    });

    expect(created.order).toBe(30);
    expect(created.profileId).toBe('profile-1');
  });

  it('rejects updating a link that belongs to another profile', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
    prismaMock.link.findUnique.mockResolvedValue({
      id: 'link-1',
      profileId: 'other-profile',
    });

    await expect(
      linksService.update('user-1', 'link-1', { title: 'Hackeado' } as any),
    ).rejects.toThrow(NotFoundException);
    expect(prismaMock.link.update).not.toHaveBeenCalled();
  });

  it('rejects reordering links that are not owned by the profile', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
    prismaMock.link.findMany.mockResolvedValue([{ id: 'link-1' }]);

    await expect(
      linksService.reorder('user-1', {
        items: [
          { id: 'link-1', order: 10 },
          { id: 'link-not-owned', order: 20 },
        ],
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
