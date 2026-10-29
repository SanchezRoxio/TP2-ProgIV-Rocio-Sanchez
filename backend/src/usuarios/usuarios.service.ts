import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Usuario, UsuarioDocument } from './entities/usuario.entity.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';

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

  async listarTodos(): Promise<UsuarioDocument[]> {
    return this.usuarioModel.find().select('-password').sort({ createdAt: -1 });
  }

  async crearDesdeAdmin(dto: CrearUsuarioDto): Promise<UsuarioDocument> {
    const yaExiste = await this.existeCorreoOUsuario(dto.correo, dto.nombreUsuario);
    if (yaExiste) {
      throw new BadRequestException('El correo o el nombre de usuario ya están en uso.');
    }

    const passwordHasheada = await bcrypt.hash(dto.password, 10);
    return this.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      password: passwordHasheada,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion,
      perfil: dto.perfil,
    });
  }

  async cambiarActivo(id: string, activo: boolean): Promise<UsuarioDocument> {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe.');
    }
    usuario.activo = activo;
    return usuario.save();
  }
}
