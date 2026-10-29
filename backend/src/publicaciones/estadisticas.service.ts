import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicacion.entity.js';
import { Comentario, ComentarioDocument } from './entities/comentario.entity.js';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuario.entity.js';

function rangoFechas(desde?: string, hasta?: string) {
  const fin = hasta ? new Date(hasta) : new Date();
  fin.setHours(23, 59, 59, 999);
  const inicio = desde ? new Date(desde) : new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000);
  inicio.setHours(0, 0, 0, 0);
  return { $gte: inicio, $lte: fin };
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async publicacionesPorUsuario(desde?: string, hasta?: string) {
    return this.publicacionModel.aggregate([
      { $match: { createdAt: rangoFechas(desde, hasta) } },
      { $group: { _id: '$usuario', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.usuarioModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'usuarioInfo',
        },
      },
      { $unwind: '$usuarioInfo' },
      {
        $project: {
          _id: 0,
          nombre: { $concat: ['$usuarioInfo.nombre', ' ', '$usuarioInfo.apellido'] },
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  async comentariosPorDia(desde?: string, hasta?: string) {
    return this.comentarioModel.aggregate([
      { $match: { createdAt: rangoFechas(desde, hasta) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
      { $sort: { fecha: 1 } },
    ]);
  }

  async comentariosPorPublicacion(desde?: string, hasta?: string) {
    return this.comentarioModel.aggregate([
      { $match: { createdAt: rangoFechas(desde, hasta) } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.publicacionModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'publicacionInfo',
        },
      },
      { $unwind: '$publicacionInfo' },
      {
        $project: {
          _id: 0,
          titulo: '$publicacionInfo.titulo',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }
}
