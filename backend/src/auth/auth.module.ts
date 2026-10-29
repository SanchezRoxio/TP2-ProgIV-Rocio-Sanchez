import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './guards/auth.guard.js';
import { AdminGuard } from './guards/admin.guard.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [
    // forwardRef porque UsuariosModule a su vez necesita AdminGuard de aca
    // (UsuariosController es exclusivo de administradores)
    forwardRef(() => UsuariosModule),
    CloudinaryModule,
    // registerAsync pospone la lectura de JWT_SECRET hasta que la app arranca
    // de verdad: con register() a secas, esto se evalua apenas se importa el
    // archivo, antes de que ConfigModule.forRoot() llegue a leer el .env
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminGuard],
  exports: [JwtModule, AuthGuard, AdminGuard],
})
export class AuthModule {}
