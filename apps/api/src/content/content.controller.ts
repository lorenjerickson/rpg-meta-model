import { Controller, Get, Inject, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CONTENT_STORE } from '../config.js';
import type { ContentStore } from './content-store.js';

/** Serves files from the content repository by key. Keys are unique, so they cache forever. */
@Controller('content')
export class ContentController {
  constructor(@Inject(CONTENT_STORE) private readonly content: ContentStore) {}

  @Get('*key')
  async get(@Param('key') segments: string[] | string, @Res() response: Response) {
    const key = Array.isArray(segments) ? segments.join('/') : segments;
    if (!key.startsWith('catalogs/') || key.split('/').includes('..')) {
      throw new NotFoundException();
    }
    const stored = await this.content.get(key);
    if (!stored) throw new NotFoundException();
    response
      .type(stored.contentType)
      .set('Cache-Control', 'public, max-age=31536000, immutable')
      .send(Buffer.from(stored.data));
  }
}
