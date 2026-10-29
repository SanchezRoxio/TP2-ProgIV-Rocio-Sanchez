import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsuariosService } from '../../servicios/usuarios.service';
import { ModalService } from '../../servicios/modal.service';
import { Usuario } from '../../modelos/usuario';
import { EnfocarDirective } from '../../directivas/enfocar.directive';
import { ConfirmarAccionDirective } from '../../directivas/confirmar-accion.directive';
import { ResaltarFilaDirective } from '../../directivas/resaltar-fila.directive';
import { InicialesPipe } from '../../pipes/iniciales.pipe';

const PATRON_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, EnfocarDirective, ConfirmarAccionDirective, ResaltarFilaDirective, InicialesPipe],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private modalService = inject(ModalService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  mostrarFormulario = signal(false);
  enviando = signal(false);

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.pattern(PATRON_PASSWORD)]],
    fechaNacimiento: ['', [Validators.required]],
    descripcion: [''],
    perfil: ['usuario' as 'usuario' | 'administrador', [Validators.required]],
  });

  constructor() {
    this.cargarUsuarios();
  }

  private async cargarUsuarios() {
    this.cargando.set(true);
    try {
      this.usuarios.set(await this.usuariosService.listar());
    } catch {
      this.modalService.error('No se pudo cargar el listado de usuarios.');
    } finally {
      this.cargando.set(false);
    }
  }

  async crearUsuario() {
    if (this.formulario.invalid) {
      this.modalService.error('Completá correctamente los campos marcados en rojo.');
      return;
    }

    this.enviando.set(true);
    try {
      const nuevo = await this.usuariosService.crear(this.formulario.getRawValue());
      this.usuarios.update(actuales => [nuevo, ...actuales]);
      this.formulario.reset({ perfil: 'usuario' });
      this.mostrarFormulario.set(false);
      this.modalService.exito('Usuario creado con éxito.');
    } catch (error: any) {
      const mensaje = error?.error?.message ?? 'No se pudo crear el usuario.';
      this.modalService.error(Array.isArray(mensaje) ? mensaje.join(' ') : mensaje);
    } finally {
      this.enviando.set(false);
    }
  }

  async alternarActivo(usuario: Usuario) {
    try {
      const actualizado = usuario.activo
        ? await this.usuariosService.deshabilitar(usuario._id)
        : await this.usuariosService.habilitar(usuario._id);
      this.usuarios.update(actuales => actuales.map(u => (u._id === actualizado._id ? actualizado : u)));
    } catch {
      this.modalService.error('No se pudo actualizar el estado del usuario.');
    }
  }
}
