import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DatoPorDia, DatoPorPublicacion, DatoPorUsuario, DatosEstadisticas, Periodo,
} from '../models/estadistica';

@Service()
export class EstadisticasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  // Pide las 6 estadísticas en paralelo y responde cuando llegaron todas
  obtenerTodas(periodo: Periodo): Observable<DatosEstadisticas> {
    return forkJoin({
      publicacionesPorUsuario: this.pedir<DatoPorUsuario[]>('publicaciones-por-usuario', periodo),
      comentariosPorDia: this.pedir<DatoPorDia[]>('comentarios-por-dia', periodo),
      comentariosPorPublicacion: this.pedir<DatoPorPublicacion[]>('comentarios-por-publicacion', periodo),
      ingresosPorUsuario: this.pedir<DatoPorUsuario[]>('ingresos-por-usuario', periodo),
      visitasPorPerfil: this.pedir<DatoPorUsuario[]>('visitas-por-perfil', periodo),
      meGustaPorDia: this.pedir<DatoPorDia[]>('me-gusta-por-dia', periodo),
    });
  }

  private pedir<T>(ruta: string, periodo: Periodo): Observable<T> {
    return this.http.get<T>(`${this.url}/${ruta}`, { params: { desde: periodo.desde, hasta: periodo.hasta } });
  }
}