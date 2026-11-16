import { Component, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Perfil } from '../../models/usuario';
import {
  clavesCoincidenValidator,
  EDAD_MINIMA,
  fechaNacimientoValidator,
  imagenValidator,
  passwordSeguraValidator,
} from '../../validators/usuario.validators';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-form-usuario',
  templateUrl: './form-usuario.html',
  styleUrl: './form-usuario.css',
})
export class FormUsuario {
  mostrarPerfil = input(false);
  cargando = input(false);
  textoBoton = input('Crear cuenta');
  error = input<string | null>(null); // error de la API, se muestra arriba del botón

  enviar = output<FormData>();

  vistaPrevia = signal<string | null>(null);

  // Opciones de los selects de fecha
  readonly dias = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly meses = MESES;
  readonly anios = Array.from({ length: 87 }, (_, i) => new Date().getFullYear() - EDAD_MINIMA - i);

  form = new FormGroup(
    {
      nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
      apellido: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
      correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      nombreUsuario: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.]{3,20}$/)],
      }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, passwordSeguraValidator()] }),
      repetirPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      fechaNacimiento: new FormGroup(
        {
          dia: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          mes: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          anio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        },
        { validators: fechaNacimientoValidator(EDAD_MINIMA) },
      ),
      descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
      imagenPerfil: new FormControl<File | null>(null, { validators: [Validators.required, imagenValidator(2)] }),
      perfil: new FormControl<Perfil>('usuario', { nonNullable: true }),
    },
    { validators: clavesCoincidenValidator('password', 'repetirPassword') },
  );

  // Se recalcula con cada tecla: muestra qué requisitos ya se cumplen
  requisitosPassword() {
    const valor = this.form.controls.password.value;
    return [
      { texto: '8 caracteres como mínimo', cumple: valor.length >= 8 },
      { texto: 'Una mayúscula', cumple: /[A-Z]/.test(valor) },
      { texto: 'Un número', cumple: /\d/.test(valor) },
    ];
  }

  seleccionarImagen(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    const control = this.form.controls.imagenPerfil;
    control.setValue(archivo);
    control.markAsTouched();

    const anterior = this.vistaPrevia();
    if (anterior) URL.revokeObjectURL(anterior);
    this.vistaPrevia.set(archivo && control.valid ? URL.createObjectURL(archivo) : null);
  }

  enviarFormulario() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const { dia, mes, anio } = valores.fechaNacimiento;

    const datos = new FormData();
    datos.append('nombre', valores.nombre);
    datos.append('apellido', valores.apellido);
    datos.append('correo', valores.correo);
    datos.append('nombreUsuario', valores.nombreUsuario);
    datos.append('password', valores.password);
    datos.append('fechaNacimiento', `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`); // AAAA-MM-DD
    datos.append('descripcion', valores.descripcion);
    datos.append('imagenPerfil', valores.imagenPerfil!);
    if (this.mostrarPerfil()) {
      datos.append('perfil', valores.perfil);
    }

    this.enviar.emit(datos);
  }

  mensajeError(campo: string): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched || !control.errors) return null;
    const e = control.errors;

    if (e['required']) return 'Este campo es obligatorio.';
    if (e['email']) return 'Ingresá un correo válido.';
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
    if (e['pattern']) return 'Entre 3 y 20 caracteres: letras, números, punto o guion bajo.';
    if (e['passwordDebil']) return 'La contraseña no cumple los requisitos.';
    if (e['tipoImagen']) return 'La imagen debe ser JPG, PNG o WEBP.';
    if (e['tamanoImagen']) return `La imagen no puede superar los ${e['tamanoImagen'].maxMB} MB.`;
    return null;
  }

  errorFecha(): string | null {
    const grupo = this.form.controls.fechaNacimiento;
    if (!grupo.touched) return null;

    const incompleta = Object.values(grupo.controls).some((control) => control.hasError('required'));
    if (incompleta) return 'Completá día, mes y año.';
    if (grupo.hasError('fechaInexistente')) return 'Esa fecha no existe.';
    if (grupo.hasError('fechaFutura')) return 'La fecha no puede ser futura.';
    if (grupo.hasError('edadMinima')) return `Tenés que tener al menos ${EDAD_MINIMA} años para registrarte.`;
    return null;
  }

  clavesNoCoinciden(): boolean {
    return this.form.hasError('clavesNoCoinciden') && this.form.controls.repetirPassword.touched;
  }
}