import { IsDateString, IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CrearUsuarioDto {
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

  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.',
  })
  password: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  // a diferencia del registro publico, aca el perfil es obligatorio:
  // el admin elige a proposito si el nuevo usuario es admin o no
  @IsIn(['usuario', 'administrador'])
  perfil: string;
}
