# Sonidos de letras grabados (opcional)

La voz del sistema dice el **nombre** de las letras ("pe", "te", "de") y no su
**sonido** ("p", "t", "d"). Para la conciencia fonológica conviene que el niño
oiga el sonido puro. Si grabas los sonidos, la app los usa automáticamente
en la pantalla de enseñanza de cada letra (botón "Sonido"); si falta un
archivo, usa la voz del sistema.

## Cómo grabar

1. Graba con el teléfono un archivo por letra, de 1 segundo, diciendo solo el
   sonido: `a.mp3` → "aaa", `m.mp3` → "mmm", `p.mp3` → "p" (sin la "e").
2. Nombres de archivo, en minúscula y sin tilde:
   `a e i o u m p s l t n d b c f g j r rr v z enie h ch ll qu y br pl tr fl gr dr`
   (la eñe se llama `enie.mp3`).
3. Copia los `.mp3` en esta carpeta y vuelve a construir la imagen
   (`docker compose up -d --build`), o cópialos en `server/public/sounds/`
   del contenedor en marcha.

Consejo: para las consonantes "explosivas" (p, t, k, b, d, g) di el sonido
corto y seco, sin añadir vocal: "p", no "pe" ni "pə".
