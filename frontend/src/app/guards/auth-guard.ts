import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.haySesion()) {
    return true;
  }

  // si no tenemos el usuario en memoria es porque recien se refresco la
  // pagina en una ruta que no es la raiz (Cargando nunca corrio). En vez de
  // validar en silencio, mandamos a Cargando (con su spinner) y le avisamos
  // a donde volver una vez que confirme si la sesion sigue siendo valida
  const destino = '/' + segments.map(s => s.path).join('/');
  return router.createUrlTree(['/'], { queryParams: { destino } });
};
