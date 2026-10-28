import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PayloadToken } from './tipos/payload-token.js';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  // saca el hash de la respuesta antes de devolver el usuario al front
  private sinPassword(usuario: UsuarioDocument) {
    const { password, ...resto } = usuario.toObject();
    return resto;
  }

  private generarToken(usuario: UsuarioDocument): string {
    const payload: PayloadToken = {
      sub: usuario._id.toString(),
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return this.jwtService.sign(payload);
  }

  async registrar(datos: RegistroDto, fotoPerfil?: string) {
    const yaExiste = await this.usuariosService.existeCorreoOUsuario(datos.correo, datos.nombreUsuario);
    if (yaExiste) {
      throw new BadRequestException('El correo o el nombre de usuario ya están en uso.');
    }

    const passwordHasheada = await bcrypt.hash(datos.password, 10);

    const usuario = await this.usuariosService.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombreUsuario: datos.nombreUsuario,
      password: passwordHasheada,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      descripcion: datos.descripcion,
      fotoPerfil,
      perfil: datos.perfil ?? 'usuario',
    });

    return { usuario: this.sinPassword(usuario), token: this.generarToken(usuario) };
  }

  async login(datos: LoginDto) {
    const usuario = await this.usuariosService.buscarPorCorreoOUsuario(datos.identificador);
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const passwordCorrecta = await bcrypt.compare(datos.password, usuario.password);
    if (!passwordCorrecta) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    return { usuario: this.sinPassword(usuario), token: this.generarToken(usuario) };
  }

  async autorizar(token: string | undefined) {
    if (!token) {
      throw new UnauthorizedException('No hay sesión iniciada.');
    }

    let payload: PayloadToken;
    try {
      payload = this.jwtService.verify<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('La sesión venció o el token es inválido.');
    }

    const usuario = await this.usuariosService.buscarPorId(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('El usuario ya no existe.');
    }

    return this.sinPassword(usuario);
  }

  async refrescar(token: string | undefined): Promise<string> {
    if (!token) {
      throw new UnauthorizedException('No hay sesión iniciada.');
    }

    let payload: PayloadToken;
    try {
      payload = this.jwtService.verify<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('La sesión venció o el token es inválido.');
    }

    // mismo payload, vencimiento nuevo de 15 minutos
    const { sub, correo, nombreUsuario, perfil } = payload;
    return this.jwtService.sign({ sub, correo, nombreUsuario, perfil });
  }
}
