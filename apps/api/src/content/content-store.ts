import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { ApiConfig } from '../config.js';

export interface StoredContent {
  data: Uint8Array;
  contentType: string;
}

/**
 * The content repository: images and other files, under structured keys such as
 * `catalogs/<catalog>/<id>/<file>`.
 */
export interface ContentStore {
  put(key: string, content: StoredContent): Promise<void>;
  get(key: string): Promise<StoredContent | undefined>;
  delete(keys: readonly string[]): Promise<void>;
}

/** Keeps content in memory: for tests, and for running without object storage. */
export class MemoryContentStore implements ContentStore {
  private readonly objects = new Map<string, StoredContent>();

  put(key: string, content: StoredContent) {
    this.objects.set(key, content);
    return Promise.resolve();
  }
  get(key: string) {
    return Promise.resolve(this.objects.get(key));
  }
  delete(keys: readonly string[]) {
    for (const key of keys) this.objects.delete(key);
    return Promise.resolve();
  }
}

/** Keeps content in an S3-compatible bucket (MinIO locally). */
export class S3ContentStore implements ContentStore {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: NonNullable<ApiConfig['s3']>) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: config.region,
      ...(config.endpoint ? { endpoint: config.endpoint } : {}),
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }

  /** Creates the bucket if it doesn't exist. */
  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async put(key: string, content: StoredContent) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content.data,
        ContentType: content.contentType,
      }),
    );
  }

  async get(key: string) {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!result.Body) return undefined;
      return {
        data: await result.Body.transformToByteArray(),
        contentType: result.ContentType ?? 'application/octet-stream',
      };
    } catch (error) {
      if (error instanceof NoSuchKey) return undefined;
      throw error;
    }
  }

  async delete(keys: readonly string[]) {
    if (!keys.length) return;
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );
  }
}
