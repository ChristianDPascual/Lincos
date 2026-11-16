import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// Igual que el ParseIntPipe de clase, pero para los ids de Mongo (24 caracteres hexadecimales).
// Sin esto, un id mal formado provoca un error 500 en Mongoose.
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(valor: string): string {
    if (!/^[a-f\d]{24}$/i.test(valor)) {
      throw new BadRequestException('El id no es válido');
    }
    return valor;
  }
}