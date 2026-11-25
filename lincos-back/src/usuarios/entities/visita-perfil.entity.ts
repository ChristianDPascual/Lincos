import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// Un documento por cada visita a un perfil ajeno (las visitas al propio perfil no se guardan)
@Schema({ collection: 'visitasperfil', timestamps: { createdAt: true, updatedAt: false }, versionKey: false })
export class VisitaPerfil {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  visitante: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  perfilVisitado: mongoose.Types.ObjectId;
}

export const VisitaPerfilSchema = SchemaFactory.createForClass(VisitaPerfil);

// Índice para contar las visitas de cada perfil en un período
VisitaPerfilSchema.index({ perfilVisitado: 1, createdAt: 1 });