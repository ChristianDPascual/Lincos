import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { invitadoGuard } from './guards/invitado-guard';
import { cargaGuard } from './guards/carga-guard';
import { adminGuard } from './guards/admin-guard';

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
        // Mi perfil
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
      },
      {
        // Perfil de otro usuario (misma página, distinto contenido)
        path: 'perfil/:nombreUsuario',
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
      },
      {
        // Panel de administración: el authGuard del padre se ejecuta primero, después el adminGuard
        path: 'admin/usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin-usuarios/admin-usuarios').then((m) => m.AdminUsuarios),
      },
      {
        path: 'admin/estadisticas',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin-estadisticas/admin-estadisticas').then((m) => m.AdminEstadisticas),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];