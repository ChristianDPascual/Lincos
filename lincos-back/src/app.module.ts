import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from '@nestjs/authentication';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { AuthModule } from './auth/auth.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),        // 1° carga el .env
    MongooseModule.forRoot(process.env.MONGO_URI!),  // 2° se conecta a Atlas
    AuthenticationModule.forRoot({                   // 3° habilita PasswordHasher
      globalGuard: false, // si queda en true, bloquea todas las rutas
      session: {},
    }),
    UsuariosModule,
    PublicacionesModule,
    ComentariosModule,
    AuthModule,
    EstadisticasModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}