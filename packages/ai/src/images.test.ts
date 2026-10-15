import { describe, expect, it, vi } from 'vitest';
import {
  HOUSE_STYLE,
  ImageGenerationError,
  OpenAIImageGenerator,
  imageGeneratorFromEnv,
  withHouseStyle,
} from './images';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('OpenAI image generation', () => {
  it('posts the prompt and decodes the returned image', async () => {
    const fetch = vi.fn(() =>
      Promise.resolve(
        jsonResponse({ data: [{ b64_json: Buffer.from('png-bytes').toString('base64') }] }),
      ),
    );
    const generator = new OpenAIImageGenerator({ apiKey: 'key', fetch });
    const image = await generator.generate({ prompt: 'A ghoul' });

    expect(Buffer.from(image.data).toString()).toBe('png-bytes');
    expect(image.contentType).toBe('image/png');
    expect(generator.name).toBe('openai/gpt-image-2');
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/images/generations');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer key' });
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: 'gpt-image-2',
      prompt: 'A ghoul',
    });
  });

  it('reports the service’s error message', async () => {
    const fetch = vi.fn(() =>
      Promise.resolve(jsonResponse({ error: { message: 'Billing limit' } }, 429)),
    );
    const generator = new OpenAIImageGenerator({ apiKey: 'key', fetch });
    await expect(generator.generate({ prompt: 'x' })).rejects.toThrow(
      new ImageGenerationError('Billing limit', 429),
    );
  });

  it('is configured from the environment, or not at all', () => {
    expect(imageGeneratorFromEnv({})).toBeUndefined();
    expect(
      imageGeneratorFromEnv({ OPENAI_API_KEY: 'k', OPENAI_IMAGE_MODEL: 'gpt-image-1' })?.name,
    ).toBe('openai/gpt-image-1');
  });

  it('adds the house style to every prompt', () => {
    expect(withHouseStyle('  A brass automaton ')).toBe(`A brass automaton\n\n${HOUSE_STYLE}`);
  });
});
