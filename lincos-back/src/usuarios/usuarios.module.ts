import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';
import { VisitaPerfil, VisitaPerfilSchema } from './entities/visita-perfil.entity';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: VisitaPerfil.name, schema: VisitaPerfilSchema },
    ]),
    FileModule, // la foto de perfil se sube desde acá (registro y alta del admin)
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  // UsuariosService lo usa Auth; los modelos los va a usar Estadísticas
  exports: [UsuariosService, MongooseModule],
})
export class UsuariosModule {}