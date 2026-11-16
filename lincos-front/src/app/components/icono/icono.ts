import { Component, input } from '@angular/core';

export type NombreIcono =
  | 'inicio' | 'perfil' | 'salir' | 'flecha-abajo'
  | 'ovni' | 'ovni-lleno' | 'comentario' | 'mas'
  | 'basura' | 'lapiz' | 'imagen' | 'cerrar';

@Component({
  imports: [],
  selector: 'app-icono',
  templateUrl: './icono.html',
  styleUrl: './icono.css',
})
export class Icono {
  nombre = input.required<NombreIcono>();
}