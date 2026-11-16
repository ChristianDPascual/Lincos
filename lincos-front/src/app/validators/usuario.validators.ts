import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PATRON_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
export const EDAD_MINIMA = 14;

export function passwordSeguraValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return PATRON_PASSWORD.test(control.value) ? null : { passwordDebil: true };
  };
}

export function clavesCoincidenValidator(campo: string, campoRepetido: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const valor = grupo.get(campo)?.value;
    const repetido = grupo.get(campoRepetido)?.value;
    return valor && repetido && valor !== repetido ? { clavesNoCoinciden: true } : null;
  };
}

export function calcularEdad(nacimiento: Date, hoy = new Date()): number {
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
  if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

// Se aplica al grupo { dia, mes, anio }
export function fechaNacimientoValidator(edadMinima: number): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const dia = Number(grupo.get('dia')?.value);
    const mes = Number(grupo.get('mes')?.value);
    const anio = Number(grupo.get('anio')?.value);
    if (!dia || !mes || !anio) return null; // de los vacíos se encarga Validators.required

    const fecha = new Date(anio, mes - 1, dia);
    // Si se elige el 31 de febrero, Date lo pasa a marzo: así se detecta una fecha inexistente
    if (fecha.getMonth() !== mes - 1) return { fechaInexistente: true };
    if (fecha > new Date()) return { fechaFutura: true };

    return calcularEdad(fecha) >= edadMinima ? null : { edadMinima: { requerida: edadMinima } };
  };
}

export function imagenValidator(maxMB: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const archivo = control.value as File | null;
    if (!archivo) return null;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      return { tipoImagen: true };
    }
    return archivo.size > maxMB * 1024 * 1024 ? { tamanoImagen: { maxMB } } : null;
  };
}