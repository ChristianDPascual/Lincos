import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario, RespuestaComentarios } from '../models/comentario';

@Service()
export class ComentariosService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  listar(idPublicacion: string, offset = 0, limit = 3): Observable<RespuestaComentarios> {
    return this.http.get<RespuestaComentarios>(`${this.url}/publicaciones/${idPublicacion}/comentarios`, {
      params: { offset, limit },
    });
  }

  crear(idPublicacion: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.url}/publicaciones/${idPublicacion}/comentarios`, { mensaje });
  }

  editar(id: string, mensaje: string): Observable<Comentario> {
    return this.http.put<Comentario>(`${this.url}/comentarios/${id}`, { mensaje });
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/comentarios/${id}`);
  }
}