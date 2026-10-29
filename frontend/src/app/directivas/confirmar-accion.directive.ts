import { Directive, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { ModalService } from '../servicios/modal.service';

// se usa asi: <button [appConfirmarAccion]="'¿Seguro?'" (confirmado)="accion()">
// en vez de (click)="accion()" directo: intercepta el click, muestra el modal
// de confirmacion, y solo si el usuario dice que si emite "confirmado"
@Directive({
  selector: '[appConfirmarAccion]',
  standalone: true,
})
export class ConfirmarAccionDirective {
  @Input('appConfirmarAccion') mensaje = '¿Estás seguro?';
  @Output() confirmado = new EventEmitter<void>();

  private modalService = inject(ModalService);

  @HostListener('click', ['$event'])
  alHacerClick(evento: Event) {
    evento.stopPropagation();
    evento.preventDefault();
    this.modalService.confirmar(this.mensaje, () => this.confirmado.emit());
  }
}
