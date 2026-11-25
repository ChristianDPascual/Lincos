import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';
import { UsuariosService } from '../../services/usuarios';
import { PublicacionesService } from '../../services/publicaciones';
import { PerfilUsuario } from '../../models/usuario';
import { Publicacion } from '../../models/publicacion';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { Comentarios } from '../../components/comentarios/comentarios';
import { Spinner } from '../../components/spinner/spinner';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { obtenerMensajeError } from '../../core/mensaje-error';
import { ImagenFallback } from '../../directives/imagen-fallback';

// Una sola página para los dos casos:
// /perfil → mi perfil  |  /perfil/:nombreUsuario → perfil de otro usuario
@Component({
  imports: [DatePipe, PublicacionCard, Comentarios, Spinner, NombreCompletoPipe, ImagenFallback],
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);
  private usuariosService = inject(UsuariosService);
  private publicacionesService = inject(PublicacionesService);

  perfil = signal<PerfilUsuario | null>(null);
  cargandoPerfil = signal(true);
  errorPerfil = signal<string | null>(null);

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  esPropio = computed(() => this.perfil()?._id === this.auth.usuario()?._id);

  ngOnInit() {
    // paramMap: si se pasa de un perfil a otro, el componente se reutiliza y vuelve a cargar
    this.route.paramMap.subscribe((params) => this.cargarPerfil(params.get('nombreUsuario')));
  }

  reemplazar(actualizada: Publicacion) {
    this.publicaciones.update((lista) => lista.map((p) => (p._id === actualizada._id ? actualizada : p)));
  }

  cambiarCantidad(idPublicacion: string, cambio: number) {
    this.publicaciones.update((lista) =>
      lista.map((p) => (p._id === idPublicacion ? { ...p, cantidadComentarios: p.cantidadComentarios + cambio } : p)),
    );
  }

  // Al eliminar una, se vuelve a pedir la lista para que siempre se vean las últimas 3
  cargarUltimas() {
    const perfil = this.perfil();
    if (!perfil) return;

    this.cargando.set(true);
    this.error.set(null);

    // Mismo endpoint que el feed, con filtro por usuario y límite de 3
    this.publicacionesService.listar({ usuario: perfil._id, limit: 3 }).subscribe({
      next: (respuesta) => {
        this.publicaciones.set(respuesta.publicaciones);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(obtenerMensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  private cargarPerfil(nombreUsuario: string | null) {
    const propio = this.auth.usuario();
    this.publicaciones.set([]);
    this.errorPerfil.set(null);

    // Sin parámetro, o con el usuario propio: se usan los datos de la sesión (no suma visita)
    if (!nombreUsuario || nombreUsuario.toLowerCase() === propio?.nombreUsuario) {
      this.perfil.set(propio);
      this.cargandoPerfil.set(false);
      this.cargarUltimas();
      return;
    }

    // Perfil de otro usuario: lo pide al back, que registra la visita
    this.cargandoPerfil.set(true);
    this.usuariosService.obtenerPerfil(nombreUsuario).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.cargandoPerfil.set(false);
        this.cargarUltimas();
      },
      error: (e) => {
        this.perfil.set(null);
        this.errorPerfil.set(obtenerMensajeError(e)); // 404 si no existe o está deshabilitado
        this.cargandoPerfil.set(false);
      },
    });
  }
}