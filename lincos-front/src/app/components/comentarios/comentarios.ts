import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comentario } from '../../models/comentario';
import { ComentariosService } from '../../services/comentarios';
import { Auth } from '../../services/auth';
import { ComentarioItem } from '../comentario-item/comentario-item';
import { Spinner } from '../spinner/spinner';
import { obtenerMensajeError } from '../../core/mensaje-error';

const POR_PAGINA = 3;

// Sección de comentarios de una publicación: formulario, lista y "Ver más".
// Se reutiliza en la página de detalle y en Mi perfil.
@Component({
  imports: [ReactiveFormsModule, ComentarioItem, Spinner],
  selector: 'app-comentarios',
  templateUrl: './comentarios.html',
  styleUrl: './comentarios.css',
})
export class Comentarios implements OnInit {
  idPublicacion = input.required<string>();
  cantidadCambiada = output<number>(); // +1 al comentar, -1 al eliminar: el padre actualiza el contador

  private comentariosService = inject(ComentariosService);
  usuario = inject(Auth).usuario;

  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  cargando = signal(false);
  error = signal<string | null>(null);
  enviando = signal(false);
  errorEnvio = signal<string | null>(null);

  hayMas = computed(() => this.comentarios().length < this.total());
  restantes = computed(() => this.total() - this.comentarios().length);

  form = new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)],
    }),
  });

  ngOnInit() {
    this.cargarMas();
  }

  // Primera carga y botón "Ver más": trae los siguientes 3 sin borrar los anteriores
  cargarMas() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);

    this.comentariosService.listar(this.idPublicacion(), this.comentarios().length, POR_PAGINA).subscribe({
      next: (respuesta) => {
        // Se descartan repetidos (por ejemplo, si alguien comentó mientras tanto)
        const ids = new Set(this.comentarios().map((c) => c._id));
        const nuevos = respuesta.comentarios.filter((c) => !ids.has(c._id));
        this.comentarios.update((lista) => [...lista, ...nuevos]);
        this.total.set(respuesta.total);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(obtenerMensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  comentar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorEnvio.set(null);
    const mensaje = this.form.controls.mensaje.value.trim();

    this.comentariosService.crear(this.idPublicacion(), mensaje).subscribe({
      next: (comentario) => {
        this.comentarios.update((lista) => [comentario, ...lista]); // el más nuevo, primero
        this.total.update((total) => total + 1);
        this.cantidadCambiada.emit(1);
        this.form.reset();
        this.enviando.set(false);
      },
      error: (e) => {
        this.errorEnvio.set(obtenerMensajeError(e));
        this.enviando.set(false);
      },
    });
  }

  reemplazar(actualizado: Comentario) {
    this.comentarios.update((lista) => lista.map((c) => (c._id === actualizado._id ? actualizado : c)));
  }

  quitar(id: string) {
    this.comentarios.update((lista) => lista.filter((c) => c._id !== id));
    this.total.update((total) => total - 1);
    this.cantidadCambiada.emit(-1);
  }

  mensajeInvalido(): boolean {
    const control = this.form.controls.mensaje;
    return control.invalid && control.touched;
  }
}