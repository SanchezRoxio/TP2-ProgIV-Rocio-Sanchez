import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PayloadToken } from '../tipos/payload-token.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['token'];

    if (!token) {
      throw new UnauthorizedException('No hay sesión iniciada.');
    }

    try {
      const payload = this.jwtService.verify<PayloadToken>(token);
      (request as Request & { user: PayloadToken }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('La sesión venció o el token es inválido.');
    }
  }
}
