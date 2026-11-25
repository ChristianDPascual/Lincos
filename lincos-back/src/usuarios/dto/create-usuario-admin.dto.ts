import { IsIn } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

// Mismos datos que el registro, más el perfil (lo elige el administrador con los radio buttons)
export class CreateUsuarioAdminDto extends CreateUsuarioDto {
  @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser "usuario" o "administrador"' })
  perfil: 'usuario' | 'administrador';
}