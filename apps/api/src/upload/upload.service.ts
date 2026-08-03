import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

// Extensão derivada do mimetype validado pelo controller — nunca do nome
// enviado pelo cliente, que poderia forjar `.html`/`.svg` com Content-Type
// de imagem e habilitar XSS armazenado no domínio público do Blob.
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Injectable()
export class UploadService {
  async uploadFile(buffer: Buffer, contentType: string) {
    const ext = EXTENSION_BY_MIME_TYPE[contentType] ?? '.bin';
    const safeName = `${randomUUID()}${ext}`;

    const blob = await put(safeName, buffer, {
      access: 'public',
      contentType,
    });

    return { url: blob.url };
  }
}
