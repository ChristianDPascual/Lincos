import { Usuario } from './usuario';

// Datos del autor que manda el back (populate con nombre, apellido, usuario y foto)
export type AutorPublicacion = Pick<Usuario, '_id' | 'nombre' | 'apellido' | 'nombreUsuario' | 'imagenPerfil'>;

export interface Publicacion {
  _id: string;
  autor: AutorPublicacion;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  cantidadMeGusta: number;      // cantidad de "Lo creo"
  cantidadComentarios: number;
  meGusta: boolean;             // si el usuario actual marcó "Lo creo"
  editada: boolean;
  createdAt: string;
}

export interface DatosEdicionPublicacion {
  titulo: string;
  descripcion: string;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';

export interface RespuestaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
}

export interface EstadoMeGusta {
  meGusta: boolean;
  cantidadMeGusta: number;
}