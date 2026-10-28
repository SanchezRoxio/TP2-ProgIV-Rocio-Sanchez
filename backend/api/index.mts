import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from '../src/app.module.js';

// Vercel invoca esta funcion por cada request (no queda un server prendido
// como con app.listen() en local). Arrancar Nest completo en cada invocacion
// seria lentisimo, asi que inicializamos una sola vez y reusamos la instancia
// entre invocaciones (mientras la funcion siga "caliente").
const servidorExpress = express();
let appListaPromise: Promise<void> | null = null;

async function inicializarApp(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(servidorExpress));

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();
}

export default async function handler(req: express.Request, res: express.Response) {
  if (!appListaPromise) {
    appListaPromise = inicializarApp();
  }
  await appListaPromise;
  servidorExpress(req, res);
}
