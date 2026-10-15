/** Settings read from the environment. */
export interface ApiConfig {
  /** Postgres connection string; without it, edits are kept in memory. */
  databaseUrl?: string;
  /** S3-compatible storage for images; without it, images are kept in memory. */
  s3?: {
    endpoint?: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    /** Needed for MinIO and most S3-compatible services. */
    forcePathStyle: boolean;
  };
}

export function configFromEnv(env: Readonly<Record<string, string | undefined>>): ApiConfig {
  const config: ApiConfig = {};
  if (env.DATABASE_URL) config.databaseUrl = env.DATABASE_URL;
  if (env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
    config.s3 = {
      ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT } : {}),
      region: env.S3_REGION ?? 'us-east-1',
      bucket: env.S3_BUCKET ?? 'dnd-content',
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      forcePathStyle: env.S3_FORCE_PATH_STYLE !== 'false',
    };
  }
  return config;
}

/** Dependency-injection tokens for the stores and services chosen from the config. */
export const CATALOG_STORE = Symbol('CatalogStore');
export const CONTENT_STORE = Symbol('ContentStore');
export const IMAGE_GENERATOR = Symbol('ImageGenerator');
