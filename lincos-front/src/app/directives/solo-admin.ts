import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { Auth } from '../services/auth';

// Directiva estructural (como la *appAdmin de clase), pero con el rol real del usuario logueado.
// Uso: <a *appSoloAdmin routerLink="/admin/usuarios">Usuarios</a>
@Directive({ selector: '[appSoloAdmin]' })
export class SoloAdmin {
  private template = inject(TemplateRef);
  private contenedor = inject(ViewContainerRef);
  private auth = inject(Auth);
  private visible = false;

  constructor() {
    // effect: si cambia el usuario (login, logout), el elemento aparece o desaparece solo
    effect(() => {
      const esAdmin = this.auth.esAdmin();
      if (esAdmin && !this.visible) {
        this.contenedor.createEmbeddedView(this.template);
        this.visible = true;
      } else if (!esAdmin && this.visible) {
        this.contenedor.clear();
        this.visible = false;
      }
    });
  }
}