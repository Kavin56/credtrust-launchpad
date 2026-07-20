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

  async signedUrl(storagePath: string): Promise<string | null> {
    if (!storagePath) return null;
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
      return storagePath;
    }
    // Return relative stream URL that works across all environments
    return `/api/v1/storage/view?path=${encodeURIComponent(storagePath)}`;
  }

  async getFileBuffer(storagePath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    if (!storagePath) return null;

    // Handle local disk uploads
    if (storagePath.startsWith('/uploads/')) {
      const relativePath = storagePath.substring('/uploads/'.length);
      const localPath = join(process.cwd(), 'uploads', relativePath);
      if (existsSync(localPath)) {
        const buffer = require('fs').readFileSync(localPath);
        const ext = extname(localPath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        return { buffer, contentType };
      }
      return null;
    }

    // Handle GCS gs:// paths
    if (storagePath.startsWith('gs://')) {
      try {
        const [, , bucketName, ...keyParts] = storagePath.split('/');
        const key = keyParts.join('/');
        const bucket = admin.storage().bucket(bucketName || this.bucket.name);
        const file = bucket.file(key);

        const [exists] = await file.exists();
        if (!exists) return null;

        const [buffer] = await file.download();
        const [metadata] = await file.getMetadata();

        let contentType = metadata.contentType || 'application/octet-stream';
        if (contentType === 'application/octet-stream') {
          const ext = extname(key).toLowerCase();
          if (ext === '.pdf') contentType = 'application/pdf';
          else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
          else if (ext === '.png') contentType = 'image/png';
        }

        return { buffer, contentType };
      } catch (error) {
        console.error('Error reading file from GCS:', error);
        return null;
      }
    }

    return null;
  }
}
