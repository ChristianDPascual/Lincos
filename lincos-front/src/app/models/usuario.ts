export type Perfil = 'usuario' | 'administrador';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil: string;
  perfil: Perfil;
  habilitado: boolean;
  createdAt: string;
}

export interface DatosLogin {
  usuario: string; // correo o nombre de usuario
  password: string;
}

// Lo que devuelven /auth/login y /auth/registro
export interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}