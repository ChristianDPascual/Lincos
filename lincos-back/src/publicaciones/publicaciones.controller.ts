import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param,
  Post, Put, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import type { PayloadToken } from '../auth/payload-token';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe';
import { opcionesImagen } from '../file/opciones-imagen';

@Controller('publicaciones')
@UseGuards(AuthGuard) // todas las rutas requieren token
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /publicaciones → 201
  @Post()
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen))
  crear(
    @Body() dto: CreatePublicacionDto,
    @UsuarioActual() usuario: PayloadToken,
    @UploadedFile() imagen?: Express.Multer.File, // opcional
  ) {
    return this.publicacionesService.crear(dto, usuario.sub, imagen);
  }

  // GET /publicaciones?orden=fecha|meGusta&usuario=<id>&offset=0&limit=10 → 200
  @Get()
  listar(@Query() query: ListarPublicacionesDto, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.listar(query, usuario.sub);
  }

  // GET /publicaciones/:id → 200
  @Get(':id')
  buscarUna(@Param('id', ParseMongoIdPipe) id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.buscarUna(id, usuario.sub);
  }

  // PUT /publicaciones/:id → 200 (solo el autor; reemplaza título y descripción)
  @Put(':id')
  editar(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: CreatePublicacionDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.publicacionesService.editar(id, dto, usuario.sub);
  }

  // DELETE /publicaciones/:id → 204 (sin contenido)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseMongoIdPipe) id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.eliminar(id, usuario);
  }

  // POST /publicaciones/:id/me-gusta → 201 ("Lo creo")
  @Post(':id/me-gusta')
  darMeGusta(@Param('id', ParseMongoIdPipe) id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.darMeGusta(id, usuario.sub);
  }

  // DELETE /publicaciones/:id/me-gusta → 200 (devuelve el contador actualizado)
  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id', ParseMongoIdPipe) id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.quitarMeGusta(id, usuario.sub);
  }
}