/* Mundos, mascotas, pausas activas, logros y frases. */

export const WORLDS = [
  {
    id: 'dinos', name: 'Dinosaurios', emoji: '🦕', color: '#43a047',
    mascot: ['🥚', '🐣', '🦎', '🦕', '🦖'],
    cards: [
      { e: '🦕', n: 'Cuello Largo', t: 'Come hojas de los árboles.' }, { e: '🦖', n: 'Rex', t: 'Tiene dientes muy grandes.' },
      { e: '🥚', n: 'Huevo Dino', t: 'Pronto va a nacer un bebé.' }, { e: '🦴', n: 'Hueso Viejo', t: 'Es un fósil muy antiguo.' },
      { e: '🐊', n: 'Croco', t: 'Nada rápido en el río.' }, { e: '🦎', n: 'Lagartín', t: 'Toma el sol en la roca.' },
      { e: '🌋', n: 'Volcán Rojo', t: 'Tira lava caliente.' }, { e: '☄️', n: 'Meteoro', t: 'Cae del cielo con luz.' },
      { e: '🦖', n: 'Rex Dorado', t: 'Es el rey de los dinos.' }, { e: '🐉', n: 'Dino Dragón', t: 'Un dino con alas. ¡Vuela!' },
    ],
  },
  {
    id: 'carros', name: 'Carros', emoji: '🏎️', color: '#e53935',
    mascot: ['🛞', '🛴', '🚲', '🚗', '🏎️'],
    cards: [
      { e: '🚗', n: 'Carrito Azul', t: 'Va a la escuela cada día.' }, { e: '🏎️', n: 'Bólido', t: 'Es el más rápido de la pista.' },
      { e: '🚓', n: 'Patrulla', t: 'Cuida la ciudad de noche.' }, { e: '🚒', n: 'Bombero', t: 'Apaga el fuego con agua.' },
      { e: '🚜', n: 'Tractor', t: 'Trabaja en el campo.' }, { e: '🚀', n: 'Cohete', t: 'Vuela hasta la luna.' },
      { e: '🚁', n: 'Helicóptero', t: 'Gira sus hélices y sube.' }, { e: '🛵', n: 'Vespa', t: 'Lleva pizza muy rápido.' },
      { e: '🚂', n: 'Locomotora', t: 'Chu chu, por las vías.' }, { e: '🛸', n: 'Nave Secreta', t: 'Viene de otro planeta.' },
    ],
  },
  {
    id: 'juegos', name: 'Videojuegos', emoji: '🎮', color: '#8e24aa',
    mascot: ['🕹️', '🎮', '🤖', '👾', '🏆'],
    cards: [
      { e: '🎮', n: 'Mando Maestro', t: 'Tiene botones de colores.' }, { e: '🤖', n: 'Robo-Bip', t: 'Dice bip bop al caminar.' },
      { e: '👾', n: 'Píxel', t: 'Vive dentro de la pantalla.' }, { e: '👻', n: 'Bu', t: 'Se esconde en el castillo.' },
      { e: '🏆', n: 'Copa de Oro', t: 'Es para el campeón.' }, { e: '💎', n: 'Gema Azul', t: 'Brilla en el tesoro.' },
      { e: '🧙', n: 'Mago Pip', t: 'Hace magia con su varita.' }, { e: '🐲', n: 'Jefe Final', t: 'Cuida la última puerta.' },
      { e: '🗝️', n: 'Llave Secreta', t: 'Abre un nivel escondido.' }, { e: '🌟', n: 'Súper Estrella', t: 'Te hace invencible.' },
    ],
  },
  {
    id: 'monstruos', name: 'Monstruitos', emoji: '⚡', color: '#fb8c00',
    mascot: ['🥚', '🐣', '🐥', '⚡', '🐉'],
    cards: [
      { e: '⚡', n: 'Chispa', t: 'Es de tipo rayo y corre mucho.' }, { e: '🔥', n: 'Fogón', t: 'Es de tipo fuego y da calor.' },
      { e: '💧', n: 'Gotita', t: 'Es de tipo agua y nada bien.' }, { e: '🌱', n: 'Hojín', t: 'Es de tipo planta y crece al sol.' },
      { e: '🐉', n: 'Drako', t: 'Es de tipo dragón y vuela alto.' }, { e: '🦇', n: 'Noctu', t: 'Sale de noche y ve en lo oscuro.' },
      { e: '🧊', n: 'Frosti', t: 'Es de tipo hielo y nunca suda.' }, { e: '🦄', n: 'Lumi', t: 'Es legendario y brilla.' },
      { e: '🐢', n: 'Rocoso', t: 'Su caparazón es de piedra.' }, { e: '🌪️', n: 'Torbellino', t: 'Es de tipo viento y gira.' },
    ],
  },
];
export const worldById = (id) => WORLDS.find((w) => w.id === id) || WORLDS[0];

export const BREAKS = [
  { e: '🦖', t: 'Salta 10 veces como un T-Rex.' }, { e: '🏎️', t: 'Corre en tu lugar como un carro de carreras.' },
  { e: '🤖', t: 'Camina como un robot por el cuarto.' }, { e: '🐸', t: 'Da 5 saltos de rana.' },
  { e: '🌬️', t: 'Respira hondo 3 veces, como un dragón tranquilo.' }, { e: '🦕', t: 'Estira el cuello como un dino, bien alto.' },
  { e: '💧', t: 'Toma un poco de agua.' }, { e: '🙆', t: 'Levanta los brazos y muévelos como alas.' },
  { e: '🐢', t: 'Camina muy despacio como una tortuga y luego rápido como un rayo.' },
];

export const TROPHIES = [
  { id: 'primera-leccion', e: '📗', n: 'Primera lección', t: 'Terminaste tu primera lección.' },
  { id: 'primera-mision', e: '🚀', n: 'Primera misión', t: 'Completaste una misión de juegos.' },
  { id: 'estrellas-10', e: '⭐', n: '10 estrellas', t: 'Ganaste 10 estrellas.' },
  { id: 'estrellas-50', e: '🌟', n: '50 estrellas', t: 'Ganaste 50 estrellas.' },
  { id: 'estrellas-100', e: '💫', n: '100 estrellas', t: 'Ganaste 100 estrellas.' },
  { id: 'estrellas-250', e: '🌠', n: '250 estrellas', t: '¡Eres una súper estrella!' },
  { id: 'racha-3', e: '🔥', n: '3 días seguidos', t: 'Practicaste 3 días seguidos.' },
  { id: 'racha-7', e: '🏅', n: '7 días seguidos', t: 'Una semana entera de lectura.' },
  { id: 'unidad-1', e: '🅰️', n: 'Rey de las vocales', t: 'Terminaste la unidad de vocales.' },
  { id: 'unidad-2', e: '🧩', n: 'Primeras letras', t: 'Terminaste la unidad 2.' },
  { id: 'unidad-3', e: '🔤', n: 'Todas las letras', t: 'Terminaste la unidad 3.' },
  { id: 'unidad-4', e: '📖', n: 'Lector de palabras', t: 'Terminaste la unidad 4.' },
  { id: 'unidad-5', e: '💬', n: 'Lector de frases', t: 'Terminaste la unidad 5.' },
  { id: 'unidad-6', e: '📚', n: 'Lector de cuentos', t: 'Terminaste todos los cuentos.' },
  { id: 'primer-cuento', e: '📕', n: 'Primer cuento', t: 'Leíste tu primer cuento.' },
  { id: 'album', e: '📒', n: 'Álbum completo', t: 'Completaste el álbum de un mundo.' },
  { id: 'velocista', e: '🏁', n: 'Velocista', t: 'Ganaste una carrera de lectura.' },
  { id: 'cazador', e: '🎯', n: 'Cazador', t: 'Una caza perfecta sin fallos.' },
  { id: 'perfecta', e: '💯', n: 'Misión perfecta', t: 'Todo a la primera en una misión.' },
];

export const GAMES = [
  { id: 'vocal', n: '¿Qué vocal falta?', e: '🅰️', d: 'Completa la palabra con la vocal.', minLevel: 1 },
  { id: 'inicial', n: 'Letra inicial', e: '🔤', d: '¿Con qué letra empieza?', minLevel: 1 },
  { id: 'silaba', n: 'Escucha la sílaba', e: '👂', d: 'Toca la sílaba que oyes.', minLevel: 2 },
  { id: 'silabaInicial', n: 'Sílaba inicial', e: '🧩', d: '¿Con qué sílaba empieza?', minLevel: 2 },
  { id: 'lee', n: 'Lee y elige', e: '👀', d: 'Lee la palabra y toca el dibujo.', minLevel: 1 },
  { id: 'escucha', n: 'Escucha y busca', e: '🔊', d: 'Oye la palabra y encuéntrala escrita.', minLevel: 2 },
  { id: 'arma', n: 'Arma la palabra', e: '🧱', d: 'Ordena las sílabas.', minLevel: 2 },
  { id: 'dictado', n: 'Dictado', e: '✏️', d: 'Escribe la palabra con letras.', minLevel: 3 },
  { id: 'traza', n: 'Traza la letra', e: '🖍️', d: 'Dibuja la letra con el dedo.', minLevel: 1 },
  { id: 'rima', n: 'Rimas', e: '🎵', d: '¿Cuál rima?', minLevel: 3 },
  { id: 'memoria', n: 'Memoria', e: '🃏', d: 'Encuentra las parejas.', minLevel: 2 },
  { id: 'frase', n: 'Lee la frase', e: '💬', d: 'Lee y responde la pregunta.', minLevel: 4 },
  { id: 'carrera', n: 'Carrera de lectura', e: '🏁', d: 'Lee rápido y gana la carrera.', minLevel: 3 },
  { id: 'caza', n: 'Caza de letras', e: '🎯', d: 'Atrapa las letras que suenan.', minLevel: 1 },
];
export const gameById = (id) => GAMES.find((g) => g.id === id);

export const AVATARS = ['🦕', '🦖', '🚗', '🏎️', '🎮', '🤖', '⚡', '🐉', '🦊', '🐼', '🦄', '👾'];
