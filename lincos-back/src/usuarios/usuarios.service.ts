import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>) { }

  // Verifica antes de subir la imagen, para no dejar fotos huérfanas en Cloudinary
  // Verifica antes de subir la imagen, para no dejar fotos huérfanas en Cloudinary
  async verificarDisponibilidad(correo: string, nombreUsuario: string) {
    const correoNormalizado = correo.toLowerCase().trim();
    const usuarioNormalizado = nombreUsuario.toLowerCase().trim();

    // find (no findOne): el correo y el usuario pueden pertenecer a cuentas distintas
    const existentes = await this.usuarioModel
      .find({ $or: [{ correo: correoNormalizado }, { nombreUsuario: usuarioNormalizado }] })
      .select('correo nombreUsuario'); // solo los campos necesarios para comparar

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

  async crear(datos: Partial<Usuario>) {
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

  buscarPorCorreoONombre(valor: string) {
    const normalizado = valor.toLowerCase().trim();
    return this.usuarioModel.findOne({
      $or: [{ correo: normalizado }, { nombreUsuario: normalizado }],
    });
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

}