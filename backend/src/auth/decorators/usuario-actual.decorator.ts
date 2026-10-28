import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PayloadToken } from '../tipos/payload-token.js';

// saca el usuario que dejo colgado el AuthGuard en request.user,
// para no repetir @Req() + request.user.sub en cada controller
export const UsuarioActual = createParamDecorator((_datos: unknown, ctx: ExecutionContext): PayloadToken => {
  const request = ctx.switchToHttp().getRequest<Request & { user: PayloadToken }>();
  return request.user;
});
