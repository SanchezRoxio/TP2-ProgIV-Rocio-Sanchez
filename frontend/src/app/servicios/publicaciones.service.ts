import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config';
import { Publicacion } from '../modelos/publicacion';

export interface FiltrosListado {
  orden?: 'fecha' | 'likes';
  usuarioId?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  constructor(private http: HttpClient) {}

  async listar(filtros: FiltrosListado): Promise<Publicacion[]> {
    let params = '';
    if (filtros.orden) params += `orden=${filtros.orden}&`;
    if (filtros.usuarioId) params += `usuarioId=${filtros.usuarioId}&`;
    if (filtros.offset !== undefined) params += `offset=${filtros.offset}&`;
    if (filtros.limit !== undefined) params += `limit=${filtros.limit}&`;

    return firstValueFrom(this.http.get<Publicacion[]>(`${API_URL}/publicaciones?${params}`));
  }

  async buscarUna(id: string): Promise<Publicacion> {
    return firstValueFrom(this.http.get<Publicacion>(`${API_URL}/publicaciones/${id}`));
  }

  async crear(datos: FormData): Promise<Publicacion> {
    return firstValueFrom(this.http.post<Publicacion>(`${API_URL}/publicaciones`, datos));
  }

  async eliminar(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_URL}/publicaciones/${id}`));
  }

  async darLike(id: string): Promise<Publicacion> {
    return firstValueFrom(this.http.post<Publicacion>(`${API_URL}/publicaciones/${id}/like`, {}));
  }

  async quitarLike(id: string): Promise<Publicacion> {
    return firstValueFrom(this.http.delete<Publicacion>(`${API_URL}/publicaciones/${id}/like`));
  }
}
