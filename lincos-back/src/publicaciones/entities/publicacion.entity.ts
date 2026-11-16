import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true, versionKey: false })
export class Publicacion {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  titulo: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  descripcion: string;

  @Prop({ type: String, default: null })
  imagen: string | null;

  // Contadores: se actualizan con $inc al marcar "Lo creo" y al comentar.
  // Permiten ordenar el feed sin contar documentos en cada consulta.
  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: 0 })
  cantidadComentarios: number;

  // Se marca cuando el autor edita el título o la descripción
  @Prop({ default: false })
  editada: boolean;

  // Baja lógica: la publicación no se borra, se oculta
  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

// Índices para los dos ordenamientos del feed
PublicacionSchema.index({ activa: 1, createdAt: -1 });
PublicacionSchema.index({ activa: 1, cantidadMeGusta: -1, createdAt: -1 });