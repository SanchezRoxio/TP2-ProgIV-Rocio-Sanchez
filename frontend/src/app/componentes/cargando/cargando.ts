import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  constructor() {
    this.validarSesion();
  }

  private async validarSesion() {
    const haySesionValida = await this.authService.autorizar();
    if (!haySesionValida) {
      this.router.navigate(['/login']);
      return;
    }
    // si el authGuard nos mando para aca (refresco de pagina en una ruta
    // protegida), volvemos a esa misma ruta en vez de ir siempre al feed
    const destino = this.route.snapshot.queryParamMap.get('destino');
    this.router.navigateByUrl(destino ?? '/publicaciones');
  }
}
