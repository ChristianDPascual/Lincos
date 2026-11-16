import {
  BadRequestException, Body, Controller, HttpCode, HttpStatus,
  Post, Req, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { opcionesImagen } from '../file/opciones-imagen';
import { AuthGuard } from '../guards/auth/auth.guard';
import { PayloadToken } from './payload-token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  registrar(@Body() dto: CreateUsuarioDto, @UploadedFile() imagen?: Express.Multer.File) {
    if (!imagen) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }
    return this.authService.registrar(dto, imagen);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 200 con los datos del usuario si el token es válido; 401 si no (lo responde el guard)
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  autorizar(@Req() request: Request & { user: PayloadToken }) {
    return this.authService.autorizar(request.user.sub);
  }

    // 200 con { token } nuevo; 401 si el token actual es inválido o venció
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  refrescar(@Req() request: Request & { user: PayloadToken }) {
    return this.authService.refrescar(request.user.sub);
  }
}