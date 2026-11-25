# LINCOS

**QUESTION EVERYTHING.**

Trabajo Práctico #2 de Programación IV de la Tecnicatura Universitaria en Programación (UTN Avellaneda).

Año: 2026 — Segundo cuatrimestre.

## Links

| | |
|---|---|
| Aplicación (Firebase Hosting) | https://lincos-app.web.app |
| API (Render) | _se completa al publicar el backend_ |

## Objetivo

Desarrollar una red social temática donde las personas puedan publicar, compartir, debatir e investigar teorías conspirativas, misterios, fenómenos inexplicables e investigaciones alternativas.

La aplicación está dividida en dos proyectos: un frontend en **Angular** y un backend propio en **NestJS** con **MongoDB**. A diferencia del proyecto anterior (OneCine), no se utiliza un backend como servicio: toda la autenticación, las reglas de negocio y los permisos se resuelven en una API desarrollada por nosotros.

El objetivo es que los usuarios puedan plantear hipótesis, compartir información y debatir, con una experiencia similar a la de una red social real.

## LINCOS

### Concepto visual

Como referencia se tomaron patrones de Instagram (publicaciones, perfiles e interacciones), X (feed y ordenamiento) y Facebook (estructura de escritorio y tarjetas), sin copiar sus interfaces.

La idea rectora es la de una investigación nocturna: un entorno oscuro, sobrio y sin efectos de neón, donde el contenido de los usuarios es lo que más se destaca. El turquesa se usa con moderación, solo para acciones principales y elementos seleccionados.

El ojo geométrico integrado en la letra **O** del logo representa la idea de observar y cuestionar. Ese mismo ojo es el favicon, el ícono de la PWA y el spinner de carga, donde se transforma en un ovni.

### Paleta de colores

| Color | Código | Uso |
|---|---|---|
| Black | `#000000` | Fondo principal. |
| Grises oscuros | `#0b0f11` · `#12181b` | Superficies, tarjetas y campos. |
| Stormy Teal | `#086375` | Elementos secundarios, gradientes y bordes destacados. |
| Turquoise | `#1DD3B0` | Acciones principales, selección y "Lo creo" marcado. |
| Green Yellow | `#AFFC41` | Acentos puntuales (por ejemplo, la insignia de administrador). |
| Light Green | `#B2FF9E` | Detalles y estados secundarios (por ejemplo, requisitos de contraseña cumplidos). |

Los colores se definen como variables CSS en `styles.css` y se reutilizan en toda la aplicación.

### Tipografías

- **Space Grotesk:** títulos y marca.
- **IBM Plex Sans:** textos y elementos de la interfaz.

### Iconografía

| Elemento | Archivo |
|---|---|
| Ojo del logo | `lincos-front/public/logo-ojo.svg` |
| Spinner de carga | `lincos-front/public/spinner-ojo.gif` |
| Favicon | `lincos-front/public/favicon.ico` |
| Íconos de la PWA | `lincos-front/public/icons/` |

Los íconos de la interfaz (inicio, perfil, comentarios, ovni de "Lo creo", etc.) son SVG propios agrupados en el componente `Icono`. No se utiliza una librería de íconos.

## Arquitectura

```
Navegador ──▶ Angular (Firebase Hosting) ──HTTP + JWT──▶ NestJS (Render) ──▶ MongoDB Atlas
                                                               └──────────▶ Cloudinary (imágenes)
```

La idea principal es:

> Angular se encarga de la interfaz y de la experiencia; NestJS valida y aplica todas las reglas de negocio.

El frontend valida los formularios y muestra mensajes claros, pero cada operación importante vuelve a validarse en el backend: permisos, roles, propiedad del contenido, datos de entrada y estados de las entidades.

### Tecnologías

| Tecnología | Uso |
|---|---|
| Angular 22 | Componentes standalone, Signals, formularios reactivos, routing con carga lazy, guards e interceptor. |
| RxJS | Peticiones HTTP, temporizadores de sesión, `forkJoin` para tiempos mínimos de carga y `switchMap` en confirmaciones. |
| NestJS 12 | Módulos, controladores, servicios, DTOs, guards, pipes y decoradores propios. |
| MongoDB Atlas + Mongoose | Base de datos, esquemas, referencias con `populate` e índices. |
| class-validator / class-transformer | Validación y transformación de los DTOs. |
| @nestjs/jwt | Generación y verificación de tokens JWT. |
| @nestjs/authentication | `PasswordHasher` para encriptar contraseñas. |
| Multer + Cloudinary | Recepción y almacenamiento de imágenes de perfil y publicaciones. |
| PWA (@angular/service-worker) | Instalación de la aplicación y caché de recursos. |
| Firebase Hosting | Publicación del frontend. |
| Render | Publicación del backend. |

No se utiliza una librería de componentes UI. Los estilos son propios.

### Estructura del proyecto

```
Lincos/
├── lincos-back/                 API NestJS
│   └── src/
│       ├── auth/                Registro, login, autorizar y refrescar (JWT)
│       ├── usuarios/            Esquema y servicio de usuarios
│       ├── publicaciones/       Publicaciones y "Lo creo" (Me gusta)
│       ├── comentarios/         Comentarios de cada publicación
│       ├── estadisticas/        Consultas para los gráficos del panel
│       ├── file/                Subida de imágenes a Cloudinary
│       ├── guards/              AuthGuard (JWT) y AdminGuard (rol)
│       ├── common/              Pipes y utilidades compartidas
│       └── main.ts              CORS, ValidationPipe y arranque
│
└── lincos-front/                Aplicación Angular
    └── src/app/
        ├── core/                Interceptor y utilidades (mensajes de error, demora mínima)
        ├── models/              Interfaces y tipos
        ├── services/            Acceso a la API y estado compartido (sesión, modal)
        ├── guards/              Control de acceso a las rutas
        ├── validators/          Validadores propios de formularios
        ├── components/          Componentes reutilizables
        ├── pages/               Pantallas de la aplicación
        ├── pipes/               Pipes propios
        └── directives/          Directivas propias
```

La separación principal es:

- **Pages:** manejan el estado de cada pantalla y coordinan los servicios.
- **Components:** contienen elementos reutilizables de la interfaz (tarjeta de publicación, comentarios, formulario de usuario, spinner, modal, etc.).
- **Services:** concentran las peticiones HTTP y el estado compartido.
- **Models:** definen los tipos que devuelve la API.
- **Guards:** controlan el acceso y la navegación.

Los componentes no hacen peticiones HTTP directamente: utilizan los servicios correspondientes.

## Routing

Las rutas se encuentran en `app.routes.ts` y utilizan `loadComponent` para cargar las pantallas de forma lazy.

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Pantalla de carga (valida el token) | Sin sesión activa |
| `/login` | Inicio de sesión | Solo invitados |
| `/registro` | Registro | Solo invitados |
| `/publicaciones` | Feed | Usuarios logueados |
| `/publicaciones/:id` | Detalle de la publicación y comentarios | Usuarios logueados |
| `/perfil` | Mi perfil | Usuarios logueados |
| `**` | Página no encontrada | Todos |

Las pantallas internas comparten un layout con menú lateral y barra superior en escritorio, y navegación inferior en dispositivos móviles.

## Autenticación y sesión

- Las contraseñas se guardan encriptadas con `PasswordHasher`.
- El login acepta el correo o el nombre de usuario. Ante datos incorrectos, el mensaje es siempre genérico: *"Las credenciales ingresadas son incorrectas"*.
- El backend genera un **JWT de 15 minutos** con el id, el nombre de usuario y el rol.
- El token se guarda en `localStorage` y el **interceptor** lo agrega como `Authorization: Bearer` en cada petición.
- Al abrir la aplicación, la **pantalla de carga** valida el token contra `POST /auth/autorizar`. Si es válido, recupera el usuario; si no, redirige al login.
- A los **10 minutos** de iniciada la sesión aparece un modal que avisa que quedan 5 minutos y pregunta si se desea extenderla. Si se acepta, se pide un token nuevo a `POST /auth/refrescar`.
- Si una petición devuelve **401**, el interceptor cierra la sesión y redirige al login.

### Permisos

Los permisos se controlan en dos niveles:

- **Angular:** guards de rutas (`authGuard`, `invitadoGuard`, `cargaGuard`) y visibilidad de las acciones según el usuario.
- **NestJS:** `AuthGuard` en todas las rutas protegidas y verificación de propiedad y rol en cada servicio.

De esta forma, ocultar un botón en Angular no es la única medida de seguridad. Por ejemplo, la API responde **403** si alguien intenta eliminar una publicación ajena desde Postman.

| Acción | Usuario | Administrador |
|---|---|---|
| Crear publicaciones y comentarios | ✅ | ✅ |
| Editar sus publicaciones y comentarios | ✅ | ✅ |
| Editar contenido de otros | ❌ | ❌ |
| Eliminar sus publicaciones y comentarios | ✅ | ✅ |
| Eliminar contenido de otros | ❌ | ✅ |
| Marcar "Lo creo" en publicaciones propias | ❌ | ❌ |

## Modelo de datos

| Colección | Contenido |
|---|---|
| `usuarios` | Datos personales, correo y nombre de usuario únicos, contraseña encriptada, foto, perfil (`usuario` / `administrador`) y estado `habilitado`. |
| `publicaciones` | Autor, título, descripción, imagen opcional, contadores de "Lo creo" y comentarios, `editada` y `activa` (baja lógica). |
| `megustas` | Un documento por cada "Lo creo": usuario y publicación, con índice único. |
| `comentarios` | Publicación, autor, mensaje, `modificado` y `activo` (baja lógica). |

Todas las colecciones guardan `createdAt` y `updatedAt`, que se utilizan para ordenar y para las estadísticas por período.

## API

Todas las rutas, salvo registro y login, requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| POST | `/auth/registro` | Registro con foto de perfil (form-data) | 201 |
| POST | `/auth/login` | Login con correo o nombre de usuario | 200 |
| POST | `/auth/autorizar` | Valida el token y devuelve el usuario | 200 / 401 |
| POST | `/auth/refrescar` | Devuelve un token nuevo de 15 minutos | 200 / 401 |
| POST | `/publicaciones` | Crea una publicación (imagen opcional) | 201 |
| GET | `/publicaciones?orden=&usuario=&offset=&limit=` | Lista, ordena, filtra y pagina | 200 |
| GET | `/publicaciones/:id` | Obtiene una publicación | 200 / 404 |
| PUT | `/publicaciones/:id` | Edita título y descripción (solo el autor) | 200 / 403 |
| DELETE | `/publicaciones/:id` | Baja lógica (autor o administrador) | 204 / 403 |
| POST | `/publicaciones/:id/me-gusta` | Marca "Lo creo" | 201 / 409 |
| DELETE | `/publicaciones/:id/me-gusta` | Quita "Lo creo" | 200 / 404 |
| GET | `/publicaciones/:id/comentarios?offset=&limit=` | Lista comentarios, más recientes primero | 200 |
| POST | `/publicaciones/:id/comentarios` | Agrega un comentario | 201 |
| PUT | `/comentarios/:id` | Edita el mensaje y marca `modificado: true` | 200 / 403 |
| DELETE | `/comentarios/:id` | Baja lógica (autor o administrador) | 204 / 403 |

Los errores siguen los códigos HTTP correspondientes: **400** (datos inválidos), **401** (sin token o token vencido), **403** (sin permiso), **404** (no existe o fue dado de baja) y **409** (dato duplicado). Nunca se responde 200 ante un error.

## Principales módulos

### Usuarios y registro

Registro con nombre, apellido, correo, nombre de usuario, contraseña, fecha de nacimiento, descripción y foto de perfil. Los requisitos de la contraseña se muestran mientras se escribe, y la fecha de nacimiento se elige con selectores de día, mes y año. Se exige una edad mínima de 14 años, validada en el frontend y en el backend.

### Publicaciones

Cada publicación es un componente reutilizable con autor, fecha y hora de publicación, título, descripción, imagen opcional, "Lo creo" y comentarios. El feed se ordena por fecha o por cantidad de "Lo creo" y utiliza **scroll infinito**. El autor puede editar el título y la descripción; en ese caso se muestra *"Esta publicación fue editada"*.

### "Lo creo"

Es el "Me gusta" que pide el TP, adaptado a la temática de LINCOS y representado con un ovni. Un usuario puede marcarlo una sola vez por publicación y no puede marcarlo en sus propias publicaciones. En el código se mantienen los nombres `meGusta` y `cantidadMeGusta` para que la relación con el enunciado sea directa.

### Comentarios

En la página de detalle se muestran de a 3, del más reciente al más viejo, con un botón para cargar los siguientes sin perder los anteriores. Los comentarios propios se pueden editar y eliminar; al editarlos se muestra *"Este comentario fue editado"*.

### Mi perfil

Muestra todos los datos del usuario, su foto y sus últimas 3 publicaciones con sus comentarios.

### Pipes y directivas propias

| Tipo | Nombre | Uso |
|---|---|---|
| Pipe | `tiempoRelativo` | Muestra "Hace 5 min", "Ayer" o la fecha. |
| Pipe | `nombreCompleto` | Arma "Nombre Apellido". |
| Directiva | `appScrollInfinito` | Detecta el final del feed con `IntersectionObserver` y pide la página siguiente. |

## Decisiones técnicas

### Backend propio con reglas de negocio en los servicios

Todas las validaciones de permisos, propiedad del contenido y estados se resuelven en los servicios de NestJS. Los DTOs validan los datos de entrada con `class-validator` y el `ValidationPipe` global descarta las propiedades que no están declaradas. Así, por ejemplo, un usuario no puede asignarse el perfil de administrador enviando ese campo en el registro.

### Token en `localStorage`

El TP permite guardar el token localmente o en cookies. Se eligió `localStorage` con el header `Authorization` porque simplifica el control del vencimiento desde el frontend (necesario para el modal de los 10 minutos) y evita la configuración de cookies entre dominios distintos (Firebase y Render). El riesgo de XSS se mitiga con el escapado de Angular y la duración corta del token.

### Aviso de sesión calculado desde el token

El modal no depende de un contador fijo desde el login: el servicio de sesión lee el vencimiento (`exp`) del token y programa el aviso a los 2/3 de su duración. Así funciona correctamente aunque se recargue la página a mitad de la sesión.

### Baja lógica

Las publicaciones y los comentarios no se eliminan de la base: se marcan como inactivos. Al dar de baja una publicación, también dejan de estar disponibles sus comentarios.

### Contadores e índices

Las publicaciones guardan contadores de "Lo creo" y de comentarios, que se actualizan con `$inc`. Esto permite ordenar y paginar el feed sin contar documentos en cada consulta. La unicidad del "Lo creo" se garantiza con un índice único `{ usuario, publicacion }`: aunque lleguen dos peticiones al mismo tiempo, la base de datos rechaza la segunda.

### Imágenes en Cloudinary

Las imágenes no se guardan en MongoDB ni en el disco del servidor, porque Render borra los archivos en cada reinicio. Se suben a Cloudinary y en la base solo se guarda la URL. Antes de subirlas se valida su tipo (JPG, PNG o WEBP) y su tamaño (2 MB).

### Modales propios

No se utilizan `alert()` ni `confirm()`. Un único componente `Modal`, controlado por un servicio, se usa para confirmaciones (eliminar, cerrar sesión), mensajes informativos y el aviso de sesión. Mientras está abierto, el resto de la aplicación queda bloqueada con el atributo `inert`.

### Pantallas de carga con tiempo mínimo

En el login y el registro, el spinner se muestra al menos 3 segundos combinando la petición con un `timer` mediante `forkJoin`. Durante la carga, la página de fondo queda bloqueada.

## Ejecución local

### Backend

```bash
cd lincos-back
npm install
npm run start:dev
```

Requiere un archivo `.env` en `lincos-back/` (ver `.env.example`):

```
PORT=3000
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONT_URL=http://localhost:4200
```

### Frontend

```bash
cd lincos-front
npm install
ng serve
```

La aplicación queda disponible en `http://localhost:4200` y consume la API en `http://localhost:3000`.

## Deploy

- **Frontend:** `ng build` y `firebase deploy --only hosting` desde `lincos-front`.
- **Backend:** Render despliega automáticamente `lincos-back` con cada `git push` a `main`. Las variables de entorno se configuran en el panel de Render.

## Pruebas de la API

Las peticiones de cada sprint, con sus casos de éxito y de error, están armadas en una colección de Postman organizada por sprint.

## Pendiente (sprint 4)

- Panel de administración: listado, alta, habilitación y deshabilitación de usuarios.
- Estadísticas con gráficos y período seleccionable.
- Pipe y directivas propias restantes.

---

Programación IV — 2026
