import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';
import { ComentariosModule } from '../comentarios/comentarios.module';
import { AuthModule } from '../auth/auth.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

// Cada módulo importado exporta sus modelos de Mongoose:
// Publicacion y MeGusta, Comentario, Ingreso, y Usuario y VisitaPerfil
@Module({
  imports: [PublicacionesModule, ComentariosModule, AuthModule, UsuariosModule],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}