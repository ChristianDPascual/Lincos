import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { Comentarios } from '../../components/comentarios/comentarios';
import { Spinner } from '../../components/spinner/spinner';
import { obtenerMensajeError } from '../../core/mensaje-error';

@Component({
  imports: [RouterLink, PublicacionCard, Comentarios, Spinner],
  selector: 'app-publicacion-detalle',
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);

  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    // paramMap (y no snapshot): si se navega de un detalle a otro, el componente se reutiliza
    this.route.paramMap.subscribe((params) => this.cargar(params.get('id')!));
  }

  actualizar(publicacion: Publicacion) {
    this.publicacion.set(publicacion);
  }

  cambiarCantidad(cambio: number) {
    this.publicacion.update((p) => (p ? { ...p, cantidadComentarios: p.cantidadComentarios + cambio } : p));
  }

  // Si se elimina desde el detalle, se vuelve al feed
  eliminada() {
    this.router.navigate(['/publicaciones'], { replaceUrl: true });
  }

  private cargar(id: string) {
    this.cargando.set(true);
    this.error.set(null);

    this.publicacionesService.buscarUna(id).subscribe({
      next: (publicacion) => {
        this.publicacion.set(publicacion);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(obtenerMensajeError(e)); // 404 si no existe o fue eliminada
        this.cargando.set(false);
      },
    });
  }
}