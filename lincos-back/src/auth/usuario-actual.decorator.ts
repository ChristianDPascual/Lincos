import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadToken } from './payload-token';

// Devuelve el payload que el AuthGuard dejó en request.user.
// Uso: metodo(@UsuarioActual() usuario: PayloadToken)
export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PayloadToken => context.switchToHttp().getRequest().user,
);