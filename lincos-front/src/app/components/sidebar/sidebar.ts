import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { Logo } from '../logo/logo';
import { Icono } from '../icono/icono';
import { SoloAdmin } from '../../directives/solo-admin';

@Component({
  imports: [RouterLink, RouterLinkActive, Logo, Icono, SoloAdmin],
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private auth = inject(Auth);

  cerrarSesion() {
    this.auth.confirmarCierreSesion();
  }
}