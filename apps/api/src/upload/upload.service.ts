import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class UploadService {
  async uploadFile(filename: string, buffer: Buffer, contentType: string) {
    const ext = extname(filename) || '.bin';
    const safeName = `${randomUUID()}${ext}`;

    const blob = await put(safeName, buffer, {
      access: 'public',
      contentType,
    });

    return { url: blob.url };
  }
}
