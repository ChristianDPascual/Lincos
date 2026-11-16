import {
  ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity';
import { MeGusta } from './entities/me-gusta.entity';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { FileService } from '../file/file.service';
import { PayloadToken } from '../auth/payload-token';

// Datos del autor que se muestran en cada publicación (nunca la contraseña)
export const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

// "Lo creo" es el nombre que ve el usuario para el "Me gusta" que pide el TP
@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(MeGusta.name) private readonly meGustaModel: Model<MeGusta>,
    private readonly fileService: FileService,
  ) {}

  async crear(dto: CreatePublicacionDto, idAutor: string, imagen?: Express.Multer.File) {
    const urlImagen = imagen ? await this.fileService.subirImagen(imagen, 'publicaciones') : null;

    const publicacion = await this.publicacionModel.create({
      ...dto,
      autor: idAutor,
      imagen: urlImagen,
    });
    await publicacion.populate('autor', CAMPOS_AUTOR);

    return { ...publicacion.toObject(), meGusta: false };
  }

  async listar(query: ListarPublicacionesDto, idUsuario: string) {
    const filtro: Record<string, unknown> = { activa: true };
    if (query.usuario) {
      filtro.autor = query.usuario;
    }

    // _id como último criterio: si dos publicaciones empatan, el orden es siempre el mismo
    // y la paginación no repite ni saltea resultados
    const orden: Record<string, SortOrder> =
      query.orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(orden)
        .skip(query.offset)
        .limit(query.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.publicacionModel.countDocuments(filtro),
    ]);

    return {
      publicaciones: await this.agregarEstadoMeGusta(publicaciones, idUsuario),
      total,
    };
  }

  async buscarUna(id: string, idUsuario: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activa: true })
      .populate('autor', CAMPOS_AUTOR)
      .lean();

    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }

    const [conEstado] = await this.agregarEstadoMeGusta([publicacion], idUsuario);
    return conEstado;
  }

  async editar(id: string, dto: CreatePublicacionDto, idUsuario: string) {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true });
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }

    // Solo el autor edita: ni siquiera un administrador puede cambiar contenido ajeno
    if (publicacion.autor.toString() !== idUsuario) {
      throw new ForbiddenException('Solo podés editar tus propias publicaciones');
    }

    // Si no cambió nada, no se marca como editada
    const huboCambios = publicacion.titulo !== dto.titulo || publicacion.descripcion !== dto.descripcion;
    if (huboCambios) {
      publicacion.titulo = dto.titulo;
      publicacion.descripcion = dto.descripcion;
      publicacion.editada = true;
      await publicacion.save();
    }

    return this.buscarUna(id, idUsuario);
  }

  async eliminar(id: string, usuario: PayloadToken) {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true });
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }

    const esAutor = publicacion.autor.toString() === usuario.sub;
    const esAdmin = usuario.perfil === 'administrador';
    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No podés eliminar publicaciones de otros usuarios');
    }

    // Baja lógica: se conserva en la base, pero deja de mostrarse (y sus comentarios también)
    publicacion.activa = false;
    await publicacion.save();
  }

  async darMeGusta(id: string, idUsuario: string) {
    const publicacion = await this.obtenerActiva(id);

    // Regla de negocio: no se puede marcar "Lo creo" en una publicación propia
    if (publicacion.autor.toString() === idUsuario) {
      throw new ForbiddenException('No podés marcar "Lo creo" en tus propias publicaciones');
    }

    try {
      await this.meGustaModel.create({ usuario: idUsuario, publicacion: id });
    } catch (error: any) {
      // 11000 = índice único violado: este usuario ya lo había marcado
      if (error?.code === 11000) {
        throw new ConflictException('Ya marcaste "Lo creo" en esta publicación');
      }
      throw error;
    }

    return this.actualizarContador(id, 1, true);
  }

  async quitarMeGusta(id: string, idUsuario: string) {
    await this.obtenerActiva(id);

    const borrado = await this.meGustaModel.findOneAndDelete({ usuario: idUsuario, publicacion: id });
    if (!borrado) {
      throw new NotFoundException('No habías marcado "Lo creo" en esta publicación');
    }

    return this.actualizarContador(id, -1, false);
  }

  // ---------- Auxiliares ----------

  // Devuelve la publicación activa (solo con su autor) o responde 404
  private async obtenerActiva(id: string) {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true }).select('autor');
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }
    return publicacion;
  }

  private async actualizarContador(id: string, cambio: 1 | -1, meGusta: boolean) {
    const publicacion = await this.publicacionModel.findByIdAndUpdate(
      id,
      { $inc: { cantidadMeGusta: cambio } },
      { returnDocument: 'after' }, // devuelve el documento ya actualizado
    );
    return { meGusta, cantidadMeGusta: publicacion?.cantidadMeGusta ?? 0 };
  }

  // Agrega a cada publicación si el usuario actual marcó "Lo creo".
  // Una sola consulta para toda la página, no una por publicación.
  private async agregarEstadoMeGusta<T extends { _id: Types.ObjectId }>(publicaciones: T[], idUsuario: string) {
    const ids = publicaciones.map((p) => p._id);
    const misMeGusta = await this.meGustaModel
      .find({ usuario: idUsuario, publicacion: { $in: ids } })
      .select('publicacion')
      .lean();

    const conMeGusta = new Set(misMeGusta.map((m) => m.publicacion.toString()));
    return publicaciones.map((p) => ({ ...p, meGusta: conMeGusta.has(p._id.toString()) }));
  }
}