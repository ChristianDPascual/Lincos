import { Pipe, PipeTransform } from '@angular/core';

// "Hace un momento", "Hace 5 min", "Hace 2 h", "Ayer", "Hace 3 días" o la fecha
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date): string {
    const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
    if (segundos < 60) return 'Hace un momento';

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `Hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;

    return new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}