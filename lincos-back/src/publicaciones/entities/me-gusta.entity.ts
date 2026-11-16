import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// createdAt se guarda para la estadística "Me gusta por día" (sprint 5)
@Schema({ timestamps: { createdAt: true, updatedAt: false }, versionKey: false })
export class MeGusta {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: mongoose.Types.ObjectId;
}

export const MeGustaSchema = SchemaFactory.createForClass(MeGusta);

// Un usuario puede dar un solo Me gusta por publicación: lo garantiza la base de datos
MeGustaSchema.index({ usuario: 1, publicacion: 1 }, { unique: true });