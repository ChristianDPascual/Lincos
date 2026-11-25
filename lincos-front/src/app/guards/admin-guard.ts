import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Pantallas de administración: solo para administradores.
// Si alguien escribe la URL a mano sin serlo, vuelve al feed. El back igual responde 403.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.esAdmin() ? true : router.createUrlTree(['/publicaciones']);
};