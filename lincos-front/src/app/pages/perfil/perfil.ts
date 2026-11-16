import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones';
import { Publicacion } from '../../models/publicacion';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { Comentarios } from '../../components/comentarios/comentarios';
import { Spinner } from '../../components/spinner/spinner';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { obtenerMensajeError } from '../../core/mensaje-error';

@Component({
  imports: [DatePipe, PublicacionCard, Comentarios, Spinner, NombreCompletoPipe],
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  usuario = inject(Auth).usuario;

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.cargarUltimas();
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
    const usuario = this.usuario();
    if (!usuario) return;

    this.cargando.set(true);
    this.error.set(null);

    // Mismo endpoint que el feed, con filtro por usuario y límite de 3
    this.publicacionesService.listar({ usuario: usuario._id, limit: 3 }).subscribe({
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
}