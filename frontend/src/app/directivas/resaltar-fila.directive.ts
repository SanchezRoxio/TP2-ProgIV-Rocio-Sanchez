import { Directive, HostBinding, HostListener } from '@angular/core';

// se usa asi: <tr appResaltarFila> — le agrega una clase "resaltado" al
// pasar el mouse por encima, y se la saca al sacar el mouse
@Directive({
  selector: '[appResaltarFila]',
  standalone: true,
})
export class ResaltarFilaDirective {
  @HostBinding('class.resaltado') resaltado = false;

  @HostListener('mouseenter')
  alEntrar() {
    this.resaltado = true;
  }

  @HostListener('mouseleave')
  alSalir() {
    this.resaltado = false;
  }
}
