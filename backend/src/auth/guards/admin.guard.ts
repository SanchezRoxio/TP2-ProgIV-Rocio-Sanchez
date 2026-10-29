import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PayloadToken } from '../tipos/payload-token.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['token'];

    if (!token) {
      throw new UnauthorizedException('No hay sesión iniciada.');
    }

    let payload: PayloadToken;
    try {
      payload = this.jwtService.verify<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('La sesión venció o el token es inválido.');
    }

    if (payload.perfil !== 'administrador') {
      throw new ForbiddenException('Esta acción requiere permisos de administrador.');
    }

    (request as Request & { user: PayloadToken }).user = payload;
    return true;
  }
}
