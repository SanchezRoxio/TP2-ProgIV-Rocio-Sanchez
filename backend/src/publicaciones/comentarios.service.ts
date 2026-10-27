import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario, ComentarioDocument } from './entities/comentario.entity';

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario fotoPerfil';

@Injectable()
export class ComentariosService {
  constructor(@InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>) {}

  async crear(publicacionId: string, usuarioId: string, mensaje: string) {
    const comentario = new this.comentarioModel({
      mensaje,
      publicacion: publicacionId,
      usuario: usuarioId,
    });
    const guardado = await comentario.save();
    return guardado.populate('usuario', CAMPOS_AUTOR);
  }

  async listar(publicacionId: string, offset = 0, limit = 10) {
    return this.comentarioModel
      .find({ publicacion: publicacionId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('usuario', CAMPOS_AUTOR);
  }

  async editar(id: string, usuarioId: string, mensaje: string) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) {
      throw new NotFoundException('El comentario no existe.');
    }

    if (comentario.usuario.toString() !== usuarioId) {
      throw new ForbiddenException('No podés editar un comentario que no es tuyo.');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true;
    await comentario.save();
    return comentario.populate('usuario', CAMPOS_AUTOR);
  }
}
