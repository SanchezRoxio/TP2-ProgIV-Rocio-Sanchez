import { IsString, MinLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @MinLength(1)
  titulo: string;

  @IsString()
  @MinLength(1)
  mensaje: string;
}
