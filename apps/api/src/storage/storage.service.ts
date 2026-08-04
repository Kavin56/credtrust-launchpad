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
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
      return storagePath;
    }

    if (storagePath.startsWith('gs://')) {
      try {
        const [, , bucketName, ...keyParts] = storagePath.split('/');
        const key = keyParts.join('/');
        const bucket = admin.storage().bucket(bucketName || this.bucket.name);
        const file = bucket.file(key);

        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + expiresInMs,
        });
        return url;
      } catch (err: any) {
        console.warn('GCS V4 getSignedUrl fallback to direct URL:', err?.message || err);
        const [, , bucketName, ...keyParts] = storagePath.split('/');
        const key = keyParts.join('/');
        return `https://storage.googleapis.com/${bucketName || this.bucket.name}/${key}`;
      }
    }

    // Fallback relative stream URL for local storage
    return `/api/v1/storage/view?path=${encodeURIComponent(storagePath)}`;
  }

  async getFileBuffer(storagePath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    if (!storagePath) return null;

    const getContentTypeByExt = (filePath: string) => {
      const ext = extname(filePath).toLowerCase();
      if (ext === '.pdf') return 'application/pdf';
      if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
      if (ext === '.png') return 'image/png';
      if (ext === '.webp') return 'image/webp';
      if (ext === '.svg') return 'image/svg+xml';
      return 'application/octet-stream';
    };

    // 1. Try local disk check first for any path matching uploads/
    const cleanRelativePath = storagePath
      .replace(/^gs:\/\/[^\/]+\//, '')
      .replace(/^\/uploads\//, '')
      .replace(/^uploads\//, '')
      .replace(/^\//, '');

    const possibleLocalPaths = [
      join(process.cwd(), 'uploads', cleanRelativePath),
      join(process.cwd(), cleanRelativePath),
      join(process.cwd(), 'uploads', storagePath.replace(/^\//, '')),
    ];

    for (const localPath of possibleLocalPaths) {
      if (existsSync(localPath)) {
        try {
          const buffer = require('fs').readFileSync(localPath);
          const contentType = getContentTypeByExt(localPath);
          return { buffer, contentType };
        } catch (e) {
          console.warn(`Failed reading local file ${localPath}:`, e);
        }
      }
    }

    // 2. Handle GCS gs:// paths
    if (storagePath.startsWith('gs://')) {
      try {
        const [, , bucketName, ...keyParts] = storagePath.split('/');
        const key = keyParts.join('/');
        const bucket = admin.storage().bucket(bucketName || this.bucket.name);
        const file = bucket.file(key);

        const [exists] = await file.exists();
        if (exists) {
          const [buffer] = await file.download();
          const [metadata] = await file.getMetadata();

          let contentType = metadata.contentType || 'application/octet-stream';
          if (contentType === 'application/octet-stream') {
            contentType = getContentTypeByExt(key);
          }
          return { buffer, contentType };
        }
      } catch (error) {
        console.error('Error reading file from GCS:', error);
      }
    }

    return null;
  }
}
