import { effect, Injectable, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE_STORAGE = 'red-social-tema';

@Injectable({ providedIn: 'root' })
export class TemaService {
  tema = signal<Tema>(this.leerTemaGuardado());

  constructor() {
    // cada vez que cambia el signal, lo reflejamos en el <html> (vía CSS) y lo guardamos
    effect(() => {
      document.documentElement.setAttribute('data-tema', this.tema());
      localStorage.setItem(CLAVE_STORAGE, this.tema());
    });
  }

  private leerTemaGuardado(): Tema {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch {
      // si localStorage no esta disponible, seguimos con el default
    }
    return 'oscuro';
  }

  alternar() {
    this.tema.set(this.tema() === 'oscuro' ? 'claro' : 'oscuro');
  }
}
