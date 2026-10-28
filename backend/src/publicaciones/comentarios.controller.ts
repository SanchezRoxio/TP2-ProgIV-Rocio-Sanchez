import { Body, Controller, Get, Header, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator.js';
import type { PayloadToken } from '../auth/tipos/payload-token.js';

@Controller()
export class ComentariosController {
  constructor(private comentariosService: ComentariosService) {}

  @Post('publicaciones/:publicacionId/comentarios')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  crear(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CrearComentarioDto,
    @UsuarioActual() usuario: PayloadToken,
  ) {
    return this.comentariosService.crear(publicacionId, usuario.sub, dto.mensaje);
  }

  @Get('publicaciones/:publicacionId/comentarios')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  listar(@Param('publicacionId') publicacionId: string, @Query() filtros: ListarComentariosDto) {
    return this.comentariosService.listar(publicacionId, filtros.offset, filtros.limit);
  }

  @Put('comentarios/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  editar(@Param('id') id: string, @Body() dto: CrearComentarioDto, @UsuarioActual() usuario: PayloadToken) {
    return this.comentariosService.editar(id, usuario.sub, dto.mensaje);
  }
}
