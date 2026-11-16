import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroCompacto',
})
export class NumeroCompactoPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
