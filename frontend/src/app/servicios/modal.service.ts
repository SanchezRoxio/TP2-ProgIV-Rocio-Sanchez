import { Injectable, signal } from '@angular/core';

export type TipoModal = 'info' | 'error' | 'exito' | 'confirmacion';

export interface ModalData {
  tipo: TipoModal;
  mensaje: string;
  alConfirmar?: () => void;
  alCancelar?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  modalActual = signal<ModalData | null>(null);

  mostrar(mensaje: string, tipo: TipoModal = 'info') {
    this.modalActual.set({ mensaje, tipo });
  }

  error(mensaje: string) {
    this.mostrar(mensaje, 'error');
  }

  exito(mensaje: string) {
    this.mostrar(mensaje, 'exito');
  }

  // modal con botones Si/No. alCancelar es opcional: no todos los casos
  // necesitan hacer algo si el usuario dice que no
  confirmar(mensaje: string, alConfirmar: () => void, alCancelar?: () => void) {
    this.modalActual.set({ mensaje, tipo: 'confirmacion', alConfirmar, alCancelar });
  }

  cerrar() {
    this.modalActual.set(null);
  }
}
