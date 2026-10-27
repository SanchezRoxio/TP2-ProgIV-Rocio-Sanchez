import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// si cualquier pedido da 401, la sesion ya no es valida (vencio o nunca existio):
// mandamos al login para que rehaga el token
export const erroresInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
