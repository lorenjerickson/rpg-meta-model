import { imageGeneratorFromEnv } from '@dnd-domain/ai';
import { Logger, Module } from '@nestjs/common';
import { CATALOG_STORE, CONTENT_STORE, IMAGE_GENERATOR, configFromEnv } from '../config.js';
import { ContentController } from '../content/content.controller.js';
import { MemoryContentStore, S3ContentStore } from '../content/content-store.js';
import { MemoryCatalogStore, PgCatalogStore } from './catalog-store.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';

const logger = new Logger('Catalog');

@Module({
  controllers: [CatalogController, ContentController],
  providers: [
    CatalogService,
    {
      provide: CATALOG_STORE,
      useFactory: async () => {
        const { databaseUrl } = configFromEnv(process.env);
        if (!databaseUrl) {
          logger.warn(
            'DATABASE_URL is not set: catalog edits are kept in memory and lost on restart',
          );
          return new MemoryCatalogStore();
        }
        const store = new PgCatalogStore(databaseUrl);
        await store.migrate();
        return store;
      },
    },
    {
      provide: CONTENT_STORE,
      useFactory: async () => {
        const { s3 } = configFromEnv(process.env);
        if (!s3) {
          logger.warn(
            'S3 storage is not configured: images are kept in memory and lost on restart',
          );
          return new MemoryContentStore();
        }
        const store = new S3ContentStore(s3);
        await store.ensureBucket();
        return store;
      },
    },
    {
      provide: IMAGE_GENERATOR,
      useFactory: () => {
        const generator = imageGeneratorFromEnv(process.env);
        if (!generator) logger.log('OPENAI_API_KEY is not set: image generation is off');
        return generator ?? null;
      },
    },
  ],
})
export class CatalogModule {}
