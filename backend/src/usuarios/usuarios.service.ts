import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity.js';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}

  async buscarPorCorreoOUsuario(identificador: string): Promise<UsuarioDocument | null> {
    const valor = identificador.trim().toLowerCase();
    return this.usuarioModel.findOne({
      $or: [{ correo: valor }, { nombreUsuario: identificador.trim() }],
    });
  }

  async existeCorreoOUsuario(correo: string, nombreUsuario: string): Promise<boolean> {
    const existente = await this.usuarioModel.findOne({
      $or: [{ correo: correo.trim().toLowerCase() }, { nombreUsuario: nombreUsuario.trim() }],
    });
    return !!existente;
  }

  async crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
    const usuario = new this.usuarioModel(datos);
    return usuario.save();
  }

  async buscarPorId(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id);
  }
}
