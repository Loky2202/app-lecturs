# Misión Lectura 🦖🚗🎮⚡

Sistema completo de enseñanza de la lectura en español para niños de 6 años,
pensado para un niño al que le cuesta mantener la atención. Se instala en un
servidor de casa (Docker / CasaOS) y se usa desde la tablet por red local, sin
internet.

- **Camino de aprendizaje**: 50 lecciones en 6 unidades (vocales, primeras
  letras, más letras, palabras, frases y cuentos). Cada lección enseña primero
  (letra, sonido, sílabas y palabras con voz) y después practica con juegos.
- **Palabras descifrables**: cada lección solo usa palabras que se pueden leer
  con las letras ya enseñadas (sin dígrafos ni grupos como TR o PL antes de
  tiempo). La Ñ, la QU y la RR se practican dentro de la palabra.
- **Mayúsculas y minúsculas**: las letras se aprenden en mayúscula y una
  lección propia ("Las letras pequeñas") hace el paso a las minúsculas antes
  de las frases y los cuentos.
- **15 juegos** de modo libre con 4 mundos: dinosaurios, carros, videojuegos y
  monstruitos coleccionables.
- **8 cuentos** por páginas con preguntas de comprensión: dos en mayúsculas,
  muy cortos, se abren al terminar las primeras consonantes.
- **Sonidos grabados (opcional)**: si copias audios de los sonidos de las letras
  en `client/public/sounds/` (ver el README de esa carpeta) la app los usa en
  vez de la voz del sistema, que dice "pe" en lugar de "p".
- **Motivación**: estrellas, álbum de 40 tarjetas, 19 logros, mascota que
  evoluciona, meta diaria y racha de días.
- **Atención**: una tarea por pantalla, instrucciones en voz alta, misiones
  cortas, pistas al segundo error, pausas activas de movimiento.
- **Varios niños**: perfiles independientes guardados en el servidor.
- **Zona de padres** (PIN): progreso por día y por actividad, nivel, ajustes de
  voz y duración, palabras personalizadas, exportación de datos.

## Instalación en el servidor (Ubuntu Server 24 + CasaOS)

### Opción 1: importar en CasaOS (recomendada)

1. En CasaOS abre **App Store → Custom install** (icono de importar) y pega el
   contenido de `docker-compose.yml`.
2. En el compose, deja **una** de las dos líneas:
   - `image: ghcr.io/loky2202/app-lecturs:latest` si el servidor tiene internet
     (descarga la imagen ya compilada). Comenta la línea `build: .`.
   - `build: .` si prefieres compilar en el propio servidor (necesita internet
     para descargar las dependencias de npm la primera vez).
3. Instala. La app queda en `http://IP-DEL-SERVIDOR:8080`.

### Opción 2: línea de comandos

```bash
git clone https://github.com/Loky2202/app-lecturs.git
cd app-lecturs
docker compose up -d --build
```

### Opción 3: servidor totalmente sin internet

Construye la imagen en una computadora con internet y llévala al servidor con
un USB:

```bash
# en la computadora con internet
docker build -t mision-lectura:1.0 .
docker save mision-lectura:1.0 | gzip > mision-lectura.tar.gz

# en el servidor (copiar el archivo antes)
docker load < mision-lectura.tar.gz
docker run -d --name mision-lectura --restart unless-stopped \
  -p 8080:8080 -v mision-lectura-data:/data mision-lectura:1.0
```

La app no usa nada de internet en tiempo de ejecución: ni fuentes, ni CDN, ni
servicios externos. La voz la genera el propio navegador de la tablet.

### Verificar

```bash
curl http://localhost:8080/api/health     # → {"ok":true,...}
docker logs mision-lectura
```

## En la tablet

1. Conecta la tablet al mismo wifi y abre `http://IP-DEL-SERVIDOR:8080` en
   Chrome (Android) o Safari (iPad).
2. Menú del navegador → **Añadir a pantalla de inicio**. Queda como una app a
   pantalla completa con su icono.
3. Comprueba que la tablet tenga una **voz en español** instalada. En Android:
   Ajustes → Sistema → Idiomas → Salida de texto a voz → instalar voz
   "Español". En iPad viene incluida. La zona de padres avisa si no la detecta.
4. Crea el perfil del niño (nombre, personaje y mundo favorito).

Consejo: fija el navegador en modo kiosco o "anclar pantalla" para que no salga
de la app.

## Zona de padres

PIN inicial **1234** (cámbialo en Seguridad). Desde cualquier dispositivo de la
red puedes ver el progreso del niño sin tocar la tablet.

- Nivel del modo libre (automático o fijo 1-5), tareas por misión (3/5/8),
  meta diaria, voz, velocidad de voz, sonidos, pausas activas.
- "Desbloquear todas las lecciones y juegos" si quieres saltar el orden.
- Palabras personalizadas: añade los nombres de sus juguetes o personajes
  (palabra, sílabas con guion, emoji). Aparecen en todos los juegos.
- Exportar datos (JSON) y borrar perfil.
- **Imágenes y voces**: para cada palabra puedes cambiar el icono o cargar
  una imagen (foto de su juguete, de su perro…). Si hay imagen se muestra la
  imagen; si no, el icono. También puedes grabar con tu voz las palabras, las
  letras y las sílabas: si hay grabación se usa; si no, la voz del dispositivo.
  Grabar con el micrófono desde el navegador solo funciona en conexión segura
  (https o localhost); por `http://IP:8080` usa «Subir audio» con un archivo
  de la grabadora del dispositivo. Todo se guarda en la base de datos de `/data`.

## Contenido

| Unidad | Lecciones | Qué trabaja |
|---|---|---|
| 1 Las vocales | A, E, I, O, U, repaso | Reconocer, trazar, sonido inicial |
| 2 Primeras letras | M, P, S, L, T, N, D, repaso | Sílabas directas, palabras de 2 sílabas |
| 3 Más letras | B, C, F, G, J, R, V, Z, Ñ, H, CH, LL, QU, Y, repaso | Todas las letras y dígrafos |
| 4 Palabras | 2 sílabas, 3 sílabas, trabadas, rimas, largas, repaso | Lectura y escritura de palabras |
| 5 Frases | 3 lecciones | Comprensión de frases, fluidez |
| 6 Cuentos | 6 cuentos | Lectura de textos con preguntas |

Juegos: vocal que falta, letra inicial, escucha la sílaba, sílaba inicial, lee y
elige, escucha y busca, arma la palabra, dictado, traza la letra, rimas,
memoria, lee la frase, carrera de lectura y caza de letras.

El nivel del modo libre sube solo (dos misiones seguidas con 80 % de aciertos)
y también con el avance en el camino de lecciones.

## Estructura del proyecto

```
Dockerfile            imagen única: compila la interfaz y arranca el servidor
docker-compose.yml    despliegue (compatible con CasaOS)
server/               Node 22 + Fastify + SQLite (módulo nativo node:sqlite)
  src/server.js       API REST y archivos estáticos
  src/db.js           esquema de la base de datos
client/               Vue 3 + Vite
  src/content/        palabras, lecciones, cuentos, frases, rimas, mundos
  src/games/          los 14 juegos
  src/views/          pantallas
  src/stores/app.js   estado, progreso, logros, nivel
```

Datos: se guardan en el volumen `/data` (archivo SQLite). Haz copia de ese
volumen para no perder el progreso.

### API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/health` | estado |
| GET/POST | `/api/profiles` | listar / crear perfil |
| PUT/DELETE | `/api/profiles/:id` | editar / borrar (PIN) |
| GET/PUT | `/api/profiles/:id/progress` | progreso del niño |
| POST | `/api/profiles/:id/events` | registro de tareas |
| GET | `/api/profiles/:id/stats?days=14` | estadísticas (PIN) |
| GET | `/api/profiles/:id/export` | exportar todo (PIN) |
| POST | `/api/parent/login` | PIN → token |
| PUT | `/api/parent/pin` | cambiar PIN |
| GET/POST/DELETE | `/api/words` | palabras personalizadas |
| GET | `/api/media` | lista de imágenes, grabaciones e iconos |
| GET/PUT/DELETE | `/api/media/:kind/:key` | archivo (`image`, `audio`) o icono (`icon`); escribir pide PIN |

## Desarrollo

```bash
npm run install:all
npm run dev:server     # API en :8080
npm run dev:client     # interfaz en :5173 con recarga automática
npm run build          # compila la interfaz dentro de server/public
```

Para añadir palabras fijas edita `client/src/content/words.js`; para lecciones,
`lessons.js`; para cuentos, `stories.js`.

## Añadir más contenido

Palabra: `W('TORTUGA', 'TOR-TU-GA', '🐢', 'monstruos')`.
Cuento: objeto con `pages` (emoji + texto) y `questions` (pregunta, 3 emojis,
índice correcto). Se añade solo al camino de lecciones.
