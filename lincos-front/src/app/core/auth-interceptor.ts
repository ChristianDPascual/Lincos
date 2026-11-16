import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.obtenerToken();

  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((error) => {
      // Las rutas /auth/ manejan su propio 401 (por ejemplo, credenciales incorrectas en el login)
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/')) {
        auth.cerrarSesion('Tu sesión venció. Volvé a iniciar sesión.');
      }
      return throwError(() => error); // el componente igual recibe el error
    }),
  );
};