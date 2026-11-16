import { HttpErrorResponse } from '@angular/common/http';

export function obtenerMensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Intentá de nuevo en unos segundos.';
    }
    if (error.status === 413) {
      return 'La imagen supera el tamaño permitido (2 MB).';
    }
    // Nest devuelve { message: string | string[] }
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) return mensaje.join('. ');
    if (typeof mensaje === 'string') return mensaje;
  }
  return 'Ocurrió un error inesperado.';
}