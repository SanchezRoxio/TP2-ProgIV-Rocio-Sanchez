# 🕹️ BookFace

Red social para el TP de Programación IV. Angular en el front, NestJS + MongoDB en el back, con JWT propio (sin librerías de auth de terceros) y fotos hosteadas en Cloudinary. Back y front están deployados por separado en Vercel.

## ¿Qué hace?

- Registro e inicio de sesión (con foto de perfil opcional), con un token JWT guardado en una cookie `httpOnly` — no en `localStorage`, para que ni el propio JavaScript de la página pueda leer el token.
- Feed de publicaciones (texto + imagen opcional), con "me gusta", borrado (solo el autor) y dos formas de ordenar: más recientes o más likes. El feed usa paginación real (botones anterior/siguiente que reemplazan el contenido), no "cargar más".
- Pantalla de una publicación individual con sus comentarios: crear comentario, "cargar más comentarios" (este sí suma, sin tapar los anteriores) y editar el comentario propio (marcándolo como "(editado)").
- "Mi perfil" con los datos del usuario y sus propias publicaciones, también paginadas.
- Sesión con aviso de vencimiento: el token dura 15 minutos, y a los 10 aparece un cartel preguntando si querés extenderla (sin tener que volver a loguearte).
- Tema claro/oscuro, elegido a mano con una paleta de colores propia.
- Rol de **administrador**: dashboard para ver todos los usuarios, crear nuevos (eligiendo si son "usuario" o "administrador"), y habilitar/deshabilitar cuentas (un usuario deshabilitado no puede loguear). Un admin también puede borrar publicaciones ajenas, no solo las propias.
- Dashboard de **estadísticas** con 3 gráficos (publicaciones por usuario, comentarios por día, comentarios por publicación), con un rango de fechas elegible.
- La app se puede instalar como **PWA**.

## ¿Cómo está armado?

### Angular standalone + signals

Como en el TP de Cine, todos los componentes son **standalone** (sin `NgModule`) y el estado se maneja con **signals** en vez de guardar todo en servicios con variables sueltas. Las rutas se cargan bajo demanda con `loadComponent`.

### JWT en cookie httpOnly, no en localStorage

El backend genera el token y lo manda en una cookie `httpOnly` (el navegador la guarda solo, ni mi propio código Angular puede leerla). Esto es más seguro que `localStorage` porque un ataque de XSS no podría robarse el token. A cambio, cada pedido del front tiene que viajar con `withCredentials: true` (hay un interceptor funcional que se lo agrega a todos), y el backend necesita CORS con `credentials: true` y un origin explícito (no puede ser `*` cuando se usan cookies).

### Nadie manda su propio ID

En el Sprint 1 el "quién hace esta acción" se mandaba a mano desde el front (`usuarioId` en el body), a propósito como paso intermedio antes de tener JWT. Una vez que hubo JWT de verdad, saqué ese campo de todos lados: ahora un `AuthGuard` de NestJS lee la cookie, valida el token, y cuelga los datos del usuario en el pedido (`request.user`) — las rutas que necesitan saber quién sos (crear publicación, comentar, dar like, borrar) leen de ahí, nunca de algo que mandó el cliente. Esto evita que alguien pueda, por ejemplo, borrar una publicación ajena mandando el ID de otro usuario a mano.

### Pantalla de carga que valida la sesión una sola vez

Al entrar a la app (ruta `/`), una pantalla de "Cargando" le pregunta al backend (`POST /auth/autorizar`) si la cookie que ya hay sigue siendo válida, y recién ahí decide si mandarte a `/publicaciones` o a `/login`. Si refrescás la página en cualquier otra ruta, el guard de esa ruta hace la misma pregunta (de forma asíncrona) si todavía no tiene los datos del usuario en memoria — así refrescar nunca te desloguea de prepo.

### Interceptor global de 401

Si cualquier pedido al backend responde 401 (token vencido o inválido), un interceptor funcional limpia el estado de sesión en el front y redirige a `/login`, en vez de dejar pantallas rotas mostrando datos de un usuario que técnicamente ya no está logueado.

### Fotos en Cloudinary, no en el disco del servidor

Al principio las fotos (de perfil y de publicaciones) se guardaban en una carpeta `uploads/` del propio servidor con Multer. Eso funciona en una compu local, pero **Vercel no permite escribir archivos en su filesystem** (las funciones son efímeras). Por eso Multer ahora guarda el archivo en memoria (no en disco) y lo sube a **Cloudinary**, que devuelve una URL pública que es la que se guarda en MongoDB.

### Paginación real vs. "cargar más", según la pantalla

El feed de publicaciones y "Mis publicaciones" piden **paginación real** (anterior/siguiente, reemplazando el contenido). Los comentarios de una publicación, en cambio, piden explícitamente que "cargar más" no tape los anteriores, así que ahí el botón suma comentarios a la lista en vez de reemplazarla. Son dos patrones de paginación distintos a propósito.

### Deploy: backend serverless en Vercel + NestJS

NestJS no está pensado para correr como función serverless por default (arranca un servidor que queda escuchando), así que hay un archivo (`backend/api/index.mts`) que envuelve la app de Nest con el adaptador de Express y la expone como handler de función. El punto más difícil de todo el despliegue: Nest 12 es un paquete puro de **ESM** (`"type": "module"` en su `package.json`), y el runtime de funciones de Vercel no soporta que un archivo CommonJS haga `require()` de un paquete ESM. La solución fue convertir **todo** el backend a ESM real (`"type": "module"` en el `package.json` propio, y agregarle `.js` a cada import relativo, como pide Node), así ningún archivo necesita hacer `require()` de nada.

### Cookies en producción

Como el front y el back terminaron deployados en dominios distintos (`*.vercel.app` distintos para cada uno), la cookie del token necesita `sameSite: 'none'` + `secure: true` para que el navegador la mande en pedidos cross-site — en local (`localhost:4200` hablándole a `localhost:3000`) alcanza con `sameSite: 'lax'` y `secure: false` porque ahí es el mismo "site" (mismo hostname). El backend elige una config u otra mirando si está corriendo en Vercel (`process.env.VERCEL`).

### Un segundo guard para las rutas de administrador

Además del `AuthGuard` (que solo exige estar logueado), hay un `AdminGuard` que además valida que el `perfil` del token sea `'administrador'` — si no, devuelve 403. Se usa en el controller de usuarios y en el de estadísticas, los dos exclusivos de admins. Del lado del front hay el mismo patrón: un `adminGuard` (`CanMatchFn`) que oculta esas rutas si no sos admin, además de que el link ni siquiera aparece en el header.

### Gráficos sin ninguna librería

Los 3 gráficos del dashboard de estadísticas están hechos a mano, sin instalar Chart.js ni nada similar — mismo criterio que usé en el TP de Cine:
- **Barras** (publicaciones por usuario): divs con el ancho en porcentaje relativo al valor más alto.
- **Líneas** (comentarios por día): un `<svg>` con un único `<polyline>`, calculando a mano la posición X/Y de cada punto según los datos. Es HTML nativo, no una librería.
- **Torta** (comentarios por publicación): un div circular con `background: conic-gradient(...)`, calculando a mano en qué porcentaje empieza y termina cada color.

Las 3 rutas que alimentan estos gráficos (`/estadisticas/*`) usan el `aggregate()` de Mongoose/MongoDB (el equivalente a un `GROUP BY` de SQL) para contar y agrupar directamente en la base, en vez de traer todo a memoria y calcularlo en JavaScript.

### Baja lógica también para usuarios

Mismo patrón que ya usaba `Publicacion.activa`: los usuarios tienen un campo `activo` (default `true`). Deshabilitar a alguien no borra su cuenta ni sus datos, solo le bloquea el login — y el chequeo pasa en el backend (`auth.service.ts`), nunca en el front, para que no se pueda saltear editando el HTML.

## Decisiones técnicas que tomé

- **bcryptjs en vez de bcrypt**: la versión nativa de `bcrypt` necesita compilar código en C++ al instalar (node-gyp), lo cual da problemas en Windows. `bcryptjs` hace lo mismo en JS puro.
- **`JwtModule.registerAsync` en vez de `register`**: con `register()` a secas, el `JWT_SECRET` se lee de `process.env` apenas se importa el archivo — antes de que `ConfigModule.forRoot()` llegue a cargar el `.env`. Con `registerAsync`, la lectura se pospone hasta que la app arranca de verdad. El mismo problema (y la misma solución) aplica a la configuración de Cloudinary.
- **El token dura 15 minutos**, con aviso a los 10 para extenderlo — un balance entre seguridad (sesiones que no quedan abiertas para siempre) y no interrumpir al usuario a cada rato.
- **Nunca mutar un `@Input()` directamente**: cuando una publicación cambia (por ejemplo, al dar like), el componente hijo emite un evento y es el padre el que actualiza su propio signal reemplazando el elemento — mutar el objeto del `@Input()` a mano no dispara una repintada en este proyecto, que no usa Zone.js.
- **Validación de "solo el autor puede editar/borrar" siempre del lado del servidor**, comparando el usuario del token contra el dueño real del recurso en la base — nunca confiando en lo que mande el botón del front.
- **El primer administrador se crea a mano en la base de datos**, no desde la app. El registro público siempre crea usuarios con perfil `"usuario"` (dejar que cualquiera se registre como admin sería un agujero de seguridad); una vez que existe al menos un admin, el resto de los admins se crean desde el dashboard.
- **El `@angular/pwa` oficial no sirve con el builder nuevo de Angular** (`@angular/build:application`, el que usa este proyecto desde Angular 17+): el schematic está pensado para la config vieja y tira error. El soporte PWA se armó a mano: se instaló `@angular/service-worker` directo, se escribió el `ngsw-config.json`, y se activó el `serviceWorker` en `angular.json` (solo para el build de producción, igual que en RoxiMovie).
- **Las rutas de agregación (`/estadisticas/*`) calculan el nombre de la colección de Mongo en vez de escribirlo a mano** (`this.publicacionModel.collection.name`): Mongoose pluraliza `Publicacion` como `publicacions` (no `publicaciones`, porque no entiende gramática en español), así que hardcodear el nombre de la colección en el `$lookup` hubiera sido un bug esperando pasar.

## Cómo correr el proyecto

Backend (necesita un `.env` con `CONNECTION_STRING`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`):

```bash
cd backend
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npx ng serve
```

## Estado actual

Lo que ya funciona: registro/login con JWT en cookie httpOnly, feed de publicaciones con like/borrado/paginación real y dos ordenamientos, comentarios (crear/paginar/editar), "Mi perfil", aviso de sesión por vencer con extensión, tema claro/oscuro, fotos de perfil y de publicaciones subidas a Cloudinary, dashboard de administración (alta/baja de usuarios, creación de admins, moderación de publicaciones ajenas), dashboard de estadísticas con 3 gráficos hechos a mano, soporte PWA, 3 pipes propias (`tiempoRelativo`, `truncar`, `iniciales`) y 3 directivas propias (`appEnfocar`, `appConfirmarAccion`, `appResaltarFila`), y todo deployado: backend como función serverless en Vercel (con MongoDB Atlas) y frontend como proyecto separado también en Vercel.

Pendiente (sprints siguientes del enunciado, no empezados todavía): scroll infinito reemplazando la paginación tradicional, ver el perfil de otros usuarios, estadísticas de logins/visitas a perfil/likes por día, y la funcionalidad de guardar y compartir publicaciones.
