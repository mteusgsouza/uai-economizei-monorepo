import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class UploadService {
  async uploadFile(filename: string, buffer: Buffer, contentType: string) {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
    });

    return { url: blob.url };
  }
}
