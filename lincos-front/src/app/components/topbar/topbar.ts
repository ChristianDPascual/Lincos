import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Logo } from '../logo/logo';
import { Icono } from '../icono/icono';
import { ImagenFallback } from '../../directives/imagen-fallback';

@Component({
  imports: [RouterLink, Logo, Icono, ImagenFallback],
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private auth = inject(Auth);

  usuario = this.auth.usuario;
  menuAbierto = signal(false);

  cerrarSesion() {
    this.menuAbierto.set(false);
    this.auth.confirmarCierreSesion();
  }
}