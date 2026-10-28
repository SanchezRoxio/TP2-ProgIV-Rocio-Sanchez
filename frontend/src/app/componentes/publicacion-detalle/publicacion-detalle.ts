import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PublicacionesService } from '../../servicios/publicaciones.service';
import { ComentariosService } from '../../servicios/comentarios.service';
import { AuthService } from '../../servicios/auth.service';
import { ModalService } from '../../servicios/modal.service';
import { Publicacion } from '../../modelos/publicacion';
import { Comentario } from '../../modelos/comentario';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { API_URL } from '../../config';

const COMENTARIOS_POR_TANDA = 5;

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [FormsModule, RouterLink, PublicacionCard, DatePipe],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css'
})
export class PublicacionDetalle {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  publicacion = signal<Publicacion | null>(null);
  comentarios = signal<Comentario[]>([]);
  hayMasComentarios = signal(true);
  cargandoMas = signal(false);
  nuevoMensaje = '';
  edicionId: string | null = null;
  mensajeEdicion = '';

  constructor() {
    this.cargarTodo();
  }

  private async cargarTodo() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.publicacion.set(await this.publicacionesService.buscarUna(id));
    await this.cargarMasComentarios();
  }

  async cargarMasComentarios() {
    const publicacionId = this.publicacion()?._id ?? this.route.snapshot.paramMap.get('id')!;
    this.cargandoMas.set(true);
    try {
      const nuevos = await this.comentariosService.listar(publicacionId, this.comentarios().length, COMENTARIOS_POR_TANDA);
      // se SUMAN a los que ya estaban, sin tapar los anteriores (a diferencia
      // del paginado con reemplazo que usamos en el feed de publicaciones)
      this.comentarios.update(actuales => [...actuales, ...nuevos]);
      this.hayMasComentarios.set(nuevos.length === COMENTARIOS_POR_TANDA);
    } finally {
      this.cargandoMas.set(false);
    }
  }

  get usuarioId(): string | undefined {
    return this.authService.usuarioActual()?._id;
  }

  esMio(comentario: Comentario): boolean {
    return comentario.usuario._id === this.usuarioId;
  }

  urlFoto(ruta?: string): string | null {
    if (!ruta) return null;
    return ruta.startsWith('http') ? ruta : `${API_URL}${ruta}`;
  }

  async comentar() {
    const publicacion = this.publicacion();
    if (!publicacion || !this.nuevoMensaje.trim()) return;

    try {
      const nuevo = await this.comentariosService.crear(publicacion._id, this.nuevoMensaje.trim());
      this.comentarios.update(actuales => [nuevo, ...actuales]);
      this.nuevoMensaje = '';
    } catch {
      this.modalService.error('No se pudo publicar el comentario.');
    }
  }

  empezarEdicion(comentario: Comentario) {
    this.edicionId = comentario._id;
    this.mensajeEdicion = comentario.mensaje;
  }

  cancelarEdicion() {
    this.edicionId = null;
    this.mensajeEdicion = '';
  }

  async guardarEdicion(comentario: Comentario) {
    if (!this.mensajeEdicion.trim()) return;
    try {
      const actualizado = await this.comentariosService.editar(comentario._id, this.mensajeEdicion.trim());
      this.comentarios.update(actuales => actuales.map(c => (c._id === actualizado._id ? actualizado : c)));
      this.cancelarEdicion();
    } catch {
      this.modalService.error('No se pudo editar el comentario.');
    }
  }

  actualizarPublicacion(publicacion: Publicacion) {
    this.publicacion.set(publicacion);
  }

  alBorrarPublicacion() {
    this.router.navigate(['/publicaciones']);
  }
}
