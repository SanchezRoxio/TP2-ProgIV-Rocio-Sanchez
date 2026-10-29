import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { ModalService } from '../../servicios/modal.service';
import { EnfocarDirective } from '../../directivas/enfocar.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, EnfocarDirective],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  cargando = false;

  formulario = this.fb.nonNullable.group({
    identificador: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  async enviar() {
    // cada campo muestra su error al salir de él (blur); no todos de golpe
    if (this.formulario.invalid) {
      this.modalService.error('Completá correctamente los campos marcados en rojo.');
      return;
    }

    this.cargando = true;
    const { identificador, password } = this.formulario.getRawValue();

    try {
      await this.authService.login(identificador, password);
      this.router.navigate(['/publicaciones']);
    } catch (error: any) {
      const mensaje = error?.error?.message ?? 'No se pudo iniciar sesión.';
      this.modalService.error(mensaje);
    } finally {
      this.cargando = false;
    }
  }
}
