import { Controller } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

// Las rutas del administrador (listar, crear, habilitar, deshabilitar) van en el sprint 4.
// Por ahora queda vacío, para no exponer el CRUD que generó el CLI sin protección.
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}
}