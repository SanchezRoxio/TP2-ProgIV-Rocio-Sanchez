import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';

export class ListarPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'likes'])
  orden?: 'fecha' | 'likes';

  @IsOptional()
  @IsMongoId()
  usuarioId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
