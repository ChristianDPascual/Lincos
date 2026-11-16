import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { CrearPublicacion } from '../../components/crear-publicacion/crear-publicacion';
import { Spinner } from '../../components/spinner/spinner';
import { ScrollInfinito } from '../../directives/scroll-infinito';
import { obtenerMensajeError } from '../../core/mensaje-error';

const POR_PAGINA = 5;

@Component({
  imports: [PublicacionCard, CrearPublicacion, Spinner, ScrollInfinito],
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit, OnDestroy {
  private publicacionesService = inject(PublicacionesService);
  private suscripcion?: Subscription;

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  orden = signal<OrdenPublicaciones>('fecha');
  cargando = signal(false);
  error = signal<string | null>(null);

  hayMas = computed(() => this.publicaciones().length < this.total());

  ngOnInit() {
    this.cargar(true);
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  cambiarOrden(orden: OrdenPublicaciones) {
    if (orden === this.orden()) return;
    this.orden.set(orden);
    this.cargar(true); // vuelve a empezar desde la primera página
  }

  // La llama la directiva scroll infinito al llegar al final
  cargarMas() {
    if (!this.cargando() && this.hayMas()) this.cargar(false);
  }

  reintentar() {
    this.cargar(this.publicaciones().length === 0);
  }

  // ----- Eventos que emite cada tarjeta / el formulario -----

  agregar(publicacion: Publicacion) {
    this.publicaciones.update((lista) => [publicacion, ...lista]);
    this.total.update((total) => total + 1);
  }

  reemplazar(actualizada: Publicacion) {
    this.publicaciones.update((lista) => lista.map((p) => (p._id === actualizada._id ? actualizada : p)));
  }

  quitar(id: string) {
    this.publicaciones.update((lista) => lista.filter((p) => p._id !== id));
    this.total.update((total) => total - 1);
  }

  private cargar(reiniciar: boolean) {
    this.suscripcion?.unsubscribe(); // si se cambia el orden en medio de una carga, se descarta la anterior
    this.cargando.set(true);
    this.error.set(null);
    if (reiniciar) this.publicaciones.set([]);

    const offset = this.publicaciones().length; // paginación: se pide a partir de lo que ya está cargado

    this.suscripcion = this.publicacionesService
      .listar({ orden: this.orden(), offset, limit: POR_PAGINA })
      .subscribe({
        next: (respuesta) => {
          // Se descartan repetidas: con orden por Me gusta, un Me gusta nuevo puede mover una publicación de página
          const ids = new Set(this.publicaciones().map((p) => p._id));
          const nuevas = respuesta.publicaciones.filter((p) => !ids.has(p._id));
          this.publicaciones.update((lista) => [...lista, ...nuevas]);
          this.total.set(respuesta.total);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(obtenerMensajeError(e));
          this.cargando.set(false);
        },
      });
  }
}