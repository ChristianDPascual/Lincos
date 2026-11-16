import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dns from 'dns';

// Igual que en clase: evita errores de DNS con la URI de Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Solo el front autorizado puede consumir la API
  app.enableCors({ origin: process.env.FRONT_URL });

  // whitelist: descarta propiedades que no estén en el DTO
  // transform: convierte los datos recibidos a los tipos del DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();