import { Pipe, PipeTransform } from '@angular/core';

// corta un texto largo y le agrega "…", para no romper el diseño de la
// tarjeta de publicacion en el feed cuando el mensaje es muy largo
@Pipe({
  name: 'truncar',
  standalone: true,
})
export class TruncarPipe implements PipeTransform {
  transform(valor: string, largoMaximo = 200): string {
    if (!valor || valor.length <= largoMaximo) return valor;
    return valor.slice(0, largoMaximo).trimEnd() + '…';
  }
}
