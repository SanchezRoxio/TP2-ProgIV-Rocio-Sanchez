import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../modelos/publicacion';
import { AuthService } from '../../servicios/auth.service';
import { PublicacionesService } from '../../servicios/publicaciones.service';
import { ModalService } from '../../servicios/modal.service';
import { API_URL } from '../../config';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css'
})
export class PublicacionCard {
  @Input({ required: true }) publicacion!: Publicacion;
  @Input() grande = false;
  @Input() ocultarLinkVer = false;
  @Output() eliminada = new EventEmitter<string>();
  @Output() actualizada = new EventEmitter<Publicacion>();

  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private modalService = inject(ModalService);

  procesando = false;

  get usuarioId(): string | undefined {
    return this.authService.usuarioActual()?._id;
  }

  get esMia(): boolean {
    return this.publicacion.usuario._id === this.usuarioId;
  }

  get yaLeDiLike(): boolean {
    return !!this.usuarioId && this.publicacion.likes.includes(this.usuarioId);
  }

  urlImagen(ruta?: string): string | null {
    return ruta ? `${API_URL}${ruta}` : null;
  }

  async toggleLike() {
    if (!this.usuarioId || this.procesando) return;
    this.procesando = true;
    try {
      const publicacionActualizada = this.yaLeDiLike
        ? await this.publicacionesService.quitarLike(this.publicacion._id)
        : await this.publicacionesService.darLike(this.publicacion._id);
      // no mutamos el @Input() directo: emitimos para que el padre actualice
      // su signal, que es lo que realmente le avisa a Angular que repinte
      this.actualizada.emit(publicacionActualizada);
    } catch {
      this.modalService.error('No se pudo registrar el me gusta.');
    } finally {
      this.procesando = false;
    }
  }

  async eliminar() {
    if (!this.usuarioId || this.procesando) return;
    this.procesando = true;
    try {
      await this.publicacionesService.eliminar(this.publicacion._id);
      this.eliminada.emit(this.publicacion._id);
    } catch {
      this.modalService.error('No se pudo borrar la publicación.');
    } finally {
      this.procesando = false;
    }
  }
}
