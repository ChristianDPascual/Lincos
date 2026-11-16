import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.estaLogueado()) return true;
  if (auth.obtenerToken()) {
    // Token sin validar (por ejemplo, después de F5): se valida en la pantalla de carga
    // y después se vuelve a la página que se estaba viendo
    return router.createUrlTree(['/'], { queryParams: { volver: state.url } });
  }
  return router.createUrlTree(['/login']);
};