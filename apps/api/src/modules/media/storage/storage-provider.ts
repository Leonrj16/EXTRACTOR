export interface StoredFile {
  url: string;
  filename: string;
}

export interface StorageProvider {
  save(file: Express.Multer.File): Promise<StoredFile>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
