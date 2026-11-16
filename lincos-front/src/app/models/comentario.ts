import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  publicacion: string;
  autor: AutorPublicacion;
  mensaje: string;
  modificado: boolean; // true si fue editado
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaComentarios {
  comentarios: Comentario[];
  total: number;
}