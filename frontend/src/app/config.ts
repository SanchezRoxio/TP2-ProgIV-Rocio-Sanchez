import { isDevMode } from '@angular/core';

// en desarrollo (ng serve) usa el backend local; en el build de produccion,
// el backend ya deployado en Vercel
export const API_URL = isDevMode() ? 'http://localhost:3000' : 'https://tp-2-prog-iv-rocio-sanchez.vercel.app';
