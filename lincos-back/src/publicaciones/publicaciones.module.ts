import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { Publicacion, PublicacionSchema } from './entities/publicacion.entity';
import { MeGusta, MeGustaSchema } from './entities/me-gusta.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: MeGusta.name, schema: MeGustaSchema },
    ]),
    FileModule,
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
  exports: [MongooseModule], // Comentarios y Estadísticas van a usar estos modelos
})
export class PublicacionesModule {}