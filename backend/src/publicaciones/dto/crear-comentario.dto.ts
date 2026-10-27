import { IsString, MinLength } from 'class-validator';

export class CrearComentarioDto {
  @IsString()
  @MinLength(1)
  mensaje: string;
}
