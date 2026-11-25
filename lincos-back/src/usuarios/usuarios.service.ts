import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PasswordHasher } from '@nestjs/authentication';
import { Usuario } from './entities/usuario.entity';
import { VisitaPerfil } from './entities/visita-perfil.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { FileService } from '../file/file.service';

const EDAD_MINIMA = 14;

// Datos que se muestran en el perfil de otro usuario: sin correo ni fecha de nacimiento
const CAMPOS_PERFIL_PUBLICO = 'nombre apellido nombreUsuario imagenPerfil descripcion perfil createdAt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    @InjectModel(VisitaPerfil.name) private readonly visitaModel: Model<VisitaPerfil>,
    private readonly fileService: FileService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  // Alta de un usuario: la usan el registro (perfil "usuario") y el panel del admin (perfil elegido).
  // Un solo lugar para las reglas: edad mínima, duplicados, foto y contraseña encriptada.
  async registrar(dto: CreateUsuarioDto, imagen: Express.Multer.File, perfil: 'usuario' | 'administrador' = 'usuario') {
    const fechaNacimiento = new Date(dto.fechaNacimiento);
    if (this.calcularEdad(fechaNacimiento) < EDAD_MINIMA) {
      throw new BadRequestException(`Tenés que tener al menos ${EDAD_MINIMA} años para registrarte`);
    }

    // Se verifica antes de subir la imagen, para no dejar fotos huérfanas en Cloudinary
    await this.verificarDisponibilidad(dto.correo, dto.nombreUsuario);
    const imagenPerfil = await this.fileService.subirImagen(imagen, 'usuarios');
    const password = await this.passwordHasher.hash(dto.password);

    return this.crear({ ...dto, fechaNacimiento, password, imagenPerfil, perfil });
  }

  // ---------- Administración (sprint 4) ----------

  listar() {
    // lean() no pasa por el toJSON del schema: la contraseña se excluye explícitamente
    return this.usuarioModel.find().select('-password').sort({ createdAt: -1 }).lean();
  }

  // Baja y alta lógica: el usuario no se borra, se cambia "habilitado"
  async cambiarHabilitado(id: string, habilitado: boolean, idAdmin: string) {
    if (!habilitado && id === idAdmin) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }

    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { habilitado }, { returnDocument: 'after' })
      .select('-password');

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return usuario;
  }

  // ---------- Perfil de otros usuarios (sprint 5) ----------

  // Devuelve los datos públicos y registra la visita
  async obtenerPerfilPublico(nombreUsuario: string, idVisitante: string) {
    const perfil = await this.usuarioModel
      .findOne({ nombreUsuario: nombreUsuario.toLowerCase().trim(), habilitado: true })
      .select(CAMPOS_PERFIL_PUBLICO)
      .lean();

    if (!perfil) {
      throw new NotFoundException('El usuario no existe');
    }

    // Las visitas al propio perfil no se cuentan
    if (perfil._id.toString() !== idVisitante) {
      await this.visitaModel.create({ visitante: idVisitante, perfilVisitado: perfil._id });
    }

    return perfil;
  }

  // ---------- Usadas por Auth ----------

  buscarPorCorreoONombre(valor: string) {
    const normalizado = valor.toLowerCase().trim();
    return this.usuarioModel.findOne({
      $or: [{ correo: normalizado }, { nombreUsuario: normalizado }],
    });
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

  // ---------- Auxiliares ----------

  private async verificarDisponibilidad(correo: string, nombreUsuario: string) {
    const correoNormalizado = correo.toLowerCase().trim();
    const usuarioNormalizado = nombreUsuario.toLowerCase().trim();

    // find (no findOne): el correo y el usuario pueden pertenecer a cuentas distintas
    const existentes = await this.usuarioModel
      .find({ $or: [{ correo: correoNormalizado }, { nombreUsuario: usuarioNormalizado }] })
      .select('correo nombreUsuario');

    const correoOcupado = existentes.some((u) => u.correo === correoNormalizado);
    const usuarioOcupado = existentes.some((u) => u.nombreUsuario === usuarioNormalizado);

    if (correoOcupado && usuarioOcupado) {
      throw new ConflictException('El correo y el nombre de usuario ya están registrados');
    }
    if (correoOcupado) {
      throw new ConflictException('El correo ya está registrado');
    }
    if (usuarioOcupado) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }
  }

  private async crear(datos: Partial<Usuario>) {
    try {
      return await this.usuarioModel.create(datos);
    } catch (error: any) {
      // 11000 = índice único violado (dos registros iguales al mismo tiempo)
      if (error?.code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya está registrado');
      }
      throw error;
    }
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