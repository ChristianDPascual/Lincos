import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Header: "Authorization: Bearer <token>"
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No se envió el token');
    }

    try {
      // verify comprueba la firma y el vencimiento (15 min)
      request.user = this.jwtService.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException('El token es inválido o venció');
    }
  }
}