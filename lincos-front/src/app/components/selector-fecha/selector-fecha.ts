  import { Component, computed, input, model } from '@angular/core';

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Elige una fecha con tres selects (día, mes y año) con el estilo de LINCOS.
  // model(): enlace en las dos direcciones con el padre → <app-selector-fecha [(valor)]="desde" />
  @Component({
    imports: [],
    selector: 'app-selector-fecha',
    templateUrl: './selector-fecha.html',
    styleUrl: './selector-fecha.css',
  })
  export class SelectorFecha {
    valor = model.required<string>(); // AAAA-MM-DD
    etiqueta = input.required<string>();
    anioMinimo = input(2025);

    readonly meses = MESES;

    anio = computed(() => Number(this.valor().slice(0, 4)));
    mes = computed(() => Number(this.valor().slice(5, 7)));
    dia = computed(() => Number(this.valor().slice(8, 10)));

    // Del año actual hacia atrás
    anios = computed(() => {
      const actual = new Date().getFullYear();
      return Array.from({ length: actual - this.anioMinimo() + 1 }, (_, i) => actual - i);
    });

    // Solo los días que existen en el mes elegido: no se puede elegir el 31 de febrero
    dias = computed(() => Array.from({ length: diasDelMes(this.anio(), this.mes()) }, (_, i) => i + 1));

    cambiar(parte: 'dia' | 'mes' | 'anio', evento: Event) {
      const numero = Number((evento.target as HTMLSelectElement).value);
      let anio = this.anio();
      let mes = this.mes();
      let dia = this.dia();

      if (parte === 'anio') anio = numero;
      if (parte === 'mes') mes = numero;
      if (parte === 'dia') dia = numero;

      // Si estaba en el 31 y se cambia a un mes de 30 (o a febrero), se ajusta al último día
      dia = Math.min(dia, diasDelMes(anio, mes));
      this.valor.set(`${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`);
    }
  }

  function diasDelMes(anio: number, mes: number): number {
    return new Date(anio, mes, 0).getDate(); // el día 0 del mes siguiente es el último del mes
  }

  function dosDigitos(numero: number): string {
    return String(numero).padStart(2, '0');
  }