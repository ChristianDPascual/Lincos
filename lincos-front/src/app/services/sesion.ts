import { effect, inject, Service } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { Auth } from './auth';
import { ModalService } from './modal';

// El aviso sale a los 2/3 de la vida del token.
// Con 15 minutos: aviso a los 10, quedan 5 (lo que pide el TP).
const PROPORCION_AVISO = 2 / 3;

@Service()
export class Sesion {
  private auth = inject(Auth);
  private modal = inject(ModalService);
  private temporizadores = new Subscription();

  constructor() {
    // Se vuelve a ejecutar cada vez que cambia el token o el usuario
    effect(() => {
      const token = this.auth.token();
      const usuario = this.auth.usuario();

      this.temporizadores.unsubscribe(); // cancela los temporizadores del token anterior
      if (token && usuario) {
        this.programar(token);
      }
    });
  }

  private programar(token: string) {
    const { emitido, vence } = this.leerTiempos(token);
    const aviso = emitido + (vence - emitido) * PROPORCION_AVISO;
    const ahora = Date.now();

    this.temporizadores = new Subscription();
    this.temporizadores.add(
      timer(Math.max(aviso - ahora, 0)).subscribe(() => this.preguntarExtension(vence)),
    );
    this.temporizadores.add(
      timer(Math.max(vence - ahora, 0)).subscribe(() => this.vencer()),
    );
  }

  private preguntarExtension(vence: number) {
    const restante = this.formatearTiempo(vence - Date.now());

    this.modal
      .abrir({
        titulo: 'Tu sesión está por vencer',
        mensaje: `Tu sesión vence en ${restante}. ¿Querés extenderla?`,
        textoAceptar: 'Extender sesión',
        textoCancelar: 'Ahora no',
      })
      .subscribe((extender) => {
        if (!extender) return;
        this.auth.refrescar().subscribe({
          // Si sale bien, el token cambia y el effect reprograma los temporizadores
          error: () => this.auth.cerrarSesion('No se pudo extender la sesión. Volvé a iniciar sesión.'),
        });
      });
  }

  private vencer() {
    this.modal.cerrar(); // por si el aviso quedó abierto sin respuesta
    this.auth.cerrarSesion('Tu sesión venció. Volvé a iniciar sesión.');
  }

  private formatearTiempo(ms: number): string {
    const segundos = Math.max(Math.round(ms / 1000), 0);
    if (segundos < 60) return `${segundos} segundos`;
    const minutos = Math.round(segundos / 60);
    return minutos === 1 ? '1 minuto' : `${minutos} minutos`;
  }

  // El payload del JWT trae iat (emitido) y exp (vence), en segundos
  private leerTiempos(token: string): { emitido: number; vence: number } {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return { emitido: payload.iat * 1000, vence: payload.exp * 1000 };
  }
}