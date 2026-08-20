import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../config/configuration';
import type { StorageProvider, StoredFile } from './storage-provider';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async save(file: Express.Multer.File): Promise<StoredFile> {
    const localPath = this.config.get('storage.localPath', { infer: true });
    await mkdir(localPath, { recursive: true });

    const filename = `${randomUUID()}${extname(file.originalname)}`;
    await writeFile(join(localPath, filename), file.buffer);

    return { url: `/uploads/${filename}`, filename };
  }
}
