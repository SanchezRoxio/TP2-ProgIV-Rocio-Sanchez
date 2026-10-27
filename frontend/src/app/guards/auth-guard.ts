import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanMatchFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.haySesion()) {
    return true;
  }

  // si no tenemos el usuario en memoria puede ser porque recien se refresco
  // la pagina en una ruta que no es la raiz (Cargando nunca corrio) — antes
  // de mandar al login de una, probamos si la cookie todavia es valida
  const sigueValida = await authService.autorizar();
  if (sigueValida) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
