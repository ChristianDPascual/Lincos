import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilUsuario, Usuario } from '../models/usuario';

@Service()
export class UsuariosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  // Perfil de otro usuario (el back registra la visita)
  obtenerPerfil(nombreUsuario: string): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.url}/perfil/${nombreUsuario}`);
  }

  // ---------- Administración (solo admin) ----------

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  // FormData: mismos datos que el registro, más el perfil y la foto
  crear(datos: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  deshabilitar(id: string): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.url}/${id}`);
  }

  habilitar(id: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.url}/${id}/habilitar`, {});
  }
}