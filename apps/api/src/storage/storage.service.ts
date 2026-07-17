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

  async upload(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    const key = `kyc/${Date.now()}-${randomBytes(6).toString('hex')}${extname(filename)}`;
    const file = this.bucket.file(key);

    await file.save(buffer, {
      metadata: { 
        contentType,
        cacheControl: 'public, max-age=31536000'
      },
      public: true,
    });

    return `https://storage.googleapis.com/${this.bucket.name}/${key}`;
  }
}
