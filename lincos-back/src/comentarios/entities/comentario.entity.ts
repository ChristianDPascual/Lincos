import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

// createdAt se usa para ordenar (más recientes primero) y para las estadísticas por período
@Schema({ timestamps: true, versionKey: false })
export class Comentario {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 500 })
  mensaje: string;

  // El TP pide el atributo "modificado: true" cuando se edita
  @Prop({ default: false })
  modificado: boolean;

  // Baja lógica, igual que las publicaciones
  @Prop({ default: true })
  activo: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

// Índice para listar los comentarios de una publicación, del más reciente al más viejo
ComentarioSchema.index({ publicacion: 1, activo: 1, createdAt: -1 });