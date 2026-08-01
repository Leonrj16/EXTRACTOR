import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PageVersionsService } from './page-versions.service';

describe('PageVersionsService', () => {
  const prismaMock = {
    profile: { findUnique: jest.fn() },
    link: { findMany: jest.fn(), deleteMany: jest.fn(), create: jest.fn() },
    pageVersion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let pageVersionsService: PageVersionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    pageVersionsService = new PageVersionsService(prismaMock as any);
  });

  describe('list', () => {
    it('throws NotFoundException when the user has no profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(null);

      await expect(
        pageVersionsService.list('user-without-profile'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lists versions ordered by newest first, without the snapshot payload', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.pageVersion.findMany.mockResolvedValue([
        { id: 'v1', name: 'Antes del rediseño' },
      ]);

      await pageVersionsService.list('user-1');

      expect(prismaMock.pageVersion.findMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-1' },
        select: { id: true, name: true, blockCount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('snapshots the current links (order preserved) and counts them', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.link.findMany.mockResolvedValue([
        {
          id: 'link-1',
          type: 'LINK',
          title: 'Instagram',
          url: 'https://instagram.com',
          icon: null,
          imageUrl: null,
          metadata: null,
          styleOverrides: null,
          isActive: true,
          order: 10,
        },
      ]);
      prismaMock.pageVersion.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'v1',
          name: data.name,
          blockCount: data.blockCount,
          createdAt: new Date(),
        }),
      );

      const created = await pageVersionsService.create('user-1', {
        name: 'Checkpoint',
      });

      expect(created.name).toBe('Checkpoint');
      expect(created.blockCount).toBe(1);

      const storedData = prismaMock.pageVersion.create.mock.calls[0][0].data;
      expect(storedData.snapshot).toEqual([
        {
          type: 'LINK',
          title: 'Instagram',
          url: 'https://instagram.com',
          icon: null,
          imageUrl: null,
          metadata: null,
          styleOverrides: null,
          isActive: true,
          order: 10,
        },
      ]);
      // The snapshot never stores the original link id — restoring always
      // creates fresh rows (see restore()).
      expect(storedData.snapshot[0]).not.toHaveProperty('id');
    });

    it('stores an empty snapshot for a page with no blocks yet', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.link.findMany.mockResolvedValue([]);
      prismaMock.pageVersion.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'v1',
          name: data.name,
          blockCount: data.blockCount,
          createdAt: new Date(),
        }),
      );

      const created = await pageVersionsService.create('user-1', {
        name: 'Vacío',
      });

      expect(created.blockCount).toBe(0);
      expect(
        prismaMock.pageVersion.create.mock.calls[0][0].data.snapshot,
      ).toEqual([]);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the version belongs to another profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.pageVersion.findUnique.mockResolvedValue({
        id: 'v1',
        profileId: 'other-profile',
      });

      await expect(pageVersionsService.remove('user-1', 'v1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.pageVersion.delete).not.toHaveBeenCalled();
    });

    it('deletes an owned version', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.pageVersion.findUnique.mockResolvedValue({
        id: 'v1',
        profileId: 'profile-1',
      });
      prismaMock.pageVersion.delete.mockResolvedValue({});

      const result = await pageVersionsService.remove('user-1', 'v1');

      expect(result).toEqual({ deleted: true });
      expect(prismaMock.pageVersion.delete).toHaveBeenCalledWith({
        where: { id: 'v1' },
      });
    });
  });

  describe('restore', () => {
    it('throws NotFoundException when the version belongs to another profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.pageVersion.findUnique.mockResolvedValue({
        id: 'v1',
        profileId: 'other-profile',
      });

      await expect(pageVersionsService.restore('user-1', 'v1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('rejects a corrupted (non-array) snapshot', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.pageVersion.findUnique.mockResolvedValue({
        id: 'v1',
        profileId: 'profile-1',
        snapshot: { not: 'an array' },
      });

      await expect(pageVersionsService.restore('user-1', 'v1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('replaces the whole current block set with the snapshot in one transaction', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.pageVersion.findUnique.mockResolvedValue({
        id: 'v1',
        profileId: 'profile-1',
        snapshot: [
          {
            type: 'LINK',
            title: 'Instagram',
            url: 'https://instagram.com',
            icon: null,
            imageUrl: null,
            metadata: null,
            styleOverrides: null,
            isActive: true,
            order: 10,
          },
          {
            type: 'WHATSAPP',
            title: 'WhatsApp',
            url: null,
            icon: null,
            imageUrl: null,
            metadata: { phone: '123' },
            styleOverrides: null,
            isActive: false,
            order: 20,
          },
        ],
      });
      prismaMock.link.deleteMany.mockReturnValue('delete-op');
      prismaMock.link.create.mockImplementation(
        (args) => `create-op:${args.data.title}`,
      );
      prismaMock.$transaction.mockResolvedValue([]);
      prismaMock.link.findMany.mockResolvedValue([
        { id: 'new-1' },
        { id: 'new-2' },
      ]);

      await pageVersionsService.restore('user-1', 'v1');

      expect(prismaMock.link.deleteMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-1' },
      });
      expect(prismaMock.$transaction).toHaveBeenCalledWith([
        'delete-op',
        'create-op:Instagram',
        'create-op:WhatsApp',
      ]);
      // deleteMany must be the first operation in the transaction array —
      // Prisma runs a $transaction array strictly in order, so the delete
      // has to precede the creates or restoring onto a non-empty page
      // would leave duplicates instead of replacing it.
      const [firstOp] = prismaMock.$transaction.mock.calls[0][0];
      expect(firstOp).toBe('delete-op');
    });

    it('restores an empty page (a version saved with zero blocks) by only running the delete', async () => {
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
      prismaMock.pageVersion.findUnique.mockResolvedValue({
        id: 'v1',
        profileId: 'profile-1',
        snapshot: [],
      });
      prismaMock.link.deleteMany.mockReturnValue('delete-op');
      prismaMock.$transaction.mockResolvedValue([]);
      prismaMock.link.findMany.mockResolvedValue([]);

      await pageVersionsService.restore('user-1', 'v1');

      expect(prismaMock.$transaction).toHaveBeenCalledWith(['delete-op']);
      expect(prismaMock.link.create).not.toHaveBeenCalled();
    });
  });
});
