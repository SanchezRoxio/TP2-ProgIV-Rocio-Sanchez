import { Component, inject } from '@angular/core';
import { ModalService } from '../../servicios/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  modalService = inject(ModalService);

  confirmar() {
    const modal = this.modalService.modalActual();
    modal?.alConfirmar?.();
    this.modalService.cerrar();
  }

  cancelar() {
    const modal = this.modalService.modalActual();
    modal?.alCancelar?.();
    this.modalService.cerrar();
  }
}
