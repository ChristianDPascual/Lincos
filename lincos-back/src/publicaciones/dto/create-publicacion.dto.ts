import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { recortar } from '../../common/recortar';

// Se usa para crear (POST) y para editar (PUT): los dos reciben título y descripción
export class CreatePublicacionDto {
  @Transform(recortar)
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres' })
  titulo: string;

  @Transform(recortar)
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(2000, { message: 'La descripción no puede superar los 2000 caracteres' })
  descripcion: string;
}