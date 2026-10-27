import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Publicacion } from './publicacion.entity';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ required: true })
  mensaje: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Publicacion.name, required: true })
  publicacion: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;

  @Prop({ default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
