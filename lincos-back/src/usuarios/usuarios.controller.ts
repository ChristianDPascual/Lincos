import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioAdminDto } from './dto/create-usuario-admin.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { AdminGuard } from '../guards/admin/admin.guard';
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import type { PayloadToken } from '../auth/payload-token';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe';
import { opcionesImagen } from '../file/opciones-imagen';

@Controller('usuarios')
@UseGuards(AuthGuard) // todas las rutas requieren token; las de administración, además, AdminGuard
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /usuarios/perfil/:nombreUsuario → 200 / 404 (sprint 5, cualquier usuario logueado)
  @Get('perfil/:nombreUsuario')
  obtenerPerfil(@Param('nombreUsuario') nombreUsuario: string, @UsuarioActual() usuario: PayloadToken) {
    return this.usuariosService.obtenerPerfilPublico(nombreUsuario, usuario.sub);
  }

  // GET /usuarios → 200 (solo admin)
  @Get()
  @UseGuards(AdminGuard)
  listar() {
    return this.usuariosService.listar();
  }

  // POST /usuarios → 201 (solo admin). Mismos datos que el registro, más el perfil.
  // Los guards se ejecutan antes que el interceptor: si no es admin, la foto ni se procesa.
  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  crear(@Body() dto: CreateUsuarioAdminDto, @UploadedFile() imagen?: Express.Multer.File) {
    if (!imagen) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }
    return this.usuariosService.registrar(dto, imagen, dto.perfil);
  }

  // DELETE /usuarios/:id → 200 (solo admin): baja lógica, el usuario queda deshabilitado
  @Delete(':id')
  @UseGuards(AdminGuard)
  deshabilitar(@Param('id', ParseMongoIdPipe) id: string, @UsuarioActual() admin: PayloadToken) {
    return this.usuariosService.cambiarHabilitado(id, false, admin.sub);
  }

  // POST /usuarios/:id/habilitar → 200 (solo admin): alta lógica
  @Post(':id/habilitar')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK) // no crea nada: rehabilita un usuario existente
  habilitar(@Param('id', ParseMongoIdPipe) id: string, @UsuarioActual() admin: PayloadToken) {
    return this.usuariosService.cambiarHabilitado(id, true, admin.sub);
  }
}