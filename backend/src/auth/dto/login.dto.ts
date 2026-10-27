import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  // acepta correo o nombre de usuario
  @IsString()
  @MinLength(1)
  identificador: string;

  @IsString()
  @MinLength(1)
  password: string;
}
