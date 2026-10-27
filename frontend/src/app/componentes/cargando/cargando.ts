import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-cargando',
  standalone: true,
  templateUrl: './cargando.html',
  styleUrl: './cargando.css'
})
export class Cargando {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.validarSesion();
  }

  private async validarSesion() {
    const haySesionValida = await this.authService.autorizar();
    this.router.navigate([haySesionValida ? '/publicaciones' : '/login']);
  }
}
