import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Parámetros de la query: GET /publicaciones/:id/comentarios?offset=0&limit=3
export class ListarComentariosDto {
  // En la URL todo llega como texto: @Type lo convierte a número antes de validar
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset debe ser un número entero' })
  @Min(0, { message: 'offset no puede ser negativo' })
  offset: number = 0;

  // Por defecto trae 3 comentarios por página ("Ver más" pide los siguientes 3)
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser al menos 1' })
  @Max(20, { message: 'limit no puede superar 20' })
  limit: number = 3;
}