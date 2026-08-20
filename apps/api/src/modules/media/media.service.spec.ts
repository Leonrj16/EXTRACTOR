import { BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';

describe('MediaService', () => {
  const prismaMock = {
    media: { create: jest.fn() },
  };
  const storageMock = {
    save: jest.fn(),
  };

  let mediaService: MediaService;

  beforeEach(() => {
    jest.clearAllMocks();
    mediaService = new MediaService(prismaMock as any, storageMock);
  });

  function makeFile(
    overrides: Partial<Express.Multer.File> = {},
  ): Express.Multer.File {
    return {
      mimetype: 'image/png',
      size: 1024,
      ...overrides,
    } as Express.Multer.File;
  }

  it('rejects when no file is provided', async () => {
    await expect(mediaService.upload('user-1', undefined)).rejects.toThrow(
      BadRequestException,
    );
    expect(storageMock.save).not.toHaveBeenCalled();
  });

  it('rejects an unsupported mime type', async () => {
    await expect(
      mediaService.upload('user-1', makeFile({ mimetype: 'application/pdf' })),
    ).rejects.toThrow(BadRequestException);
    expect(storageMock.save).not.toHaveBeenCalled();
  });

  it('rejects a file over the 5MB size limit', async () => {
    await expect(
      mediaService.upload('user-1', makeFile({ size: 6 * 1024 * 1024 })),
    ).rejects.toThrow(BadRequestException);
    expect(storageMock.save).not.toHaveBeenCalled();
  });

  it('stores the file and persists a media record for a valid upload', async () => {
    storageMock.save.mockResolvedValue({
      url: 'https://cdn.test/img.png',
      filename: 'img.png',
    });
    prismaMock.media.create.mockImplementation(({ data }) =>
      Promise.resolve(data),
    );

    const result = await mediaService.upload('user-1', makeFile());

    expect(storageMock.save).toHaveBeenCalled();
    expect(result).toEqual({
      userId: 'user-1',
      url: 'https://cdn.test/img.png',
      filename: 'img.png',
      mimeType: 'image/png',
      size: 1024,
      provider: 'local',
    });
  });
});
