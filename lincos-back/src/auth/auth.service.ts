import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { PayloadToken } from './payload-token';
import { Ingreso } from './entities/ingreso.entity';

const MENSAJE_DESHABILITADO = 'Tu cuenta está deshabilitada. Contactá a un administrador.';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    @InjectModel(Ingreso.name) private readonly ingresoModel: Model<Ingreso>,
  ) {}

  // El alta (edad, duplicados, foto, contraseña) la resuelve UsuariosService;
  // acá solo se agrega el token para que el usuario quede logueado
  async registrar(dto: CreateUsuarioDto, imagen: Express.Multer.File) {
    const usuario = await this.usuariosService.registrar(dto, imagen);
    return this.armarRespuesta(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorCorreoONombre(dto.usuario);

    // Mensaje genérico: no revela si falló el usuario, el correo o la contraseña
    if (!usuario || !(await this.passwordHasher.verify(dto.password, usuario.password))) {
      throw new UnauthorizedException('Las credenciales ingresadas son incorrectas');
    }
    // Usuario deshabilitado por un admin: se le avisa al intentar ingresar (lo pide el TP)
    if (!usuario.habilitado) {
      throw new ForbiddenException(MENSAJE_DESHABILITADO);
    }

    // Sprint 5: se registra el ingreso para la estadística "ingresos por usuario"
    await this.ingresoModel.create({ usuario: usuario._id });

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
}