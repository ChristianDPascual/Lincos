import { forkJoin, map, Observable, timer } from 'rxjs';

// Espera a que terminen las dos cosas: la petición y el timer.
// Si la API responde en 300 ms, el spinner igual se ve 3 s.
// Si la petición falla, el error llega enseguida (no hace falta esperar para mostrarlo).
export function conDemoraMinima<T>(peticion: Observable<T>, ms = 3000): Observable<T> {
  return forkJoin([peticion, timer(ms)]).pipe(map(([respuesta]) => respuesta));
}