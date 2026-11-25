import { Pipe, PipeTransform } from '@angular/core';

// 950 → "950" · 1200 → "1,2 mil" · 2500000 → "2,5 M"
@Pipe({ name: 'numeroCompacto' })
export class NumeroCompactoPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (valor == null) return '0';
    return new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(valor);
  }
}