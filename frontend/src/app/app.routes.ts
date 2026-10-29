import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/cargando/cargando').then(m => m.Cargando),
  },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then(m => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro),
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./componentes/publicaciones/publicaciones').then(m => m.Publicaciones),
    canMatch: [authGuard],
  },
  {
    path: 'publicaciones/:id',
    loadComponent: () => import('./componentes/publicacion-detalle/publicacion-detalle').then(m => m.PublicacionDetalle),
    canMatch: [authGuard],
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil),
    canMatch: [authGuard],
  },
  {
    path: 'dashboard/usuarios',
    loadComponent: () => import('./componentes/dashboard-usuarios/dashboard-usuarios').then(m => m.DashboardUsuarios),
    canMatch: [authGuard, adminGuard],
  },
  {
    path: 'dashboard/estadisticas',
    loadComponent: () => import('./componentes/dashboard-estadisticas/dashboard-estadisticas').then(m => m.DashboardEstadisticas),
    canMatch: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '' },
];
