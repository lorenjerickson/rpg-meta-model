import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
