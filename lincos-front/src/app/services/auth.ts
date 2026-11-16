import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatosLogin, RespuestaAuth, Usuario } from '../models/usuario';
import { ModalService } from './modal';

const CLAVE_TOKEN = 'lincos_token';

@Service()
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private modal = inject(ModalService);
  private url = `${environment.apiUrl}/auth`;

  // Estado de la sesión
  private tokenActual = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));
  readonly token = this.tokenActual.asReadonly();
  readonly usuario = signal<Usuario | null>(null);
  readonly estaLogueado = computed(() => this.usuario() !== null);
  readonly esAdmin = computed(() => this.usuario()?.perfil === 'administrador');

  login(datos: DatosLogin): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/login`, datos)
      .pipe(tap((respuesta) => this.iniciarSesion(respuesta)));
  }

  registrar(datos: FormData): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.url}/registro`, datos)
      .pipe(tap((respuesta) => this.iniciarSesion(respuesta)));
  }

  // Al abrir la app: si hay token guardado, el back confirma si sigue siendo válido
  restaurarSesion(): Observable<boolean> {
    if (!this.tokenActual()) return of(false);

    return this.http.post<Usuario>(`${this.url}/autorizar`, {}).pipe(
      tap((usuario) => this.usuario.set(usuario)),
      map(() => true),
      catchError(() => {
        this.guardarToken(null);
        return of(false);
      }),
    );
  }

  // Pide un token nuevo con 15 minutos más
  refrescar(): Observable<void> {
    return this.http.post<{ token: string }>(`${this.url}/refrescar`, {}).pipe(
      tap((respuesta) => this.guardarToken(respuesta.token)),
      map(() => undefined),
    );
  }

  // Botón "Cerrar sesión": pide confirmación con el modal propio
  confirmarCierreSesion() {
    this.modal
      .abrir({
        titulo: 'Cerrar sesión',
        mensaje: '¿Querés cerrar tu sesión en LINCOS?',
        textoAceptar: 'Cerrar sesión',
        tipo: 'peligro',
      })
      .subscribe((confirmado) => {
        if (confirmado) this.cerrarSesion();
      });
  }

  // motivo: si se cierra por vencimiento o por un 401, se le explica al usuario
  cerrarSesion(motivo?: string) {
    this.guardarToken(null);
    this.usuario.set(null);
    this.router.navigate(['/login'], { replaceUrl: true });
    if (motivo) {
      this.modal.informar('Sesión finalizada', motivo);
    }
  }

  obtenerToken(): string | null {
    return this.tokenActual();
  }

  private iniciarSesion(respuesta: RespuestaAuth) {
    this.guardarToken(respuesta.token);
    this.usuario.set(respuesta.usuario);
  }

  private guardarToken(token: string | null) {
    if (token) {
      localStorage.setItem(CLAVE_TOKEN, token);
    } else {
      localStorage.removeItem(CLAVE_TOKEN);
    }
    this.tokenActual.set(token);
  }
}