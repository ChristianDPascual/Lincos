import { Pipe, PipeTransform } from '@angular/core';

// Igual que el NombrePipe de clase: arma "Nombre Apellido"
@Pipe({ name: 'nombreCompleto' })
export class NombreCompletoPipe implements PipeTransform {
  transform(persona: { nombre: string; apellido: string } | null | undefined): string {
    return persona ? `${persona.nombre} ${persona.apellido}` : '';
  }
}