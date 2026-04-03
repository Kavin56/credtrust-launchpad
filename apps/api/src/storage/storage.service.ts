import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { randomBytes } from 'crypto';
import { extname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

@Injectable()
export class StorageService {
  private client: Client;
  private bucket: string;
  private useLocal: boolean;
  private uploadDir: string;

  constructor() {
    this.useLocal = process.env.LOCAL_STORAGE === 'true';
    this.uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: Number(process.env.MINIO_PORT || 9000),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minio',
      secretKey: process.env.MINIO_SECRET_KEY || 'minio123',
    });
    this.bucket = process.env.FILE_BUCKET || 'kyc';
  }

  async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket).catch(async () => {
      await this.client.makeBucket(this.bucket, 'us-east-1');
      return true;
    });
    return exists;
  }

  async upload(buffer: Buffer, filename: string, contentType: string) {
    if (this.useLocal) {
      await mkdir(this.uploadDir, { recursive: true });
      const key = `${Date.now()}-${randomBytes(6).toString('hex')}${extname(
        filename,
      )}`;
      const fullPath = join(this.uploadDir, key);
      await writeFile(fullPath, buffer);
      const base = process.env.FILE_BASE_URL || 'http://localhost:3000';
      return `${base}/uploads/${key}`;
    }

    await this.ensureBucket();
    const key = `${Date.now()}-${randomBytes(6).toString('hex')}${extname(
      filename,
    )}`;
    await this.client.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': contentType,
    });
    const baseUrl =
      process.env.FILE_BASE_URL || 'http://localhost:9000';
    return `${baseUrl}/${this.bucket}/${key}`;
  }
}
