import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicacion.entity.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';

export interface OpcionesListado {
  orden?: 'fecha' | 'likes';
  usuarioId?: string;
  offset?: number;
  limit?: number;
}

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario fotoPerfil';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    private usuariosService: UsuariosService,
  ) {}

  async crear(dto: CrearPublicacionDto, usuarioId: string, imagen?: string) {
    const publicacion = new this.publicacionModel({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      usuario: usuarioId,
      imagen,
    });
    const guardada = await publicacion.save();
    return guardada.populate('usuario', CAMPOS_AUTOR);
  }

  async buscarPorId(id: string) {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true }).populate('usuario', CAMPOS_AUTOR);
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe.');
    }
    return publicacion;
  }

  async listar(opciones: OpcionesListado) {
    const { orden = 'fecha', usuarioId, offset = 0, limit = 10 } = opciones;

    const filtro: Record<string, unknown> = { activa: true };
    if (usuarioId) {
      filtro['usuario'] = usuarioId;
    }

    const criterioOrden: Record<string, 1 | -1> =
      orden === 'likes' ? { cantidadLikes: -1 } : { createdAt: -1 };

    return this.publicacionModel
      .find(filtro)
      .sort(criterioOrden)
      .skip(offset)
      .limit(limit)
      .populate('usuario', CAMPOS_AUTOR);
  }

  async eliminar(id: string, usuarioId: string) {
    const publicacion = await this.publicacionModel.findById(id);
    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('La publicación no existe.');
    }

    const esDueño = publicacion.usuario.toString() === usuarioId;
    if (!esDueño) {
      const usuario = await this.usuariosService.buscarPorId(usuarioId);
      const esAdmin = usuario?.perfil === 'administrador';
      if (!esAdmin) {
        throw new ForbiddenException('No podés borrar una publicación que no es tuya.');
      }
    }

    publicacion.activa = false;
    return publicacion.save();
  }

  async darLike(id: string, usuarioId: string) {
    const publicacion = await this.buscarActivaOFallar(id);
    const idUsuario = new Types.ObjectId(usuarioId);
    const yaLeDioLike = publicacion.likes.some(u => u.equals(idUsuario));

    if (!yaLeDioLike) {
      publicacion.likes.push(idUsuario);
      publicacion.cantidadLikes += 1;
      await publicacion.save();
    }

    return publicacion.populate('usuario', CAMPOS_AUTOR);
  }

  async quitarLike(id: string, usuarioId: string) {
    const publicacion = await this.buscarActivaOFallar(id);
    const tamañoAntes = publicacion.likes.length;
    publicacion.likes = publicacion.likes.filter(u => u.toString() !== usuarioId);

    if (publicacion.likes.length !== tamañoAntes) {
      publicacion.cantidadLikes = Math.max(0, publicacion.cantidadLikes - 1);
      await publicacion.save();
    }

    return publicacion.populate('usuario', CAMPOS_AUTOR);
  }

  private async buscarActivaOFallar(id: string) {
    const publicacion = await this.publicacionModel.findById(id);
    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('La publicación no existe.');
    }
    return publicacion;
  }
}
