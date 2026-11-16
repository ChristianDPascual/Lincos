import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import type { PayloadToken } from '../auth/payload-token';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe';

// Sin prefijo: las rutas de listar y crear cuelgan de la publicación,
// y las de editar y eliminar apuntan directo al comentario
@Controller()
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET /publicaciones/:id/comentarios?offset=0&limit=3 → 200
  @Get('publicaciones/:id/comentarios')
  listar(@Param('id', ParseMongoIdPipe) idPublicacion: string, @Query() query: ListarComentariosDto) {
    return this.comentariosService.listar(idPublicacion, query);
  }

  // POST /publicaciones/:id/comentarios → 201
  @Post('publicaciones/:id/comentarios')
  crear(
    @Param('id', ParseMongoIdPipe) idPublicacion: string,
    @Body() dto: CreateComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.crear(idPublicacion, dto, usuario.sub);
  }

  // PUT /comentarios/:id → 200 (solo el autor; marca modificado: true)
  @Put('comentarios/:id')
  editar(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.editar(id, dto, usuario.sub);
  }

  // DELETE /comentarios/:id → 204 (el autor o un administrador)
  @Delete('comentarios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseMongoIdPipe) id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.comentariosService.eliminar(id, usuario);
  }
}