import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatalogService } from './catalog.service.js';

/** Largest image accepted for upload. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogs: CatalogService) {}

  @Get()
  list() {
    return this.catalogs.catalogs();
  }

  @Get(':catalog')
  entries(@Param('catalog') catalog: string) {
    return this.catalogs.entries(catalog);
  }

  /** A blank entry of one kind (`?part=`, default 0) to fill in and create. */
  @Get(':catalog/new')
  draft(@Param('catalog') catalog: string, @Query('part') part?: string) {
    return this.catalogs.draft(catalog, part === undefined ? 0 : Number(part));
  }

  @Post(':catalog')
  create(@Param('catalog') catalog: string, @Body() body: { part?: unknown; entry?: unknown }) {
    if (body.part !== undefined && typeof body.part !== 'number') {
      throw new BadRequestException('Send the kind of entry as a number');
    }
    return this.catalogs.create(catalog, body.part ?? 0, body.entry);
  }

  @Get(':catalog/:id')
  entry(@Param('catalog') catalog: string, @Param('id') id: string) {
    return this.catalogs.detail(catalog, id);
  }

  @Put(':catalog/:id')
  save(
    @Param('catalog') catalog: string,
    @Param('id') id: string,
    @Body() body: { entry?: unknown },
  ) {
    return this.catalogs.save(catalog, id, body.entry);
  }

  @Delete(':catalog/:id')
  @HttpCode(204)
  remove(@Param('catalog') catalog: string, @Param('id') id: string) {
    return this.catalogs.remove(catalog, id);
  }

  @Delete(':catalog/:id/edits')
  revert(@Param('catalog') catalog: string, @Param('id') id: string) {
    return this.catalogs.revert(catalog, id);
  }

  @Post(':catalog/:id/image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  upload(
    @Param('catalog') catalog: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('Send the image as a "file" form field');
    return this.catalogs.uploadImage(catalog, id, file.buffer);
  }

  @Post(':catalog/:id/image/generate')
  generate(
    @Param('catalog') catalog: string,
    @Param('id') id: string,
    @Body() body: { prompt?: unknown },
  ) {
    if (typeof body.prompt !== 'string') throw new BadRequestException('Send a prompt');
    return this.catalogs.generateImage(catalog, id, body.prompt);
  }

  @Delete(':catalog/:id/image')
  removeImage(@Param('catalog') catalog: string, @Param('id') id: string) {
    return this.catalogs.removeImage(catalog, id);
  }

  @Put(':catalog/:id/icon')
  setIcon(
    @Param('catalog') catalog: string,
    @Param('id') id: string,
    @Body() body: { icon?: unknown },
  ) {
    if (body.icon !== null && typeof body.icon !== 'string') {
      throw new BadRequestException('Send an icon name, or null for the default');
    }
    return this.catalogs.setIcon(catalog, id, body.icon);
  }
}
