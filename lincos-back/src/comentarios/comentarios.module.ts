import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { Comentario, ComentarioSchema } from './entities/comentario.entity';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comentario.name, schema: ComentarioSchema }]),
    PublicacionesModule, // exporta el modelo Publicacion (para validar y actualizar el contador)
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [MongooseModule], // Estadísticas va a usar el modelo Comentario
})
export class ComentariosModule {}