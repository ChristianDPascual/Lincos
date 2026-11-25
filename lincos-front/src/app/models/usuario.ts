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

// Lo que se muestra en una página de perfil.
// En el perfil de otro usuario no llegan el correo ni la fecha de nacimiento.
export interface PerfilUsuario {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  descripcion: string;
  imagenPerfil: string;
  perfil: Perfil;
  createdAt: string;
  correo?: string;
  fechaNacimiento?: string;
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