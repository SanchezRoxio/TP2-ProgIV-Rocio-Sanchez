import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PublicacionesService } from '../../servicios/publicaciones.service';
import { AuthService } from '../../servicios/auth.service';
import { ModalService } from '../../servicios/modal.service';
import { Publicacion } from '../../modelos/publicacion';
import { PublicacionCard } from '../publicacion-card/publicacion-card';

const POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [ReactiveFormsModule, PublicacionCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class Publicaciones {
  private fb = inject(FormBuilder);
  private publicacionesService = inject(PublicacionesService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  publicaciones = signal<Publicacion[]>([]);
  orden = signal<'fecha' | 'likes'>('fecha');
  cargando = signal(false);
  pagina = signal(1);
  hayPaginaSiguiente = signal(false);
  mostrarFormulario = signal(false);
  archivoImagen: File | null = null;
  nombreArchivo = '';

  formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required]],
    mensaje: ['', [Validators.required]],
  });

  constructor() {
    this.cargarPagina(1);
  }

  private async cargarPagina(pagina: number) {
    this.cargando.set(true);
    try {
      const offset = (pagina - 1) * POR_PAGINA;
      // pedimos una de mas para saber si hay pagina siguiente, sin mostrarla
      const resultado = await this.publicacionesService.listar({
        orden: this.orden(),
        offset,
        limit: POR_PAGINA + 1,
      });

      this.hayPaginaSiguiente.set(resultado.length > POR_PAGINA);
      this.publicaciones.set(resultado.slice(0, POR_PAGINA));
      this.pagina.set(pagina);
    } catch {
      this.modalService.error('No se pudieron cargar las publicaciones.');
    } finally {
      this.cargando.set(false);
    }
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

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    if (this.orden() === nuevoOrden) return;
    this.orden.set(nuevoOrden);
    this.cargarPagina(1);
  }

  seleccionarArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.archivoImagen = archivo;
    this.nombreArchivo = archivo?.name ?? '';
  }

  async publicar() {
    if (this.formulario.invalid) {
      this.modalService.error('Completá el título y el mensaje.');
      return;
    }

    const usuarioId = this.authService.usuarioActual()?._id;
    if (!usuarioId) return;

    const { titulo, mensaje } = this.formulario.getRawValue();
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('mensaje', mensaje);
    formData.append('usuarioId', usuarioId);
    if (this.archivoImagen) {
      formData.append('imagen', this.archivoImagen);
    }

    try {
      await this.publicacionesService.crear(formData);
      this.formulario.reset({ titulo: '', mensaje: '' });
      this.archivoImagen = null;
      this.nombreArchivo = '';
      this.mostrarFormulario.set(false);
      // la nueva publicacion es la mas reciente: volvemos a la pagina 1 para verla
      this.cambiarOrden('fecha');
      this.cargarPagina(1);
    } catch {
      this.modalService.error('No se pudo crear la publicación.');
    }
  }

  quitarDeLaLista(id: string) {
    this.publicaciones.update(actuales => actuales.filter(p => p._id !== id));
  }

  actualizarEnLista(publicacion: Publicacion) {
    this.publicaciones.update(actuales =>
      actuales.map(p => (p._id === publicacion._id ? publicacion : p))
    );
  }
}
