import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// La pantalla de carga inicial no se repite si ya hay sesión activa
export const cargaGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.estaLogueado() ? router.createUrlTree(['/publicaciones']) : true;
};