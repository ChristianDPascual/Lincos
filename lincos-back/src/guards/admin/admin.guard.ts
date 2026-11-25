import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PayloadToken } from '../../auth/payload-token';

// Se usa después del AuthGuard: el AuthGuard ya validó el token y dejó el payload en request.user.
// Uso: @UseGuards(AuthGuard, AdminGuard)
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const usuario = context.switchToHttp().getRequest().user as PayloadToken | undefined;

    if (usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede realizar esta acción');
    }
    return true;
  }
}