import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EstadisticasService,
  PublicacionesPorUsuario,
  ComentariosPorDia,
  ComentariosPorPublicacion,
} from '../../servicios/estadisticas.service';
import { ModalService } from '../../servicios/modal.service';

const COLORES_TORTA = ['#7E553E', '#D29B7C', '#76362C', '#3A1B16'];
const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;

function formatoFecha(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

interface PorcionTorta {
  titulo: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas {
  private estadisticasService = inject(EstadisticasService);
  private modalService = inject(ModalService);

  desde = formatoFecha(new Date(Date.now() - TREINTA_DIAS_MS));
  hasta = formatoFecha(new Date());

  cargando = signal(false);
  publicacionesPorUsuario = signal<PublicacionesPorUsuario[]>([]);
  comentariosPorDia = signal<ComentariosPorDia[]>([]);
  comentariosPorPublicacion = signal<ComentariosPorPublicacion[]>([]);

  // --- grafico de barras: publicaciones por usuario ---
  maximoBarras = computed(() => Math.max(1, ...this.publicacionesPorUsuario().map(p => p.cantidad)));

  // --- grafico de lineas: comentarios por dia (SVG polyline, hecho a mano) ---
  anchoSvg = 300;
  altoSvg = 120;

  coordenadasLinea = computed(() => {
    const datos = this.comentariosPorDia();
    if (datos.length === 0) return [];

    const maximo = Math.max(1, ...datos.map(d => d.cantidad));
    const pasoX = datos.length > 1 ? this.anchoSvg / (datos.length - 1) : 0;

    return datos.map((d, i) => ({
      x: datos.length > 1 ? i * pasoX : this.anchoSvg / 2,
      y: this.altoSvg - (d.cantidad / maximo) * this.altoSvg,
    }));
  });

  // un solo punto no alcanza para dibujar una linea (polyline necesita 2+),
  // por eso ademas dibujamos un circulo en cada punto: con un solo dia de
  // datos, al menos se ve ese punto
  puntosLinea = computed(() => this.coordenadasLinea().map(p => `${p.x},${p.y}`).join(' '));

  // --- grafico de torta: comentarios por publicacion (CSS conic-gradient) ---
  porcionesTorta = computed<PorcionTorta[]>(() => {
    const datos = this.comentariosPorPublicacion();
    const total = datos.reduce((suma, d) => suma + d.cantidad, 0) || 1;
    return datos.map((d, i) => ({
      titulo: d.titulo,
      cantidad: d.cantidad,
      porcentaje: Math.round((d.cantidad / total) * 100),
      color: COLORES_TORTA[i % COLORES_TORTA.length],
    }));
  });

  degradadoTorta = computed(() => {
    let acumulado = 0;
    const porciones = this.porcionesTorta().map(p => {
      const desde = acumulado;
      acumulado += p.porcentaje;
      return `${p.color} ${desde}% ${acumulado}%`;
    });
    return porciones.length ? `conic-gradient(${porciones.join(', ')})` : 'var(--color-secondary)';
  });

  constructor() {
    this.aplicar();
  }

  async aplicar() {
    this.cargando.set(true);
    const rango = { desde: this.desde, hasta: this.hasta };
    try {
      const [barras, lineas, torta] = await Promise.all([
        this.estadisticasService.publicacionesPorUsuario(rango),
        this.estadisticasService.comentariosPorDia(rango),
        this.estadisticasService.comentariosPorPublicacion(rango),
      ]);
      this.publicacionesPorUsuario.set(barras);
      this.comentariosPorDia.set(lineas);
      this.comentariosPorPublicacion.set(torta);
    } catch {
      this.modalService.error('No se pudieron cargar las estadísticas.');
    } finally {
      this.cargando.set(false);
    }
  }
}
