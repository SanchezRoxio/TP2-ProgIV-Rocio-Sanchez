import { Pipe, PipeTransform } from '@angular/core';

// saca las iniciales de nombre + apellido ("Rocío Sánchez" -> "RS"), para
// usar como avatar chico donde no hay foto de perfil (ej: tabla de usuarios)
@Pipe({
  name: 'iniciales',
  standalone: true,
})
export class InicialesPipe implements PipeTransform {
  transform(nombre: string, apellido: string): string {
    const inicialNombre = nombre?.trim().charAt(0) ?? '';
    const inicialApellido = apellido?.trim().charAt(0) ?? '';
    return (inicialNombre + inicialApellido).toUpperCase();
  }
}
