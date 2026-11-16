import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Modal } from './components/modal/modal';
import { ModalService } from './services/modal';
import { Sesion } from './services/sesion';

@Component({
  imports: [RouterOutlet, Modal],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected modal = inject(ModalService);
  // Se inyecta acá para que el servicio exista desde que arranca la app y vigile el token
  private sesion = inject(Sesion);
}