import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dns from 'dns';

// Igual que en clase: evita errores de DNS con la URI de Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // FRONT_URL puede tener varias URLs separadas por coma (por ejemplo, Firebase y localhost).
  // Solo esos orígenes pueden consumir la API desde el navegador.
  const origenesPermitidos = (process.env.FRONT_URL ?? '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  app.enableCors({ origin: origenesPermitidos });

  // whitelist: descarta propiedades que no estén en el DTO
  // transform: convierte los datos recibidos a los tipos del DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 0.0.0.0: acepta conexiones desde fuera del contenedor (lo necesita Render)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();