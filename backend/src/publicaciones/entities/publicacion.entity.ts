import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop()
  imagen: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: Usuario.name }], default: [] })
  likes: Types.ObjectId[];

  // asi se puede ordenar por cantidad de me gusta
  // con un simple .sort() de mongoose, sin armar una agregacion
  @Prop({ default: 0 })
  cantidadLikes: number;

  // baja logica: nunca se borra el documento de verdad
  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
