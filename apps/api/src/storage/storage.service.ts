import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { randomBytes } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private bucket: any;

  constructor() {
    this.bucket = admin.storage().bucket();
  }

  async upload(buffer: Buffer, filename: string, contentType: string, prefix = 'private'): Promise<string> {
    const key = `${prefix}/${Date.now()}-${randomBytes(12).toString('hex')}${extname(filename)}`;
    const file = this.bucket.file(key);

    await file.save(buffer, {
      metadata: { 
        contentType,
        cacheControl: 'private, no-store'
      },
    });
    return `gs://${this.bucket.name}/${key}`;
  }

  async signedUrl(storagePath: string, expiresInMs = 15 * 60 * 1000): Promise<string | null> {
    if (!storagePath?.startsWith('gs://')) return null;
    const [, , bucketName, ...keyParts] = storagePath.split('/');
    if (bucketName !== this.bucket.name || keyParts.length === 0) return null;
    const [url] = await this.bucket.file(keyParts.join('/')).getSignedUrl({ action: 'read', expires: Date.now() + expiresInMs });
    return url;
  }
}
