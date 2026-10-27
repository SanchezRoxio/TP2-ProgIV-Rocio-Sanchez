import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './servicios/auth.service';
import { TemaService } from './servicios/tema.service';
import { Modal } from './componentes/modal/modal';

@Component({
  imports: [RouterOutlet, RouterLink, Modal],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  authService = inject(AuthService);
  temaService = inject(TemaService);
  private router = inject(Router);

  async cerrarSesion() {
    await this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
