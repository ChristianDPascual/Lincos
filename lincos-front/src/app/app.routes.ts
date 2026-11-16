import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { invitadoGuard } from './guards/invitado-guard';
import { cargaGuard } from './guards/carga-guard';

export const routes: Routes = [
  {
    // Pantalla de carga al abrir la app
    path: '',
    pathMatch: 'full',
    canActivate: [cargaGuard],
    loadComponent: () => import('./pages/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    // Las pantallas internas comparten el layout (menú lateral, barra superior, navegación móvil)
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'publicaciones',
        loadComponent: () => import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
      },
      {
        path: 'publicaciones/:id',
        loadComponent: () =>
          import('./pages/publicacion-detalle/publicacion-detalle').then((m) => m.PublicacionDetalle),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];