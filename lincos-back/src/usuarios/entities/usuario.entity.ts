import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({
  timestamps: true,   // agrega createdAt y updatedAt
  versionKey: false,  // quita el campo __v
  toJSON: {
    // Cada vez que un usuario se envía como respuesta, se quita la contraseña
    transform: (_doc, ret: any) => {
      delete ret.password;
      return ret;
    },
  },
})
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  nombreUsuario: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ required: true })
  imagenPerfil: string;

  @Prop({ type: String, enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: 'usuario' | 'administrador';

  @Prop({ default: true })
  habilitado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);