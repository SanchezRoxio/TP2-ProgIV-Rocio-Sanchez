import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

const QUINCE_MINUTOS_MS = 15 * 60 * 1000;

// en Vercel, front y back viven en dominios distintos (cross-site): el
// navegador solo manda la cookie ahi si es sameSite:'none' + secure:true.
// en local (localhost:4200 -> localhost:3000) son el mismo "site" (mismo
// hostname, distinto puerto), asi que sameSite:'lax' + secure:false alcanza
// (y hace falta, porque secure:true exige https, que no tenemos en local)
const esProduccion = !!process.env.VERCEL;

function opcionesCookie() {
  return {
    httpOnly: true,
    sameSite: esProduccion ? ('none' as const) : ('lax' as const),
    secure: esProduccion,
  };
}

function setearCookieToken(res: Response, token: string) {
  res.cookie('token', token, { ...opcionesCookie(), maxAge: QUINCE_MINUTOS_MS });
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(extname(file.originalname));
        callback(esImagen ? null : new Error('La foto de perfil debe ser una imagen.'), esImagen);
      },
    }),
  )
  async registro(
    @Body() registroDto: RegistroDto,
    @UploadedFile() foto: Express.Multer.File | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fotoPerfil = foto ? await this.cloudinaryService.subirImagen(foto.buffer) : undefined;
    const { usuario, token } = await this.authService.registrar(registroDto, fotoPerfil);
    setearCookieToken(res, token);
    return usuario;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { usuario, token } = await this.authService.login(loginDto);
    setearCookieToken(res, token);
    return usuario;
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  autorizar(@Req() req: Request) {
    return this.authService.autorizar(req.cookies?.['token']);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const nuevoToken = await this.authService.refrescar(req.cookies?.['token']);
    setearCookieToken(res, nuevoToken);
    return { mensaje: 'Sesión extendida.' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', opcionesCookie());
    return { mensaje: 'Sesión cerrada.' };
  }
}
