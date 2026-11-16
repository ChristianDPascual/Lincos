import { Directive, ElementRef, inject, OnDestroy, OnInit, output } from '@angular/core';

// Se coloca en un elemento al final de la lista.
// Cuando ese elemento entra en pantalla, emite "alcanzado" para cargar más.
// Uso: <div appScrollInfinito (alcanzado)="cargarMas()"></div>
@Directive({ selector: '[appScrollInfinito]' })
export class ScrollInfinito implements OnInit, OnDestroy {
  alcanzado = output<void>();

  private elemento = inject(ElementRef);
  private observador?: IntersectionObserver;

  ngOnInit() {
    // IntersectionObserver lo trae el navegador: avisa cuando un elemento se vuelve visible.
    // rootMargin: empieza a cargar 300 px antes de llegar al final.
    this.observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) this.alcanzado.emit();
      },
      { rootMargin: '300px' },
    );
    this.observador.observe(this.elemento.nativeElement);
  }

  ngOnDestroy() {
    this.observador?.disconnect();
  }
}