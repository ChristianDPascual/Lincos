import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import { Comentario } from '../../models/comentario';
import { ComentariosService } from '../../services/comentarios';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { Icono } from '../icono/icono';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { obtenerMensajeError } from '../../core/mensaje-error';

@Component({
  imports: [DatePipe, ReactiveFormsModule, Icono, TiempoRelativoPipe, NombreCompletoPipe],
  selector: 'app-comentario-item',
  templateUrl: './comentario-item.html',
  styleUrl: './comentario-item.css',
})
export class ComentarioItem {
  comentario = input.required<Comentario>();
  actualizado = output<Comentario>();
  eliminado = output<string>();

  private comentariosService = inject(ComentariosService);
  private auth = inject(Auth);
  private modal = inject(ModalService);

  menuAbierto = signal(false);
  editando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  esPropio = computed(() => this.comentario().autor._id === this.auth.usuario()?._id);
  puedeEliminar = computed(() => this.esPropio() || this.auth.esAdmin());

  mensaje = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)],
  });

  empezarEdicion() {
    this.menuAbierto.set(false);
    this.mensaje.setValue(this.comentario().mensaje);
    this.error.set(null);
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  guardar() {
    if (this.mensaje.invalid) {
      this.mensaje.markAsTouched();
      return;
    }

    const texto = this.mensaje.value.trim();
    if (texto === this.comentario().mensaje) {
      this.editando.set(false); // no cambió nada: no se envía
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.comentariosService.editar(this.comentario()._id, texto).subscribe({
      next: (actualizado) => {
        this.actualizado.emit(actualizado);
        this.guardando.set(false);
        this.editando.set(false);
      },
      error: (e) => {
        this.error.set(obtenerMensajeError(e));
        this.guardando.set(false);
      },
    });
  }

  confirmarEliminacion() {
    this.menuAbierto.set(false);
    const id = this.comentario()._id;

    this.modal
      .abrir({
        titulo: 'Eliminar comentario',
        mensaje: '¿Querés eliminar este comentario?',
        textoAceptar: 'Eliminar',
        tipo: 'peligro',
      })
      .pipe(
        filter((confirmado) => confirmado),
        switchMap(() => this.comentariosService.eliminar(id)),
      )
      .subscribe({
        next: () => this.eliminado.emit(id),
        error: (e) => this.modal.informar('No se pudo eliminar', obtenerMensajeError(e)),
      });
  }
}