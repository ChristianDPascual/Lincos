import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { Icono } from '../icono/icono';
import { SoloAdmin } from '../../directives/solo-admin';

@Component({
  imports: [RouterLink, RouterLinkActive, Icono, SoloAdmin],
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {
  private auth = inject(Auth);

  cerrarSesion() {
    this.auth.confirmarCierreSesion();
  }
}