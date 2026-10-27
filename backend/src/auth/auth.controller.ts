import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

const QUINCE_MINUTOS_MS = 15 * 60 * 1000;

function setearCookieToken(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // en produccion (https) esto va en true
    maxAge: QUINCE_MINUTOS_MS,
  });
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, nombreUnico);
        },
      }),
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
    const fotoPerfil = foto ? `/uploads/${foto.filename}` : undefined;
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
    res.clearCookie('token');
    return { mensaje: 'Sesión cerrada.' };
  }
}
