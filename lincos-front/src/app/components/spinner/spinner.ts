import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-spinner',
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  host: {
    role: 'status',
    'aria-label': 'Cargando',
    '[class.pantalla-completa]': 'pantallaCompleta()',
  },
})
export class Spinner {
  tamano = input(96);
  mensaje = input<string | null>(null);
  pantallaCompleta = input(false); // cubre toda la página y bloquea los clics
}