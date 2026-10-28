import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../servicios/auth.service';

// si cualquier pedido da 401, la sesion ya no es valida (vencio o nunca existio):
// limpiamos el estado local (para que el header deje de mostrar al usuario
// como logueado) y mandamos al login para que rehaga el token
export const erroresInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.limpiarSesionLocal();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
