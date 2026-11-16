import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DatosEdicionPublicacion, EstadoMeGusta, OrdenPublicaciones, Publicacion, RespuestaPublicaciones,
} from '../models/publicacion';

export interface OpcionesListado {
  orden?: OrdenPublicaciones;
  usuario?: string;
  offset?: number;
  limit?: number;
}

@Service()
export class PublicacionesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/publicaciones`;

  listar({ orden = 'fecha', usuario, offset = 0, limit = 10 }: OpcionesListado): Observable<RespuestaPublicaciones> {
    // HttpClient arma la query: ?orden=fecha&offset=0&limit=10&usuario=...
    const params: Record<string, string | number> = { orden, offset, limit };
    if (usuario) params['usuario'] = usuario;
    return this.http.get<RespuestaPublicaciones>(this.url, { params });
  }

  buscarUna(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.url}/${id}`);
  }

  crear(datos: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.url, datos);
  }

  editar(id: string, datos: DatosEdicionPublicacion): Observable<Publicacion> {
    return this.http.put<Publicacion>(`${this.url}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  darMeGusta(id: string): Observable<EstadoMeGusta> {
    return this.http.post<EstadoMeGusta>(`${this.url}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string): Observable<EstadoMeGusta> {
    return this.http.delete<EstadoMeGusta>(`${this.url}/${id}/me-gusta`);
  }
}