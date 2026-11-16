import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { Icono } from '../icono/icono';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { obtenerMensajeError } from '../../core/mensaje-error';

@Component({
  imports: [RouterLink, DatePipe, ReactiveFormsModule, Icono, TiempoRelativoPipe, NombreCompletoPipe],
  selector: 'app-publicacion-card',
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  destacada = input(false);            // versión grande, para la página de detalle
  actualizada = output<Publicacion>(); // cambió el "Lo creo" o se editó
  eliminada = output<string>();        // se dio de baja: el padre la quita

  private publicacionesService = inject(PublicacionesService);
  private auth = inject(Auth);
  private modal = inject(ModalService);

  procesando = signal(false);
  menuAbierto = signal(false);
  editando = signal(false);
  guardando = signal(false);
  errorEdicion = signal<string | null>(null);

  // La publicación es del usuario logueado
  esPropia = computed(() => this.publicacion().autor._id === this.auth.usuario()?._id);

  // Puede eliminarla el autor o un administrador (el back vuelve a verificarlo)
  puedeEliminar = computed(() => this.esPropia() || this.auth.esAdmin());

  // /\S/: al menos un carácter que no sea espacio
  formEdicion = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)],
    }),
  });

  // ---------- "Lo creo" (el Me gusta del TP) ----------

  alternarMeGusta() {
    if (this.procesando() || this.esPropia()) return;
    this.procesando.set(true);

    const actual = this.publicacion();
    const peticion = actual.meGusta
      ? this.publicacionesService.quitarMeGusta(actual._id)
      : this.publicacionesService.darMeGusta(actual._id);

    peticion.subscribe({
      next: (estado) => {
        this.actualizada.emit({ ...actual, ...estado });
        this.procesando.set(false);
      },
      error: (e) => {
        this.procesando.set(false);
        this.modal.informar('No se pudo registrar tu "Lo creo"', obtenerMensajeError(e));
      },
    });
  }

  // ---------- Edición ----------

  empezarEdicion() {
    this.menuAbierto.set(false);
    const { titulo, descripcion } = this.publicacion();
    this.formEdicion.setValue({ titulo, descripcion });
    this.errorEdicion.set(null);
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  guardarEdicion() {
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    const { titulo, descripcion } = this.formEdicion.getRawValue();
    this.guardando.set(true);
    this.errorEdicion.set(null);

    this.publicacionesService
      .editar(this.publicacion()._id, { titulo: titulo.trim(), descripcion: descripcion.trim() })
      .subscribe({
        next: (actualizada) => {
          this.actualizada.emit(actualizada);
          this.guardando.set(false);
          this.editando.set(false);
        },
        error: (e) => {
          this.errorEdicion.set(obtenerMensajeError(e));
          this.guardando.set(false);
        },
      });
  }

  invalidoEdicion(campo: 'titulo' | 'descripcion'): boolean {
    const control = this.formEdicion.controls[campo];
    return control.invalid && control.touched;
  }

  // ---------- Eliminación ----------

  confirmarEliminacion() {
    this.menuAbierto.set(false);
    const id = this.publicacion()._id;

    this.modal
      .abrir({
        titulo: 'Eliminar publicación',
        mensaje: 'La publicación y sus comentarios van a dejar de estar visibles. ¿Querés continuar?',
        textoAceptar: 'Eliminar',
        tipo: 'peligro',
      })
      .pipe(
        filter((confirmado) => confirmado), // si cancela, no sigue
        switchMap(() => this.publicacionesService.eliminar(id)),
      )
      .subscribe({
        next: () => this.eliminada.emit(id),
        error: (e) => this.modal.informar('No se pudo eliminar', obtenerMensajeError(e)),
      });
  }
}