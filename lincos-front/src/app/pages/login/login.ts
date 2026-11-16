import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Logo } from '../../components/logo/logo';
import { Spinner } from '../../components/spinner/spinner';
import { passwordSeguraValidator } from '../../validators/usuario.validators';
import { obtenerMensajeError } from '../../core/mensaje-error';
import { conDemoraMinima } from '../../core/demora-minima';

@Component({
  imports: [ReactiveFormsModule, RouterLink, Logo, Spinner],
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  cargando = signal(false);
  error = signal<string | null>(null);
  mostrarPassword = signal(false);

  form = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, passwordSeguraValidator()],
    }),
  });

  ingresar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // muestra los errores de todos los campos
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    // El spinner se muestra al menos 3 s, aunque la API responda antes
    conDemoraMinima(this.auth.login(this.form.getRawValue())).subscribe({
      // replaceUrl: la flecha "Atrás" no vuelve al login
      next: () => this.router.navigate(['/publicaciones'], { replaceUrl: true }),
      error: (e) => {
        this.error.set(obtenerMensajeError(e)); // 401 (credenciales), 403 (deshabilitado) o sin conexión
        this.cargando.set(false);
      },
    });
  }

  // Un campo se marca como inválido recién cuando el usuario lo tocó
  invalido(campo: 'usuario' | 'password'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }
}