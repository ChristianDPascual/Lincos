import {
  BadRequestException, ForbiddenException, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosService } from '../usuarios/usuarios.service';
import { FileService } from '../file/file.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { PayloadToken } from './payload-token';

const EDAD_MINIMA = 14;
const MENSAJE_DESHABILITADO = 'Tu cuenta está deshabilitada. Contactá a un administrador.';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: CreateUsuarioDto, imagen: Express.Multer.File) {
    // La regla de edad se valida también acá: el front se puede saltear
    const fechaNacimiento = new Date(dto.fechaNacimiento);
    if (this.calcularEdad(fechaNacimiento) < EDAD_MINIMA) {
      throw new BadRequestException(`Tenés que tener al menos ${EDAD_MINIMA} años para registrarte`);
    }

    await this.usuariosService.verificarDisponibilidad(dto.correo, dto.nombreUsuario);
    const imagenPerfil = await this.fileService.subirImagen(imagen, 'usuarios');
    const password = await this.passwordHasher.hash(dto.password);

    const usuario = await this.usuariosService.crear({ ...dto, fechaNacimiento, password, imagenPerfil });
    return this.armarRespuesta(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorCorreoONombre(dto.usuario);

    // Mensaje genérico: no revela si falló el usuario, el correo o la contraseña
    if (!usuario || !(await this.passwordHasher.verify(dto.password, usuario.password))) {
      throw new UnauthorizedException('Las credenciales ingresadas son incorrectas');
    }
    if (!usuario.habilitado) {
      throw new ForbiddenException(MENSAJE_DESHABILITADO);
    }
    return this.armarRespuesta(usuario);
  }

  // POST /auth/autorizar: el guard ya validó el token; acá se devuelven los datos actualizados
  async autorizar(idUsuario: string) {
    const usuario = await this.usuariosService.buscarPorId(idUsuario);
    if (!usuario) {
      throw new UnauthorizedException('El usuario ya no existe');
    }
    if (!usuario.habilitado) {
      throw new ForbiddenException(MENSAJE_DESHABILITADO);
    }
    return usuario;
  }

    // POST /auth/refrescar: mismas validaciones que autorizar y un token nuevo de 15 min
  async refrescar(idUsuario: string) {
    const usuario = await this.autorizar(idUsuario); // si fue deshabilitado, no se renueva
    return { token: await this.generarToken(usuario) };
  }

  private async armarRespuesta(usuario: UsuarioDocument) {
    return { token: await this.generarToken(usuario), usuario };
  }

  private generarToken(usuario: UsuarioDocument): Promise<string> {
    // Se arma un payload nuevo: el token anterior trae iat y exp, que no se pueden reutilizar
    const payload: PayloadToken = {
      sub: usuario._id.toString(),
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return this.jwtService.signAsync(payload);
  }

  private calcularEdad(nacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
    const diferenciaMeses = hoy.getUTCMonth() - nacimiento.getUTCMonth();
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getUTCDate() < nacimiento.getUTCDate())) {
      edad--; // todavía no cumplió años este año
    }
    return edad;
  }
}