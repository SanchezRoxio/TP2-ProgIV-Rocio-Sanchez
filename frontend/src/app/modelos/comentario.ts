import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  mensaje: string;
  publicacion: string;
  usuario: AutorPublicacion;
  modificado: boolean;
  createdAt: string;
}
