import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

// se usa asi: <input appEnfocar /> — pone el foco ahi apenas se crea el
// elemento, para no tener que clickear el primer campo de un formulario
@Directive({
  selector: '[appEnfocar]',
  standalone: true,
})
export class EnfocarDirective implements AfterViewInit {
  private elementoRef = inject(ElementRef<HTMLElement>);

  ngAfterViewInit() {
    this.elementoRef.nativeElement.focus();
  }
}
