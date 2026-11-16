import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { switchMap, tap, timer } from 'rxjs';
import { Auth } from '../../services/auth';
import { Logo } from '../../components/logo/logo';
import { FormUsuario } from '../../components/form-usuario/form-usuario';
import { Spinner } from '../../components/spinner/spinner';
import { obtenerMensajeError } from '../../core/mensaje-error';
import { conDemoraMinima } from '../../core/demora-minima';

@Component({
  imports: [RouterLink, Logo, FormUsuario, Spinner],
  selector: 'app-registro',
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private auth = inject(Auth);
  private router = inject(Router);

  cargando = signal(false);
  mensajeCarga = signal('');
  error = signal<string | null>(null);

  registrar(datos: FormData) {
    this.error.set(null);
    this.mensajeCarga.set('Creando tu cuenta...');
    this.cargando.set(true);

    conDemoraMinima(this.auth.registrar(datos))
      .pipe(
        tap(() => this.mensajeCarga.set('¡Tu cuenta fue creada exitosamente!')),
        switchMap(() => timer(2000)), // tiempo para leer el mensaje de éxito
      )
      .subscribe({
        next: () => this.router.navigate(['/perfil'], { replaceUrl: true }),
        error: (e) => {
          this.error.set(obtenerMensajeError(e));
          this.cargando.set(false);
        },
      });
  }
}