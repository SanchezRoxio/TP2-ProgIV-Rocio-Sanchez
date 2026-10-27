import { IsDateString, IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegistroDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsString()
  @MinLength(1)
  apellido: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(3)
  nombreUsuario: string;

  // minimo 8 caracteres, al menos 1 mayuscula y 1 numero
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.',
  })
  password: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'])
  perfil?: string;
}
