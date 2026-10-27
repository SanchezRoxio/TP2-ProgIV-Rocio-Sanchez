import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

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
  { path: '**', redirectTo: '' },
];
