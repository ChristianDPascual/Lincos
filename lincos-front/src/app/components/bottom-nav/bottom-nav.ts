import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { Icono } from '../icono/icono';

@Component({
  imports: [RouterLink, RouterLinkActive, Icono],
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