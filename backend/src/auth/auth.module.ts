import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule,
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
  providers: [AuthService, AuthGuard],
  exports: [JwtModule, AuthGuard],
})
export class AuthModule {}
