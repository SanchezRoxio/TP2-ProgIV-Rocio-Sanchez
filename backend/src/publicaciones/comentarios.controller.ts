import { Body, Controller, Get, Header, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import type { PayloadToken } from '../auth/tipos/payload-token';

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
