import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { EstadisticasService } from '../../services/estadisticas';
import { DatoPorDia, DatoPorUsuario, DatosEstadisticas, Periodo } from '../../models/estadistica';
import { Grafico } from '../../components/grafico/grafico';
import { SelectorFecha } from '../../components/selector-fecha/selector-fecha';
import { Spinner } from '../../components/spinner/spinner';
import { NumeroCompactoPipe } from '../../pipes/numero-compacto-pipe';
import { obtenerMensajeError } from '../../core/mensaje-error';

interface Atajo {
  texto: string;
  calcular: () => Periodo;
}

@Component({
  imports: [DatePipe, Grafico, SelectorFecha, Spinner, NumeroCompactoPipe],
  selector: 'app-admin-estadisticas',
  templateUrl: './admin-estadisticas.html',
  styleUrl: './admin-estadisticas.css',
})
export class AdminEstadisticas implements OnInit, OnDestroy {
  private estadisticasService = inject(EstadisticasService);
  private suscripcion?: Subscription;

  // Atajos de período; además, el usuario puede elegir cualquier rango con los selectores
  readonly atajos: Atajo[] = [
    { texto: 'Últimos 7 días', calcular: () => ultimosDias(7) },
    { texto: 'Últimos 30 días', calcular: () => ultimosDias(30) },
    { texto: 'Últimos 90 días', calcular: () => ultimosDias(90) },
    { texto: 'Este mes', calcular: () => ({ desde: aTexto(new Date(hoy().getFullYear(), hoy().getMonth(), 1)), hasta: aTexto(hoy()) }) },
    { texto: 'Este año', calcular: () => ({ desde: `${hoy().getFullYear()}-01-01`, hasta: aTexto(hoy()) }) },
  ];

  // Lo que está eligiendo el usuario (todavía sin aplicar)
  desde = signal(ultimosDias(30).desde);
  hasta = signal(ultimosDias(30).hasta);

  // El período de los datos que se están mostrando
  periodoAplicado = signal<Periodo>(ultimosDias(30));

  datos = signal<DatosEstadisticas | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);

  errorPeriodo = computed(() =>
    this.desde() > this.hasta() ? 'La fecha "desde" no puede ser posterior a "hasta".' : null,
  );
  hayCambiosSinAplicar = computed(
    () => this.desde() !== this.periodoAplicado().desde || this.hasta() !== this.periodoAplicado().hasta,
  );

  // Totales del período (indicadores)
  totalPublicaciones = computed(() => sumar(this.datos()?.publicacionesPorUsuario));
  totalComentarios = computed(() => sumar(this.datos()?.comentariosPorDia));
  totalMeGusta = computed(() => sumar(this.datos()?.meGustaPorDia));
  totalIngresos = computed(() => sumar(this.datos()?.ingresosPorUsuario));
  totalVisitas = computed(() => sumar(this.datos()?.visitasPorPerfil));

  ngOnInit() {
    this.cargar();
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  usarAtajo(atajo: Atajo) {
    const periodo = atajo.calcular();
    this.desde.set(periodo.desde);
    this.hasta.set(periodo.hasta);
    this.aplicar();
  }

  aplicar() {
    if (this.errorPeriodo()) return;
    this.periodoAplicado.set({ desde: this.desde(), hasta: this.hasta() });
    this.cargar();
  }

  // ---------- Formatos para los gráficos ----------

  usuarios(lista: DatoPorUsuario[]): string[] {
    return lista.map((d) => '@' + d.nombreUsuario);
  }

  cantidades(lista: { cantidad: number }[]): number[] {
    return lista.map((d) => d.cantidad);
  }

  dias(lista: DatoPorDia[]): string[] {
    return lista.map((d) => `${d.fecha.slice(8, 10)}/${d.fecha.slice(5, 7)}`); // AAAA-MM-DD → DD/MM
  }

  titulos(lista: { titulo: string }[]): string[] {
    return lista.map((d) => (d.titulo.length > 30 ? d.titulo.slice(0, 30) + '…' : d.titulo));
  }

  sinDatos(lista: { cantidad: number }[]): boolean {
    return sumar(lista) === 0;
  }

  private cargar() {
    this.suscripcion?.unsubscribe(); // si se cambia el período a mitad de una carga, se descarta la anterior
    this.cargando.set(true);
    this.error.set(null);

    this.suscripcion = this.estadisticasService.obtenerTodas(this.periodoAplicado()).subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(obtenerMensajeError(e));
        this.cargando.set(false);
      },
    });
  }
}

// ---------- Funciones de fecha (hora local del navegador) ----------

function hoy(): Date {
  return new Date();
}

function aTexto(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function ultimosDias(cantidad: number): Periodo {
  const desde = hoy();
  desde.setDate(desde.getDate() - (cantidad - 1));
  return { desde: aTexto(desde), hasta: aTexto(hoy()) };
}

function sumar(lista?: { cantidad: number }[]): number {
  return (lista ?? []).reduce((total, d) => total + d.cantidad, 0);
}