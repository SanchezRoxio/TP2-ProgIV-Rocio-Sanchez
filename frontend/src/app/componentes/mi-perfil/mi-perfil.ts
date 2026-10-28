import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import { PublicacionesService } from '../../servicios/publicaciones.service';
import { Publicacion } from '../../modelos/publicacion';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { API_URL } from '../../config';

const POR_PAGINA = 3;

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [DatePipe, PublicacionCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfil {
  authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);

  misPublicaciones = signal<Publicacion[]>([]);
  pagina = signal(1);
  hayPaginaSiguiente = signal(false);

  constructor() {
    this.cargarPagina(1);
  }

  private async cargarPagina(pagina: number) {
    const usuarioId = this.authService.usuarioActual()?._id;
    if (!usuarioId) return;

    const offset = (pagina - 1) * POR_PAGINA;
    // pedimos una de mas para saber si hay pagina siguiente, sin mostrarla
    const resultado = await this.publicacionesService.listar({ usuarioId, offset, limit: POR_PAGINA + 1 });

    this.hayPaginaSiguiente.set(resultado.length > POR_PAGINA);
    this.misPublicaciones.set(resultado.slice(0, POR_PAGINA));
    this.pagina.set(pagina);
  }

  paginaAnterior() {
    if (this.pagina() > 1) {
      this.cargarPagina(this.pagina() - 1);
    }
  }

  paginaSiguiente() {
    if (this.hayPaginaSiguiente()) {
      this.cargarPagina(this.pagina() + 1);
    }
  }

  urlFotoPerfil(ruta?: string): string | null {
    if (!ruta) return null;
    return ruta.startsWith('http') ? ruta : `${API_URL}${ruta}`;
  }

  quitarDeLaLista(id: string) {
    this.misPublicaciones.update(actuales => actuales.filter(p => p._id !== id));
  }

  actualizarEnLista(publicacion: Publicacion) {
    this.misPublicaciones.update(actuales =>
      actuales.map(p => (p._id === publicacion._id ? publicacion : p))
    );
  }
}
