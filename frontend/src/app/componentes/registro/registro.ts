import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { ModalService } from '../../servicios/modal.service';

// al menos 8 caracteres, 1 mayuscula y 1 numero (mismo criterio que valida el backend)
const PATRON_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function passwordsIgualesValidator(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('password')?.value;
  const repetir = grupo.get('repetirPassword')?.value;
  return password === repetir ? null : { passwordsDistintas: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  cargando = false;
  archivoFotoPerfil: File | null = null;
  nombreArchivo = '';

  formulario = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.pattern(PATRON_PASSWORD)]],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: [''],
    },
    { validators: passwordsIgualesValidator }
  );

  seleccionarArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.archivoFotoPerfil = archivo;
    this.nombreArchivo = archivo?.name ?? '';
  }

  async enviar() {
    // no marcamos TODO el formulario como touched: si no, al tocar "crear cuenta"
    // una vez se ponen en rojo campos que el usuario ni llegó a completar todavía.
    // cada campo ya muestra su propio error al salir de él (blur).
    if (this.formulario.invalid) {
      this.modalService.error('Completá correctamente los campos marcados en rojo.');
      return;
    }

    this.cargando = true;
    const valores = this.formulario.getRawValue();

    const formData = new FormData();
    formData.append('nombre', valores.nombre);
    formData.append('apellido', valores.apellido);
    formData.append('correo', valores.correo);
    formData.append('nombreUsuario', valores.nombreUsuario);
    formData.append('password', valores.password);
    formData.append('fechaNacimiento', valores.fechaNacimiento);
    if (valores.descripcion) {
      formData.append('descripcion', valores.descripcion);
    }
    if (this.archivoFotoPerfil) {
      formData.append('fotoPerfil', this.archivoFotoPerfil);
    }

    try {
      await this.authService.registrar(formData);
      this.modalService.exito('¡Cuenta creada! Ya podés jugar.');
      this.router.navigate(['/publicaciones']);
    } catch (error: any) {
      const mensaje = error?.error?.message ?? 'No se pudo completar el registro.';
      this.modalService.error(Array.isArray(mensaje) ? mensaje.join(' ') : mensaje);
    } finally {
      this.cargando = false;
    }
  }
}
