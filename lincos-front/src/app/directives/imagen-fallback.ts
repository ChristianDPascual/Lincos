import { Directive, input } from '@angular/core';

const RESPALDOS = {
  avatar: 'avatar-defecto.svg',
  publicacion: 'imagen-no-disponible.svg',
};

// Directiva de atributo: si la imagen no carga (link roto, Cloudinary caído, sin conexión),
// la reemplaza por una imagen por defecto de LINCOS.
// Uso: <img [src]="..." appImagenFallback />                  → avatar por defecto
//      <img [src]="..." appImagenFallback="publicacion" />     → "SEÑAL PERDIDA"
@Directive({
  selector: 'img[appImagenFallback]',
  host: { '(error)': 'usarRespaldo($event)' }, // escucha el evento "error" del <img>
})
export class ImagenFallback {
  appImagenFallback = input<string>('');

  usarRespaldo(evento: Event) {
    const imagen = evento.target as HTMLImageElement;
    const respaldo = this.appImagenFallback() === 'publicacion' ? RESPALDOS.publicacion : RESPALDOS.avatar;

    // Si el respaldo también fallara, no se vuelve a asignar (evita un bucle infinito)
    if (imagen.src.endsWith(respaldo)) return;
    imagen.src = respaldo;
  }
}