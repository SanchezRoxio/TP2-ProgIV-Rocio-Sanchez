import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

// todas las rutas de este controller son exclusivas de administradores
@UseGuards(AdminGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listar() {
    return this.usuariosService.listarTodos();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crearDesdeAdmin(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deshabilitar(@Param('id') id: string) {
    return this.usuariosService.cambiarActivo(id, false);
  }

  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param('id') id: string) {
    return this.usuariosService.cambiarActivo(id, true);
  }
}
