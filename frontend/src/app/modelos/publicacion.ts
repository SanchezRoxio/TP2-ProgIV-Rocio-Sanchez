export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  fotoPerfil?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  usuario: AutorPublicacion;
  likes: string[];
  cantidadLikes: number;
  activa: boolean;
  createdAt: string;
}
