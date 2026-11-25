export interface DatoPorUsuario {
  nombreUsuario: string;
  cantidad: number;
}

export interface DatoPorDia {
  fecha: string; // AAAA-MM-DD
  cantidad: number;
}

export interface DatoPorPublicacion {
  titulo: string;
  cantidad: number;
}

export interface Periodo {
  desde: string; // AAAA-MM-DD
  hasta: string;
}

// Todo lo que muestra la página de estadísticas para un período
export interface DatosEstadisticas {
  publicacionesPorUsuario: DatoPorUsuario[];
  comentariosPorDia: DatoPorDia[];
  comentariosPorPublicacion: DatoPorPublicacion[];
  ingresosPorUsuario: DatoPorUsuario[];
  visitasPorPerfil: DatoPorUsuario[];
  meGustaPorDia: DatoPorDia[];
}