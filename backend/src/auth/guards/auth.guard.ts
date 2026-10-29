import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PayloadToken } from '../tipos/payload-token.js';
import { UsuariosService } from '../../usuarios/usuarios.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // si deshabilitaron al usuario DESPUES de que ya tenia un token valido,
    // el token por si solo seguiria pasando esta validacion: hace falta
    // volver a mirar la base para cortarlo al toque, no recien en el proximo login
    const usuario = await this.usuariosService.buscarPorId(payload.sub);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Tu cuenta fue deshabilitada.');
    }

    (request as Request & { user: PayloadToken }).user = payload;
    return true;
  }
}
