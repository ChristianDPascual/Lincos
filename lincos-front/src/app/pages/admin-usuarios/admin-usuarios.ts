import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal';
import { FormUsuario } from '../../components/form-usuario/form-usuario';
import { Spinner } from '../../components/spinner/spinner';
import { Icono } from '../../components/icono/icono';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { obtenerMensajeError } from '../../core/mensaje-error';
import { ImagenFallback } from '../../directives/imagen-fallback';

@Component({
  imports: [DatePipe, RouterLink, FormUsuario, Spinner, Icono, NombreCompletoPipe, ImagenFallback],
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css',
})
export class AdminUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private modal = inject(ModalService);
  private auth = inject(Auth);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  mostrandoFormulario = signal(false);
  creando = signal(false);
  errorCreacion = signal<string | null>(null);
  procesando = signal<string | null>(null); // id del usuario que se está habilitando o deshabilitando

  idPropio = computed(() => this.auth.usuario()?._id);
  cantidadAdmins = computed(() => this.usuarios().filter((u) => u.perfil === 'administrador').length);
  cantidadDeshabilitados = computed(() => this.usuarios().filter((u) => !u.habilitado).length);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);

    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(obtenerMensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  abrirFormulario() {
    this.errorCreacion.set(null);
    this.mostrandoFormulario.set(true);
  }

  // Al cerrarlo, el formulario se destruye: la próxima vez aparece vacío
  cerrarFormulario() {
    this.mostrandoFormulario.set(false);
  }

  crear(datos: FormData) {
    this.creando.set(true);
    this.errorCreacion.set(null);

    this.usuariosService.crear(datos).subscribe({
      next: (usuario) => {
        this.usuarios.update((lista) => [usuario, ...lista]);
        this.creando.set(false);
        this.mostrandoFormulario.set(false);
        this.modal.informar('Usuario creado', `${usuario.nombre} ${usuario.apellido} ya puede ingresar a LINCOS.`);
      },
      error: (e) => {
        this.errorCreacion.set(obtenerMensajeError(e)); // 409 si el correo o el usuario ya existen
        this.creando.set(false);
      },
    });
  }

  // Baja o alta lógica, con confirmación
  cambiarEstado(usuario: Usuario) {
    const deshabilitar = usuario.habilitado;

    this.modal
      .abrir({
        titulo: deshabilitar ? 'Deshabilitar usuario' : 'Habilitar usuario',
        mensaje: deshabilitar
          ? `@${usuario.nombreUsuario} no va a poder ingresar a LINCOS. Cuando intente iniciar sesión, se le va a avisar que su cuenta está deshabilitada.`
          : `@${usuario.nombreUsuario} va a poder volver a ingresar a LINCOS.`,
        textoAceptar: deshabilitar ? 'Deshabilitar' : 'Habilitar',
        tipo: deshabilitar ? 'peligro' : 'normal',
      })
      .pipe(
        filter((confirmado) => confirmado),
        tap(() => this.procesando.set(usuario._id)),
        switchMap(() =>
          deshabilitar
            ? this.usuariosService.deshabilitar(usuario._id)
            : this.usuariosService.habilitar(usuario._id),
        ),
      )
      .subscribe({
        next: (actualizado) => {
          this.usuarios.update((lista) => lista.map((u) => (u._id === actualizado._id ? actualizado : u)));
          this.procesando.set(null);
        },
        error: (e) => {
          this.procesando.set(null);
          this.modal.informar('No se pudo actualizar el usuario', obtenerMensajeError(e));
        },
      });
  }
}