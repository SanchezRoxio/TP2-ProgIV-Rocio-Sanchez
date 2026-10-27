import { HttpInterceptorFn } from '@angular/common/http';

// el backend guarda el JWT en una cookie httpOnly: sin esto, el navegador
// no la manda a localhost:3000 aunque el front corra en localhost:4200
export const credencialesInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
