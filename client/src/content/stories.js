/* Cuentos cortos por páginas, con preguntas al final. */
export const STORIES = [
  {
    id: 'cu-1', title: 'El huevo de Rex', emoji: '🦖', world: 'dinos', lvl: 1,
    pages: [
      { e: '🥚', t: 'Rex tiene un huevo. El huevo es grande y blanco.' },
      { e: '🦖', t: 'Rex cuida el huevo de día y de noche.' },
      { e: '🌧️', t: 'Llueve mucho. Rex tapa el huevo con hojas.' },
      { e: '🐣', t: 'Crac, crac. El huevo se abre. ¡Sale un dino bebé!' },
      { e: '🦕', t: 'El bebé dice: ¡Hola, papá! Rex está feliz.' },
    ],
    questions: [
      { q: '¿Qué tiene Rex?', o: ['🥚', '🚗', '🍕'], ans: 0 },
      { q: '¿Con qué tapa el huevo?', o: ['🪨', '🍃', '🧊'], ans: 1 },
      { q: '¿Quién sale del huevo?', o: ['🐸', '🤖', '🦕'], ans: 2 },
    ],
  },
  {
    id: 'cu-2', title: 'La gran carrera', emoji: '🏎️', world: 'carros', lvl: 1,
    pages: [
      { e: '🏁', t: 'Hoy hay una carrera. El carro rojo y el carro azul están listos.' },
      { e: '🚦', t: 'Luz roja. Luz amarilla. ¡Luz verde! Los carros salen.' },
      { e: '🏎️', t: 'El carro rojo va muy rápido. El azul va detrás.' },
      { e: '🛞', t: '¡Oh no! El carro rojo pierde una rueda y se para.' },
      { e: '🏆', t: 'El carro azul no se rinde y llega a la meta. ¡Gana la copa!' },
    ],
    questions: [
      { q: '¿De qué color es el carro que gana?', o: ['🔴', '🔵', '🟢'], ans: 1 },
      { q: '¿Qué pierde el carro rojo?', o: ['🛞', '🔑', '🎈'], ans: 0 },
      { q: '¿Qué gana el carro azul?', o: ['🍦', '🎮', '🏆'], ans: 2 },
    ],
  },
  {
    id: 'cu-3', title: 'Robo-Bip y la llave', emoji: '🤖', world: 'juegos', lvl: 2,
    pages: [
      { e: '🤖', t: 'Robo-Bip vive en un videojuego. Quiere pasar al nivel dos.' },
      { e: '🚪', t: 'La puerta del nivel dos está cerrada. Necesita una llave.' },
      { e: '👻', t: 'Un fantasma tiene la llave. Robo-Bip no tiene miedo.' },
      { e: '🎲', t: 'Robo-Bip le dice: juguemos a los dados. Si gano, me das la llave.' },
      { e: '🔑', t: 'Robo-Bip saca un seis. ¡Gana! El fantasma le da la llave.' },
      { e: '🏆', t: 'La puerta se abre. ¡Bip, bop! Nivel dos.' },
    ],
    questions: [
      { q: '¿Qué necesita Robo-Bip?', o: ['🔑', '🍕', '🚗'], ans: 0 },
      { q: '¿Quién tiene la llave?', o: ['🐉', '👻', '🧙'], ans: 1 },
      { q: '¿A qué juegan?', o: ['⚽', '🧩', '🎲'], ans: 2 },
    ],
  },
  {
    id: 'cu-4', title: 'Chispa y Gotita', emoji: '⚡', world: 'monstruos', lvl: 2,
    pages: [
      { e: '⚡', t: 'Chispa es un monstruito de tipo rayo. Corre muy rápido.' },
      { e: '💧', t: 'Gotita es de tipo agua. Nada muy bien.' },
      { e: '🔥', t: 'Un día, el bosque se llena de fuego. ¡Fogón se enojó!' },
      { e: '🏃', t: 'Chispa corre a buscar a Gotita. Gotita lanza agua al fuego.' },
      { e: '🌈', t: 'El fuego se apaga. Fogón pide perdón y todos son amigos.' },
    ],
    questions: [
      { q: '¿De qué tipo es Chispa?', o: ['💧', '⚡', '🌱'], ans: 1 },
      { q: '¿Qué lanza Gotita?', o: ['💧', '🔥', '🪨'], ans: 0 },
      { q: '¿Quién se enojó?', o: ['🐉', '🧊', '🔥'], ans: 2 },
    ],
  },
  {
    id: 'cu-5', title: 'El dino que quería volar', emoji: '🦕', world: 'dinos', lvl: 3,
    pages: [
      { e: '🦕', t: 'Dino Verde miraba el cielo. Quería volar como los pájaros.' },
      { e: '🪶', t: 'Se puso plumas en los brazos. Saltó de una roca. ¡Pum! Cayó al suelo.' },
      { e: '🎈', t: 'Su amiga la rana le dio un globo grande. Dino Verde subió un poco.' },
      { e: '🌋', t: 'El viento del volcán sopló fuerte. ¡Dino Verde voló sobre las montañas!' },
      { e: '🌙', t: 'Vio la luna de cerca. Luego bajó despacio a su nido. Fue el mejor día.' },
    ],
    questions: [
      { q: '¿Qué quería hacer Dino Verde?', o: ['🏊', '✈️', '🍕'], ans: 1 },
      { q: '¿Quién le dio un globo?', o: ['🐸', '🦖', '🐊'], ans: 0 },
      { q: '¿Qué vio de cerca?', o: ['☀️', '🌊', '🌙'], ans: 2 },
    ],
  },
  {
    id: 'cu-6', title: 'La noche del jefe final', emoji: '🐲', world: 'juegos', lvl: 3,
    pages: [
      { e: '🎮', t: 'Leo juega con su mando. Solo le falta un nivel: el del jefe final.' },
      { e: '🏰', t: 'El castillo está oscuro. El jefe final es un dragón enorme.' },
      { e: '🛡️', t: 'Leo toma el escudo y la espada. El dragón lanza fuego.' },
      { e: '💎', t: 'Leo ve una gema azul en el suelo. La toma y su escudo brilla.' },
      { e: '🏆', t: 'El fuego rebota. El dragón se cansa y se duerme. ¡Leo gana la copa!' },
      { e: '🛏️', t: 'Mamá dice: a dormir. Leo apaga la consola. Mañana, otra aventura.' },
    ],
    questions: [
      { q: '¿Quién es el jefe final?', o: ['👻', '🐲', '🤖'], ans: 1 },
      { q: '¿Qué hace brillar el escudo?', o: ['💎', '🔑', '🍎'], ans: 0 },
      { q: '¿Qué hace Leo al final?', o: ['🏃', '🍕', '🛏️'], ans: 2 },
    ],
  },
  {
    id: 'cu-7', title: 'El taxi perdido', emoji: '🚕', world: 'carros', lvl: 1,
    pages: [
      { e: '🚕', t: 'Tito es un taxi amarillo. Busca a una niña en la plaza.' },
      { e: '🗺️', t: 'Tito no encuentra el camino. Mira el mapa con cuidado.' },
      { e: '🚦', t: 'Pasa por el semáforo rojo y se detiene.' },
      { e: '👧', t: 'Por fin ve a la niña. ¡Ahí está, cerca del parque!' },
      { e: '🏠', t: 'Tito la lleva a su casa. La niña dice: ¡Gracias, Tito!' },
    ],
    questions: [
      { q: '¿De qué color es Tito?', o: ['🟡', '🔵', '🟢'], ans: 0 },
      { q: '¿Qué mira Tito?', o: ['🗺️', '🎲', '🍎'], ans: 0 },
      { q: '¿A dónde lleva a la niña?', o: ['🏰', '🏠', '🌊'], ans: 1 },
    ],
  },
  {
    id: 'cu-8', title: 'Frosti y el sol', emoji: '🧊', world: 'monstruos', lvl: 1,
    pages: [
      { e: '🧊', t: 'Frosti es un monstruito de hielo. Vive en la nieve.' },
      { e: '☀️', t: 'Un día sale un sol muy fuerte. Frosti empieza a derretirse.' },
      { e: '😢', t: 'Frosti se hace pequeño. ¡Necesita ayuda!' },
      { e: '☁️', t: 'Sus amigos traen una nube grande para dar sombra.' },
      { e: '🧊', t: 'Frosti se pone fresco otra vez. ¡Gracias, amigos!' },
    ],
    questions: [
      { q: '¿De qué tipo es Frosti?', o: ['🔥', '🧊', '🌱'], ans: 1 },
      { q: '¿Qué sale muy fuerte?', o: ['☀️', '🌧️', '🌙'], ans: 0 },
      { q: '¿Qué traen sus amigos?', o: ['☁️', '🪨', '🎈'], ans: 0 },
    ],
  },
  {
    id: 'cu-9', title: 'El nido perdido', emoji: '🦕', world: 'dinos', lvl: 3,
    pages: [
      { e: '🦕', t: 'Mamá dino busca su nido. El viento movió todo el bosque.' },
      { e: '🍃', t: 'Le pregunta a Lagartín si vio el nido entre las hojas.' },
      { e: '🦎', t: 'Lagartín dice: no, pero vi algo cerca del volcán.' },
      { e: '🌋', t: 'Mamá dino camina hasta el volcán con mucho cuidado.' },
      { e: '🥚', t: 'Ahí está el nido, detrás de una roca grande.' },
      { e: '🦖', t: 'Mamá dino se alegra mucho y vuelve a cuidar sus huevos.' },
    ],
    questions: [
      { q: '¿Qué movió el viento?', o: ['🌳', '🚗', '🎮'], ans: 0 },
      { q: '¿Quién vio algo cerca del volcán?', o: ['🦎', '🤖', '🐸'], ans: 0 },
      { q: '¿Dónde estaba el nido?', o: ['🏰', '🪨', '🌊'], ans: 1 },
    ],
  },
  {
    id: 'cu-10', title: 'El mapa del tesoro', emoji: '🗺️', world: 'juegos', lvl: 3,
    pages: [
      { e: '🗺️', t: 'Pip el mago encuentra un mapa viejo en el castillo.' },
      { e: '❌', t: 'El mapa muestra una isla con una equis roja.' },
      { e: '⛵', t: 'Pip sube a un barco pequeño y navega toda la noche.' },
      { e: '🏝️', t: 'Llega a la isla y camina hasta la equis.' },
      { e: '💎', t: 'Cava un poco y encuentra un cofre con gemas azules.' },
      { e: '🏆', t: 'Vuelve al castillo y gana una copa de campeón.' },
    ],
    questions: [
      { q: '¿Qué encuentra Pip?', o: ['🗺️', '🍕', '🚗'], ans: 0 },
      { q: '¿Cómo llega a la isla?', o: ['🚁', '⛵', '🚗'], ans: 1 },
      { q: '¿Qué hay en el cofre?', o: ['💎', '🍯', '🪨'], ans: 0 },
    ],
  },
];
