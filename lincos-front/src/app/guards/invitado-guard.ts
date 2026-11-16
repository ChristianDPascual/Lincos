import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Login y registro: solo sin sesión
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.estaLogueado()) return router.createUrlTree(['/publicaciones']);
  if (auth.obtenerToken()) return router.createUrlTree(['/']); // puede haber sesión: la valida la carga
  return true;
};