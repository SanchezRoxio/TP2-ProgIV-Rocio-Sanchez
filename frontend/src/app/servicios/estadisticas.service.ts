import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config';

export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface PublicacionesPorUsuario {
  nombre: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  titulo: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  constructor(private http: HttpClient) {}

  private armarQuery(rango: RangoFechas): string {
    return `desde=${rango.desde}&hasta=${rango.hasta}`;
  }

  async publicacionesPorUsuario(rango: RangoFechas): Promise<PublicacionesPorUsuario[]> {
    return firstValueFrom(
      this.http.get<PublicacionesPorUsuario[]>(`${API_URL}/estadisticas/publicaciones-por-usuario?${this.armarQuery(rango)}`),
    );
  }

  async comentariosPorDia(rango: RangoFechas): Promise<ComentariosPorDia[]> {
    return firstValueFrom(
      this.http.get<ComentariosPorDia[]>(`${API_URL}/estadisticas/comentarios-por-dia?${this.armarQuery(rango)}`),
    );
  }

  async comentariosPorPublicacion(rango: RangoFechas): Promise<ComentariosPorPublicacion[]> {
    return firstValueFrom(
      this.http.get<ComentariosPorPublicacion[]>(`${API_URL}/estadisticas/comentarios-por-publicacion?${this.armarQuery(rango)}`),
    );
  }
}
