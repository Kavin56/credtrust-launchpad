import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { randomBytes } from 'crypto';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

@Injectable()
export class StorageService {
  private bucket: any;

  constructor() {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'credtrust-storage-0156201953';
    this.bucket = admin.storage().bucket(bucketName);
  }

  async upload(buffer: Buffer, filename: string, contentType: string, prefix = 'private'): Promise<string> {
    const key = `${prefix}/${Date.now()}-${randomBytes(12).toString('hex')}${extname(filename)}`;
    try {
      const file = this.bucket.file(key);
      await file.save(buffer, {
        metadata: { 
          contentType,
          cacheControl: 'private, no-store'
        },
      });
      return `gs://${this.bucket.name}/${key}`;
    } catch (error: any) {
      console.warn(`GCS upload failed (${error.message}), saving to local storage.`);
      const uploadDir = join(process.cwd(), 'uploads', prefix);
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }
      const localFilename = `${Date.now()}-${randomBytes(8).toString('hex')}${extname(filename)}`;
      const localPath = join(uploadDir, localFilename);
      writeFileSync(localPath, buffer);
      return `/uploads/${prefix}/${localFilename}`;
    }
  }

  async signedUrl(storagePath: string, expiresInMs = 15 * 60 * 1000): Promise<string | null> {
    if (!storagePath) return null;
    if (storagePath.startsWith('/uploads/')) {
      return storagePath;
    }
    if (!storagePath.startsWith('gs://')) return storagePath;
    try {
      const [, , bucketName, ...keyParts] = storagePath.split('/');
      const bucket = admin.storage().bucket(bucketName || this.bucket.name);
      const [url] = await bucket.file(keyParts.join('/')).getSignedUrl({ action: 'read', expires: Date.now() + expiresInMs });
      return url;
    } catch {
      return null;
    }
  }
}
