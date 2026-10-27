import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config';
import { Usuario } from '../modelos/usuario';
import { ModalService } from './modal.service';

const DIEZ_MINUTOS_MS = 10 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  // la sesion ya no vive en localStorage: el token esta en una cookie
  // httpOnly que ni JS puede leer. Esto solo cachea los datos en memoria.
  usuarioActual = signal<Usuario | null>(null);

  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private avisoSesionId?: ReturnType<typeof setTimeout>;

  async registrar(datos: FormData): Promise<Usuario> {
    const usuario = await firstValueFrom(
      this.http.post<Usuario>(`${API_URL}/auth/registro`, datos)
    );
    this.iniciarSesion(usuario);
    return usuario;
  }

  async login(identificador: string, password: string): Promise<Usuario> {
    const usuario = await firstValueFrom(
      this.http.post<Usuario>(`${API_URL}/auth/login`, { identificador, password })
    );
    this.iniciarSesion(usuario);
    return usuario;
  }

  // se llama una sola vez, al arrancar la app (pantalla de Cargando):
  // valida contra el server si la cookie que ya tenemos sigue siendo valida
  async autorizar(): Promise<boolean> {
    try {
      const usuario = await firstValueFrom(this.http.post<Usuario>(`${API_URL}/auth/autorizar`, {}));
      this.iniciarSesion(usuario);
      return true;
    } catch {
      return false;
    }
  }

  private async refrescarToken(): Promise<void> {
    await firstValueFrom(this.http.post(`${API_URL}/auth/refrescar`, {}));
  }

  async cerrarSesion() {
    this.detenerContadorSesion();
    try {
      await firstValueFrom(this.http.post(`${API_URL}/auth/logout`, {}));
    } finally {
      this.usuarioActual.set(null);
    }
  }

  haySesion(): boolean {
    return !!this.usuarioActual();
  }

  private iniciarSesion(usuario: Usuario) {
    this.usuarioActual.set(usuario);
    this.iniciarContadorSesion();
  }

  // el token vence a los 15 min; a los 10 avisamos que quedan 5 y
  // preguntamos si quiere extender la sesion (refrescando el token)
  private iniciarContadorSesion() {
    this.detenerContadorSesion();
    this.avisoSesionId = setTimeout(() => {
      this.modalService.confirmar(
        '⏳ Quedan 5 minutos de sesión. ¿Querés extenderla?',
        async () => {
          await this.refrescarToken();
          this.iniciarContadorSesion();
        }
      );
    }, DIEZ_MINUTOS_MS);
  }

  private detenerContadorSesion() {
    if (this.avisoSesionId) {
      clearTimeout(this.avisoSesionId);
      this.avisoSesionId = undefined;
    }
  }
}
