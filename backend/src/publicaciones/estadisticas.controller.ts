import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@UseGuards(AdminGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  @HttpCode(HttpStatus.OK)
  publicacionesPorUsuario(@Query() { desde, hasta }: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios-por-dia')
  @HttpCode(HttpStatus.OK)
  comentariosPorDia(@Query() { desde, hasta }: RangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  @HttpCode(HttpStatus.OK)
  comentariosPorPublicacion(@Query() { desde, hasta }: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}
