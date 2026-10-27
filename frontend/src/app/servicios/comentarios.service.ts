import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config';
import { Comentario } from '../modelos/comentario';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  constructor(private http: HttpClient) {}

  async listar(publicacionId: string, offset = 0, limit = 5): Promise<Comentario[]> {
    return firstValueFrom(
      this.http.get<Comentario[]>(`${API_URL}/publicaciones/${publicacionId}/comentarios?offset=${offset}&limit=${limit}`)
    );
  }

  async crear(publicacionId: string, mensaje: string): Promise<Comentario> {
    return firstValueFrom(
      this.http.post<Comentario>(`${API_URL}/publicaciones/${publicacionId}/comentarios`, { mensaje })
    );
  }

  async editar(id: string, mensaje: string): Promise<Comentario> {
    return firstValueFrom(this.http.put<Comentario>(`${API_URL}/comentarios/${id}`, { mensaje }));
  }
}
