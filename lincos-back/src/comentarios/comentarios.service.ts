import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario } from './entities/comentario.entity';
import { Publicacion } from '../publicaciones/entities/publicacion.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { CAMPOS_AUTOR } from '../publicaciones/publicaciones.service';
import { PayloadToken } from '../auth/payload-token';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async listar(idPublicacion: string, query: ListarComentariosDto) {
    await this.verificarPublicacionActiva(idPublicacion);

    const filtro = { publicacion: idPublicacion, activo: true };
    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 }) // más recientes primero (lo pide el TP)
        .skip(query.offset)
        .limit(query.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return { comentarios, total };
  }

  async crear(idPublicacion: string, dto: CreateComentarioDto, idAutor: string) {
    await this.verificarPublicacionActiva(idPublicacion);

    const comentario = await this.comentarioModel.create({
      publicacion: idPublicacion,
      autor: idAutor,
      mensaje: dto.mensaje,
    });

    // El contador permite mostrar la cantidad sin contar documentos en cada listado
    await this.publicacionModel.updateOne({ _id: idPublicacion }, { $inc: { cantidadComentarios: 1 } });

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario;
  }

  async editar(id: string, dto: UpdateComentarioDto, idUsuario: string) {
    const comentario = await this.obtenerActivo(id);

    if (comentario.autor.toString() !== idUsuario) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    // Solo se marca como modificado si el texto cambió
    if (comentario.mensaje !== dto.mensaje) {
      comentario.mensaje = dto.mensaje;
      comentario.modificado = true;
      await comentario.save();
    }

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario;
  }

  async eliminar(id: string, usuario: PayloadToken) {
    const comentario = await this.obtenerActivo(id);

    const esAutor = comentario.autor.toString() === usuario.sub;
    const esAdmin = usuario.perfil === 'administrador';
    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No podés eliminar comentarios de otros usuarios');
    }

    // Baja lógica
    comentario.activo = false;
    await comentario.save();
    await this.publicacionModel.updateOne(
      { _id: comentario.publicacion },
      { $inc: { cantidadComentarios: -1 } },
    );
  }

  // ---------- Auxiliares ----------

  // Un comentario solo se puede usar si él y su publicación están activos
  private async obtenerActivo(id: string) {
    const comentario = await this.comentarioModel.findOne({ _id: id, activo: true });
    if (!comentario) {
      throw new NotFoundException('El comentario no existe o fue eliminado');
    }
    await this.verificarPublicacionActiva(comentario.publicacion.toString());
    return comentario;
  }

  private async verificarPublicacionActiva(idPublicacion: string) {
    const existe = await this.publicacionModel.exists({ _id: idPublicacion, activa: true });
    if (!existe) {
      throw new NotFoundException('La publicación no existe o fue eliminada');
    }
  }
}