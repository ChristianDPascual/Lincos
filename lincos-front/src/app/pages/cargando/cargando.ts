import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, interval, Observable, Subscription, take, tap, timer } from 'rxjs';
import { Auth } from '../../services/auth';
import { Logo } from '../../components/logo/logo';
import { Spinner } from '../../components/spinner/spinner';

const MENSAJES_INTRO = [
  'Iniciando la aplicación...',
  'Desactivando cookies de seguimiento...',
  'Ocultando la IP...',
  'Editando la geolocalización...',
];
const MENSAJE_CORTO = ['Verificando tu sesión...'];
const TIEMPO_POR_MENSAJE = 2000;
const TIEMPO_CORTO = 1500;
const CLAVE_INTRO = 'lincos_intro_vista'; // sessionStorage: se borra al cerrar la pestaña

@Component({
  imports: [Logo, Spinner],
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private suscripcion?: Subscription;

  private mensajes = signal(MENSAJES_INTRO);
  indice = signal(0);
  mensaje = computed(() => this.mensajes()[this.indice()]);
  progreso = computed(() => ((this.indice() + 1) / this.mensajes().length) * 100);

  ngOnInit() {
    const introVista = sessionStorage.getItem(CLAVE_INTRO) === 'si';
    sessionStorage.setItem(CLAVE_INTRO, 'si');

    // Primera apertura de la pestaña: los 4 mensajes. F5 posteriores: versión corta.
    let espera$: Observable<unknown>;
    if (introVista) {
      this.mensajes.set(MENSAJE_CORTO);
      espera$ = timer(TIEMPO_CORTO);
    } else {
      espera$ = interval(TIEMPO_POR_MENSAJE).pipe(
        take(MENSAJES_INTRO.length),
        tap((i) => {
          if (i + 1 < MENSAJES_INTRO.length) this.indice.set(i + 1);
        }),
      );
    }

    // La espera y la validación del token corren en paralelo
    this.suscripcion = forkJoin([espera$, this.auth.restaurarSesion()]).subscribe(([, haySesion]) => {
      const volver = this.route.snapshot.queryParamMap.get('volver');
      const destino = haySesion ? volver || '/publicaciones' : '/login';
      this.router.navigateByUrl(destino, { replaceUrl: true });
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }
}