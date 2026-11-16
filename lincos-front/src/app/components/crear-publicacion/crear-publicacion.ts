import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Publicacion } from '../../models/publicacion';
import { PublicacionesService } from '../../services/publicaciones';
import { Auth } from '../../services/auth';
import { Icono } from '../icono/icono';
import { imagenValidator } from '../../validators/usuario.validators';
import { obtenerMensajeError } from '../../core/mensaje-error';

@Component({
  imports: [ReactiveFormsModule, Icono],
  selector: 'app-crear-publicacion',
  templateUrl: './crear-publicacion.html',
  styleUrl: './crear-publicacion.css',
})
export class CrearPublicacion {
  creada = output<Publicacion>(); // el feed la agrega arriba de la lista

  private publicacionesService = inject(PublicacionesService);
  usuario = inject(Auth).usuario;

  abierto = signal(false);
  enviando = signal(false);
  error = signal<string | null>(null);
  vistaPrevia = signal<string | null>(null);

  form = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
    imagen: new FormControl<File | null>(null, { validators: [imagenValidator(2)] }), // opcional
  });

  abrir() {
    this.abierto.set(true);
  }

  cancelar() {
    this.form.reset();
    this.limpiarVistaPrevia();
    this.error.set(null);
    this.abierto.set(false);
  }

  seleccionarImagen(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    const control = this.form.controls.imagen;
    control.setValue(archivo);
    control.markAsTouched();

    this.limpiarVistaPrevia();
    if (archivo && control.valid) {
      this.vistaPrevia.set(URL.createObjectURL(archivo));
    }
  }

  quitarImagen(input: HTMLInputElement) {
    input.value = ''; // permite volver a elegir el mismo archivo
    this.form.controls.imagen.setValue(null);
    this.limpiarVistaPrevia();
  }

  publicar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { titulo, descripcion, imagen } = this.form.getRawValue();
    const datos = new FormData();
    datos.append('titulo', titulo);
    datos.append('descripcion', descripcion);
    if (imagen) datos.append('imagen', imagen);

    this.enviando.set(true);
    this.error.set(null);

    this.publicacionesService.crear(datos).subscribe({
      next: (publicacion) => {
        this.creada.emit(publicacion);
        this.enviando.set(false);
        this.cancelar();
      },
      error: (e) => {
        this.error.set(obtenerMensajeError(e));
        this.enviando.set(false);
      },
    });
  }

  invalido(campo: 'titulo' | 'descripcion'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  errorImagen(): string | null {
    const errores = this.form.controls.imagen.errors;
    if (errores?.['tipoImagen']) return 'La imagen debe ser JPG, PNG o WEBP.';
    if (errores?.['tamanoImagen']) return 'La imagen no puede superar los 2 MB.';
    return null;
  }

  private limpiarVistaPrevia() {
    const anterior = this.vistaPrevia();
    if (anterior) URL.revokeObjectURL(anterior);
    this.vistaPrevia.set(null);
  }
}