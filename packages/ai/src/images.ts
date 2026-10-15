/** A generated image's bytes. */
export interface GeneratedImage {
  data: Uint8Array;
  contentType: string;
}

export interface ImageRequest {
  prompt: string;
}

/** Something that turns a prompt into an image. Swap providers by implementing this. */
export interface ImageGenerator {
  /** Provider and model, for records of how an image was made. */
  readonly name: string;
  generate(request: ImageRequest): Promise<GeneratedImage>;
}

export class ImageGenerationError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ImageGenerationError';
  }
}

/**
 * The look every generated image shares, so a catalog reads as one illustrated book. Appended to
 * the person's description of the subject.
 */
export const HOUSE_STYLE =
  'Illustration for a Victorian gothic horror tabletop roleplaying game, set in the late 1800s ' +
  'and early 1900s with steampunk technology and no magic. Painterly ink and wash, muted ' +
  'colours on a dark background, dramatic lighting, the subject centred and fully in frame. ' +
  'No text, lettering, captions or borders.';

export function withHouseStyle(subject: string): string {
  return `${subject.trim()}\n\n${HOUSE_STYLE}`;
}

export interface OpenAIImageOptions {
  apiKey: string;
  /** Default gpt-image-2. */
  model?: string;
  /** Default https://api.openai.com/v1. */
  baseUrl?: string;
  /** Default 1024x1024: square, for thumbnails and cards. */
  size?: string;
  fetch?: typeof globalThis.fetch;
}

interface OpenAIImageResponse {
  data?: { b64_json?: string; url?: string }[];
  error?: { message?: string };
}

/** Generates images with OpenAI's image API. */
export class OpenAIImageGenerator implements ImageGenerator {
  readonly name: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly size: string;
  private readonly fetch: typeof globalThis.fetch;

  constructor(options: OpenAIImageOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? 'gpt-image-2';
    this.baseUrl = (options.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    this.size = options.size ?? '1024x1024';
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.name = `openai/${this.model}`;
  }

  async generate({ prompt }: ImageRequest): Promise<GeneratedImage> {
    const response = await this.fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: this.model, prompt, size: this.size, n: 1 }),
    });
    const body = (await response.json().catch(() => ({}))) as OpenAIImageResponse;
    if (!response.ok) {
      throw new ImageGenerationError(
        body.error?.message ?? `Image generation failed (${String(response.status)})`,
        response.status,
      );
    }
    const image = body.data?.[0];
    if (image?.b64_json) {
      return { data: Buffer.from(image.b64_json, 'base64'), contentType: 'image/png' };
    }
    if (image?.url) {
      const download = await this.fetch(image.url);
      if (!download.ok) {
        throw new ImageGenerationError('Could not download the generated image', download.status);
      }
      return {
        data: new Uint8Array(await download.arrayBuffer()),
        contentType: download.headers.get('content-type') ?? 'image/png',
      };
    }
    throw new ImageGenerationError('The image service returned no image');
  }
}

/**
 * The configured image generator, or undefined when none is set up. Reads OPENAI_API_KEY and,
 * optionally, OPENAI_IMAGE_MODEL and OPENAI_BASE_URL.
 */
export function imageGeneratorFromEnv(
  env: Readonly<Record<string, string | undefined>>,
): ImageGenerator | undefined {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return undefined;
  return new OpenAIImageGenerator({
    apiKey,
    ...(env.OPENAI_IMAGE_MODEL ? { model: env.OPENAI_IMAGE_MODEL } : {}),
    ...(env.OPENAI_BASE_URL ? { baseUrl: env.OPENAI_BASE_URL } : {}),
  });
}
