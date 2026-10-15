import 'reflect-metadata';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MONSTERS, PROFESSIONS } from '@dnd-domain/system';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module.js';

describe('api', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports health', async () => {
    await request(server).get('/health').expect(200, { status: 'ok' });
  });

  it('serves the profession catalog', async () => {
    const response = await request(server).get('/professions').expect(200);
    expect(response.body).toHaveLength(PROFESSIONS.length);
    await request(server).get('/professions/soldier').expect(200);
    await request(server).get('/professions/alchemist').expect(404);
  });

  it('serves the bestiary', async () => {
    const response = await request(server).get('/monsters').expect(200);
    expect(response.body).toHaveLength(MONSTERS.length);
    await request(server).get('/monsters/ghoul').expect(200);
  });
});
