import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// Un documento por cada login exitoso.
// createdAt indica cuándo ingresó: se usa en la estadística "ingresos por usuario".
@Schema({ collection: 'ingresos', timestamps: { createdAt: true, updatedAt: false }, versionKey: false })
export class Ingreso {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario: mongoose.Types.ObjectId;
}

export const IngresoSchema = SchemaFactory.createForClass(Ingreso);

// Índice para filtrar por período en las estadísticas
IngresoSchema.index({ createdAt: 1 });