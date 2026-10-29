import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config';
import { Usuario } from '../modelos/usuario';

export interface DatosNuevoUsuario {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  fechaNacimiento: string;
  descripcion?: string;
  perfil: 'usuario' | 'administrador';
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private http: HttpClient) {}

  async listar(): Promise<Usuario[]> {
    return firstValueFrom(this.http.get<Usuario[]>(`${API_URL}/usuarios`));
  }

  async crear(datos: DatosNuevoUsuario): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(`${API_URL}/usuarios`, datos));
  }

  async deshabilitar(id: string): Promise<Usuario> {
    return firstValueFrom(this.http.delete<Usuario>(`${API_URL}/usuarios/${id}`));
  }

  async habilitar(id: string): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(`${API_URL}/usuarios/${id}/habilitar`, {}));
  }
}
