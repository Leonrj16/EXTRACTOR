import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from './storage/storage-provider';

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async upload(userId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Formato de imagen no soportado');
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('La imagen supera el tamaño máximo de 5MB');
    }

    const stored = await this.storage.save(file);

    return this.prisma.media.create({
      data: {
        userId,
        url: stored.url,
        filename: stored.filename,
        mimeType: file.mimetype,
        size: file.size,
        provider: 'local',
      },
    });
  }
}
