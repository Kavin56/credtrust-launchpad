import * as crypto from 'crypto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const rawKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!rawKey || rawKey.length !== 64) {
      throw new Error('Invalid ENCRYPTION_KEY. Must be a 64-character hex string (32 bytes).');
    }
    this.key = Buffer.from(rawKey, 'hex');
  }

  encrypt(text: string): string {
    if (!text) return text;
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      return `v1:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      throw new InternalServerErrorException('Encryption failed');
    }
  }

  decrypt(hash: string): string {
    if (!hash || !hash.startsWith('v1:')) return hash;
    try {
      const [, ivHex, tagHex, encryptedText] = hash.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]).toString('utf8');
    } catch (error) {
      throw new InternalServerErrorException('Decryption failed');
    }
  }

  lookupHash(text: string): string {
    return crypto.createHmac('sha256', this.key).update(text.trim().toUpperCase()).digest('hex');
  }
}
