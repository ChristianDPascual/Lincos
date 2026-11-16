import { Service, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface OpcionesModal {
  titulo: string;
  mensaje: string;
  textoAceptar?: string;
  textoCancelar?: string | null; // null = modal informativo, con un solo botón
  tipo?: 'normal' | 'peligro';
}

@Service()
export class ModalService {
  readonly actual = signal<OpcionesModal | null>(null);
  private respuesta?: Subject<boolean>;

  // Reemplaza a confirm(): devuelve true (aceptar) o false (cancelar)
  abrir(opciones: OpcionesModal): Observable<boolean> {
    this.respuesta?.complete(); // si había uno abierto, se descarta
    this.respuesta = new Subject<boolean>();
    this.actual.set({ textoAceptar: 'Aceptar', textoCancelar: 'Cancelar', tipo: 'normal', ...opciones });
    return this.respuesta.asObservable();
  }

  // Reemplaza a alert(): solo informa
  informar(titulo: string, mensaje: string) {
    this.abrir({ titulo, mensaje, textoCancelar: null });
  }

  responder(valor: boolean) {
    this.actual.set(null);
    this.respuesta?.next(valor);
    this.respuesta?.complete();
    this.respuesta = undefined;
  }

  cerrar() {
    if (this.actual()) this.responder(false);
  }
}