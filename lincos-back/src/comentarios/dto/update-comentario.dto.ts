import { CreateComentarioDto } from './create-comentario.dto';

// PUT reemplaza el mensaje completo, así que valida lo mismo que la creación
// (no se usa PartialType: el mensaje es obligatorio también al editar)
export class UpdateComentarioDto extends CreateComentarioDto {}