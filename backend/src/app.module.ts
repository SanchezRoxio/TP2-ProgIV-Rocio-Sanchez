import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.CONNECTION_STRING!),
    UsuariosModule,
    AuthModule,
    PublicacionesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
