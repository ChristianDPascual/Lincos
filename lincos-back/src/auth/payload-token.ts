// Datos que viajan dentro del JWT
export interface PayloadToken {
  sub: string; // id del usuario
  nombreUsuario: string;
  perfil: 'usuario' | 'administrador';
}