import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal';

@Component({
  imports: [],
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  host: { '(document:keydown.escape)': 'cancelarConEscape()' },
})
export class Modal {
  private modalService = inject(ModalService);
  opciones = this.modalService.actual;

  aceptar() {
    this.modalService.responder(true);
  }

  cancelar() {
    this.modalService.responder(false);
  }

  // Escape solo cierra los modales que tienen botón de cancelar
  cancelarConEscape() {
    if (this.opciones()?.textoCancelar) this.cancelar();
  }
}