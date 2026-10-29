export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion?: string;
  fotoPerfil?: string;
  perfil: 'usuario' | 'administrador';
  activo: boolean;
}
