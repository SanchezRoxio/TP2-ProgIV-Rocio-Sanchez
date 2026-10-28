import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator.js';
import type { PayloadToken } from '../auth/tipos/payload-token.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

const configuracionImagen = {
  storage: memoryStorage(),
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, aceptar: boolean) => void) => {
    const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(extname(file.originalname));
    callback(esImagen ? null : new Error('La imagen debe ser jpg, png, gif o webp.'), esImagen);
  },
};

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private publicacionesService: PublicacionesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('imagen', configuracionImagen))
  async crear(
    @Body() dto: CrearPublicacionDto,
    @UsuarioActual() usuario: PayloadToken,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    const imagen = archivo ? await this.cloudinaryService.subirImagen(archivo.buffer) : undefined;
    return this.publicacionesService.crear(dto, usuario.sub, imagen);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  buscarUna(@Param('id') id: string) {
    return this.publicacionesService.buscarPorId(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.eliminar(id, usuario.sub);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  darLike(@Param('id') id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.darLike(id, usuario.sub);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  quitarLike(@Param('id') id: string, @UsuarioActual() usuario: PayloadToken) {
    return this.publicacionesService.quitarLike(id, usuario.sub);
  }
}
