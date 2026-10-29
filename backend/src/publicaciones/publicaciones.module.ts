import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { EstadisticasService } from './estadisticas.service.js';
import { Publicacion, PublicacionSchema } from './entities/publicacion.entity.js';
import { Comentario, ComentarioSchema } from './entities/comentario.entity.js';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      // el servicio de estadisticas necesita el modelo de Usuario para el
      // $lookup de "publicaciones por usuario"
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
    UsuariosModule,
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [PublicacionesController, ComentariosController, EstadisticasController],
  providers: [PublicacionesService, ComentariosService, EstadisticasService],
})
export class PublicacionesModule {}
