import { afterRenderEffect, Component, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Se registran todos los tipos de gráfico de Chart.js y los colores por defecto de LINCOS
Chart.register(...registerables);
Chart.defaults.color = '#8b989d';
Chart.defaults.borderColor = '#1e272b';
Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";

export type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut';

// Paleta para los gráficos circulares: tonos de la identidad de LINCOS
const PALETA = [
  '#1dd3b0', '#086375', '#affc41', '#b2ff9e', '#5fd4e8',
  '#0fa58a', '#7fb83a', '#2c7f91', '#d6ffcc', '#3fe0c5',
];
const TURQUESA = '#1dd3b0';

// Componente reutilizable: recibe el tipo, las etiquetas y los valores, y dibuja el gráfico
@Component({
  imports: [],
  selector: 'app-grafico',
  templateUrl: './grafico.html',
  styleUrl: './grafico.css',
})
export class Grafico implements OnDestroy {
  tipo = input.required<TipoGrafico>();
  etiquetas = input.required<string[]>();
  valores = input.required<number[]>();
  horizontal = input(false); // barras horizontales
  serie = input('Cantidad');  // texto del tooltip

  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    // afterRenderEffect: se ejecuta después de dibujar la vista (el <canvas> ya existe)
    // y se repite cada vez que cambian los datos: destruye el gráfico anterior y crea uno nuevo
    afterRenderEffect(() => {
      const configuracion = this.armarConfiguracion();
      this.grafico?.destroy();
      this.grafico = new Chart(this.lienzo().nativeElement, configuracion);
    });
  }

  ngOnDestroy() {
    this.grafico?.destroy();
  }

  private armarConfiguracion(): ChartConfiguration {
    const tipo = this.tipo();
    const circular = tipo === 'pie' || tipo === 'doughnut';

    return {
      type: tipo,
      data: {
        labels: this.etiquetas(),
        datasets: [
          {
            label: this.serie(),
            data: this.valores(),
            backgroundColor: circular ? PALETA : tipo === 'line' ? 'rgba(29, 211, 176, .15)' : TURQUESA,
            borderColor: circular ? '#0b0f11' : TURQUESA,
            borderWidth: 2,
            borderRadius: tipo === 'bar' ? 6 : 0,
            maxBarThickness: 48,
            fill: tipo === 'line',
            tension: 0.3,
            pointRadius: tipo === 'line' ? 3 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: this.horizontal() ? 'y' : 'x',
        plugins: {
          legend: { display: circular, position: 'bottom' },
        },
        scales: circular
          ? {}
          : {
              x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#1e272b' } },
              y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#1e272b' } },
            },
      },
    } as ChartConfiguration;
  }
}