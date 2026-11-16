# Misión Lectura 🦖🚗🎮⚡

App web de lectura para niños de 6 años, en español. Pensada para un niño al que
le cuesta prestar atención y terminar las tareas: misiones muy cortas, una sola
actividad por pantalla, voz que lee las instrucciones, recompensas inmediatas y
pausas de movimiento. Los temas son los que le gustan: dinosaurios, carros,
videojuegos y monstruitos coleccionables.

No necesita instalación ni internet una vez abierta. Funciona en tablet,
celular y computadora.

## Cómo usarla

**Opción rápida (sin servidor):** descarga la carpeta y abre `index.html` con
Chrome, Edge o Safari. Todo funciona, excepto el modo "instalar como app".

**Opción recomendada (GitHub Pages):** en el repositorio ve a *Settings →
Pages → Branch: main / (root)* y guarda. En un minuto tendrás un enlace tipo
`https://usuario.github.io/app-lecturs/`. Ábrelo en la tablet o el celular y
usa "Añadir a pantalla de inicio": quedará como una app con su icono y
funcionará sin internet.

La voz usa el sintetizador del propio dispositivo. En Android y iPhone suele
venir una voz en español instalada; en Windows se puede añadir en
*Configuración → Hora e idioma → Voz*.

## Qué hace

**Misiones de 5 tareas** (ajustable a 3 u 8). Cada tarea correcta a la primera
da una estrella. Al terminar, el niño gana una tarjeta para su álbum (8 por
mundo, 32 en total) y ve confeti. Si falla, la app anima a intentarlo de nuevo
y, al segundo error, señala la respuesta correcta para evitar la frustración.

**8 actividades**, que aparecen según el nivel:

| Actividad | Qué trabaja | Nivel |
|---|---|---|
| ¿Qué vocal falta? | Reconocimiento de vocales | 1-2 |
| ¿Con qué letra empieza? | Conciencia fonológica inicial | 1-3 |
| Lee y toca el dibujo | Lectura de palabras | 1-4 |
| Escucha y toca la palabra | Asociación sonido-escritura | 2-5 |
| Arma la palabra | Sílabas y orden | 2-5 |
| ¿Cuál rima? | Conciencia fonológica | 3-5 |
| Memoria palabra-dibujo | Atención y lectura | 3-5 |
| Lee la frase y responde | Comprensión lectora | 4-5 |

**Nivel automático.** Empieza en el nivel 1. Sube cuando completa dos misiones
seguidas con 80 % o más de aciertos a la primera, y baja si tres misiones
seguidas salen por debajo del 50 %. En la zona de padres se puede fijar un
nivel a mano.

**Apoyos para la atención:**
- Una sola tarea en pantalla, sin menús ni anuncios ni distracciones.
- Botones grandes y pocas opciones (3 por pregunta).
- La instrucción se lee en voz alta y hay un botón 🔊 para repetirla.
- Barra de progreso con puntos: el niño ve cuánto falta para terminar.
- Pausa activa cada 2 misiones: 30 segundos de movimiento (saltar como T-Rex,
  respirar como dragón...) antes de seguir.
- Racha de días para motivar la práctica diaria corta.

**Zona de padres** (protegida con una multiplicación): progreso por actividad,
calendario de los últimos 14 días, ajustes de nivel, voz, sonidos y pausas,
y consejos prácticos para trabajar la atención en casa.

## Archivos

- `index.html` – pantallas de la app.
- `styles.css` – estilos (botones grandes, alto contraste, móvil primero).
- `app.js` – lógica de misiones, actividades, voz, progreso y zona de padres.
- `data.js` – contenido: palabras con sílabas, frases, rimas, tarjetas del
  álbum y pausas activas. Es el archivo que hay que editar para añadir más
  palabras o frases.
- `sw.js`, `manifest.webmanifest`, `icon.svg` – para instalarla como app y
  usarla sin internet.

## Añadir contenido

En `data.js`, cada palabra tiene su escritura, sus sílabas y un emoji:

```js
{ w: 'TORTUGA', s: ['TOR', 'TU', 'GA'], e: '🐢' }
```

Las frases llevan el texto, una pregunta, tres opciones (emoji) y el índice de
la respuesta correcta:

```js
{ t: 'El oso come miel.', q: '¿Qué come el oso?', o: ['🍕', '🥚', '🍯'], ans: 2, lvl: 4, world: 'monstruos' }
```

El progreso se guarda en el navegador del dispositivo (localStorage). Si se
borra el historial del navegador, se pierde; se puede reiniciar desde la zona
de padres.
