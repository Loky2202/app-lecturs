/* ==========================================================
   Banco de palabras. w: palabra, s: sílabas, e: emoji,
   world: tema (dinos, carros, juegos, monstruos, general)
   ========================================================== */
const W = (w, s, e, world = 'general') => ({ w, s: s.split('-'), e, world });

export const WORDS = [
  // ---- Vocales iniciales ----
  W('AVIÓN', 'A-VIÓN', '✈️', 'carros'), W('ÁRBOL', 'ÁR-BOL', '🌳'), W('ABEJA', 'A-BE-JA', '🐝', 'monstruos'),
  W('AGUA', 'A-GUA', '💧', 'monstruos'), W('ANILLO', 'A-NI-LLO', '💍'), W('ARAÑA', 'A-RA-ÑA', '🕷️'),
  W('ELEFANTE', 'E-LE-FAN-TE', '🐘'), W('ESTRELLA', 'ES-TRE-LLA', '⭐', 'juegos'), W('ESPADA', 'ES-PA-DA', '🗡️', 'juegos'),
  W('ESCUDO', 'ES-CU-DO', '🛡️', 'juegos'), W('ERIZO', 'E-RI-ZO', '🦔'),
  W('ISLA', 'IS-LA', '🏝️'), W('IMÁN', 'I-MÁN', '🧲'), W('IGUANA', 'I-GUA-NA', '🦎', 'dinos'), W('INSECTO', 'IN-SEC-TO', '🐞'),
  W('OSO', 'O-SO', '🐻', 'monstruos'), W('OJO', 'O-JO', '👁️'), W('OLA', 'O-LA', '🌊'), W('OVEJA', 'O-VE-JA', '🐑'), W('OREJA', 'O-RE-JA', '👂'),
  W('UVA', 'U-VA', '🍇'), W('UNO', 'U-NO', '1️⃣'), W('UNICORNIO', 'U-NI-COR-NIO', '🦄', 'monstruos'), W('UÑA', 'U-ÑA', '💅'),

  // ---- M ----
  W('MAMÁ', 'MA-MÁ', '👩'), W('MANO', 'MA-NO', '✋'), W('MOTO', 'MO-TO', '🏍️', 'carros'), W('MONO', 'MO-NO', '🐵', 'monstruos'),
  W('MAPA', 'MA-PA', '🗺️', 'juegos'), W('MIEL', 'MIEL', '🍯'), W('MANDO', 'MAN-DO', '🎮', 'juegos'), W('MONEDA', 'MO-NE-DA', '🪙', 'juegos'),
  W('MANZANA', 'MAN-ZA-NA', '🍎'), W('MURCIÉLAGO', 'MUR-CIÉ-LA-GO', '🦇', 'monstruos'), W('MALETA', 'MA-LE-TA', '🧳', 'carros'), W('MIMO', 'MI-MO', '🎭'), W('MOMIA', 'MO-MIA', '🧟', 'monstruos'), W('MASA', 'MA-SA', '🥣'), W('MEDUSA', 'ME-DU-SA', '🪼', 'monstruos'),
  W('MONTAÑA', 'MON-TA-ÑA', '⛰️', 'dinos'), W('METEORO', 'ME-TE-O-RO', '☄️', 'dinos'), W('MARCIANO', 'MAR-CIA-NO', '👾', 'juegos'),
  // ---- P ----
  W('PAPÁ', 'PA-PÁ', '👨'), W('PATO', 'PA-TO', '🦆'), W('PEZ', 'PEZ', '🐟', 'monstruos'), W('PAN', 'PAN', '🍞'),
  W('PIZZA', 'PIZ-ZA', '🍕'), W('PERRO', 'PE-RRO', '🐶'), W('PELOTA', 'PE-LO-TA', '⚽'), W('PULPO', 'PUL-PO', '🐙', 'monstruos'),
  W('PANDA', 'PAN-DA', '🐼', 'monstruos'), W('PIANO', 'PIA-NO', '🎹'), W('PALMERA', 'PAL-ME-RA', '🌴', 'dinos'),
  W('POLICÍA', 'PO-LI-CÍ-A', '👮', 'carros'), W('PATINETA', 'PA-TI-NE-TA', '🛹', 'carros'), W('PUMA', 'PU-MA', '🐆', 'monstruos'), W('PAPA', 'PA-PA', '🥔'), W('POMPA', 'POM-PA', '🫧'), W('PILA', 'PI-LA', '🔋', 'juegos'), W('PELO', 'PE-LO', '💇'), W('PASTEL', 'PAS-TEL', '🎂'),
  // ---- S ----
  W('SOL', 'SOL', '☀️', 'monstruos'), W('SAPO', 'SA-PO', '🐸'), W('SOPA', 'SO-PA', '🍲'), W('SILLA', 'SI-LLA', '🪑'),
  W('SEMÁFORO', 'SE-MÁ-FO-RO', '🚦', 'carros'), W('SERPIENTE', 'SER-PIEN-TE', '🐍', 'monstruos'), W('SANDÍA', 'SAN-DÍ-A', '🍉'),
  W('SIRENA', 'SI-RE-NA', '🧜‍♀️', 'monstruos'), W('SUMA', 'SU-MA', '➕', 'juegos'), W('PESA', 'PE-SA', '🏋️'), W('SALA', 'SA-LA', '🛋️'),
  // ---- L ----
  W('LUNA', 'LU-NA', '🌙', 'monstruos'), W('LOBO', 'LO-BO', '🐺', 'monstruos'), W('LORO', 'LO-RO', '🦜'), W('LIMÓN', 'LI-MÓN', '🍋'),
  W('LEÓN', 'LE-ÓN', '🦁', 'monstruos'), W('LÁPIZ', 'LÁ-PIZ', '✏️'), W('LAGARTO', 'LA-GAR-TO', '🦎', 'dinos'), W('LATA', 'LA-TA', '🥫'),
  W('LAVA', 'LA-VA', '🌋', 'dinos'), W('LUPA', 'LU-PA', '🔍', 'juegos'), W('LOMA', 'LO-MA', '⛰️', 'dinos'), W('LAPA', 'LA-PA', '🐚', 'monstruos'),
  // ---- T ----
  W('TAZA', 'TA-ZA', '☕'), W('TORO', 'TO-RO', '🐂'), W('TAXI', 'TA-XI', '🚕', 'carros'), W('TORTUGA', 'TOR-TU-GA', '🐢', 'monstruos'),
  W('TOMATE', 'TO-MA-TE', '🍅'), W('TESORO', 'TE-SO-RO', '💎', 'juegos'), W('TIGRE', 'TI-GRE', '🐯', 'monstruos'),
  W('TELÉFONO', 'TE-LÉ-FO-NO', '📱'), W('TAMBOR', 'TAM-BOR', '🥁'), W('TELA', 'TE-LA', '🧵'), W('TOPO', 'TO-PO', '🐹', 'monstruos'), W('TAPA', 'TA-PA', '🫙'), W('META', 'ME-TA', '🎯', 'carros'),
  // ---- N ----
  W('NUBE', 'NU-BE', '☁️', 'monstruos'), W('NIDO', 'NI-DO', '🪺', 'dinos'), W('NARIZ', 'NA-RIZ', '👃'), W('NUEZ', 'NUEZ', '🌰'),
  W('NIEVE', 'NIE-VE', '❄️', 'monstruos'), W('NOCHE', 'NO-CHE', '🌃'), W('NAVE', 'NA-VE', '🛸', 'juegos'), W('PINO', 'PI-NO', '🌲'), W('ANTENA', 'AN-TE-NA', '📡', 'juegos'), W('NOTA', 'NO-TA', '🎵'), W('NUDO', 'NU-DO', '🪢'), W('NENA', 'NE-NA', '👧'),
  // ---- D ----
  W('DADO', 'DA-DO', '🎲', 'juegos'), W('DINO', 'DI-NO', '🦕', 'dinos'), W('DEDO', 'DE-DO', '☝️'), W('DONA', 'DO-NA', '🍩'),
  W('DELFÍN', 'DEL-FÍN', '🐬', 'monstruos'), W('DIENTE', 'DIEN-TE', '🦷', 'dinos'), W('DULCE', 'DUL-CE', '🍬'),
  W('DINOSAURIO', 'DI-NO-SAU-RIO', '🦕', 'dinos'), W('DIAMANTE', 'DIA-MAN-TE', '💠', 'juegos'), W('DUENDE', 'DUEN-DE', '🧝', 'monstruos'), W('DUNA', 'DU-NA', '🏜️', 'dinos'), W('DÍA', 'DÍ-A', '🌅'), W('DOS', 'DOS', '2️⃣'),
  // ---- B ----
  W('BOCA', 'BO-CA', '👄'), W('BOTA', 'BO-TA', '🥾'), W('BEBÉ', 'BE-BÉ', '👶'), W('BARCO', 'BAR-CO', '⛵', 'carros'),
  W('BICI', 'BI-CI', '🚲', 'carros'), W('BANANA', 'BA-NA-NA', '🍌'), W('BALÓN', 'BA-LÓN', '🏀'), W('BÚHO', 'BÚ-HO', '🦉', 'monstruos'),
  W('BOMBA', 'BOM-BA', '💣', 'juegos'), W('BANDERA', 'BAN-DE-RA', '🏁', 'carros'), W('BURRO', 'BU-RRO', '🫏'), W('BUS', 'BUS', '🚌', 'carros'),
  W('BOTÓN', 'BO-TÓN', '🔘', 'juegos'),
  // ---- C (ca, co, cu) ----
  W('CASA', 'CA-SA', '🏠'), W('CAMA', 'CA-MA', '🛏️'), W('COPA', 'CO-PA', '🏆', 'juegos'), W('CARRO', 'CA-RRO', '🚗', 'carros'),
  W('COCO', 'CO-CO', '🥥'), W('CUCHARA', 'CU-CHA-RA', '🥄'), W('CAMIÓN', 'CA-MIÓN', '🚚', 'carros'), W('CABALLO', 'CA-BA-LLO', '🐴'),
  W('COHETE', 'CO-HE-TE', '🚀', 'carros'), W('CASTILLO', 'CAS-TI-LLO', '🏰', 'juegos'), W('CONEJO', 'CO-NE-JO', '🐰', 'monstruos'),
  W('CORAZÓN', 'CO-RA-ZÓN', '❤️', 'juegos'), W('CAMISA', 'CA-MI-SA', '👕'), W('COCODRILO', 'CO-CO-DRI-LO', '🐊', 'dinos'),
  W('CARRERA', 'CA-RRE-RA', '🏎️', 'carros'), W('COMPUTADORA', 'COM-PU-TA-DO-RA', '💻', 'juegos'), W('CUEVA', 'CUE-VA', '🕳️', 'dinos'),
  W('CEBRA', 'CE-BRA', '🦓'), W('CINE', 'CI-NE', '🎬'),
  // ---- F ----
  W('FOCA', 'FO-CA', '🦭', 'monstruos'), W('FUEGO', 'FUE-GO', '🔥', 'monstruos'), W('FLOR', 'FLOR', '🌸'), W('FRESA', 'FRE-SA', '🍓'),
  W('FANTASMA', 'FAN-TAS-MA', '👻', 'juegos'), W('FICHA', 'FI-CHA', '🧩', 'juegos'), W('FOTO', 'FO-TO', '📷'), W('FAMILIA', 'FA-MI-LIA', '👨‍👩‍👧'),
  W('FÓSIL', 'FÓ-SIL', '🦴', 'dinos'),
  // ---- G (ga, go, gu) ----
  W('GATO', 'GA-TO', '🐱', 'monstruos'), W('GUSANO', 'GU-SA-NO', '🐛'), W('GALLO', 'GA-LLO', '🐓'), W('GLOBO', 'GLO-BO', '🎈'),
  W('GORRA', 'GO-RRA', '🧢'), W('GASOLINA', 'GA-SO-LI-NA', '⛽', 'carros'), W('GALLETA', 'GA-LLE-TA', '🍪'), W('GOL', 'GOL', '🥅'),
  W('GRÚA', 'GRÚ-A', '🏗️', 'carros'),
  // ---- J ----
  W('JUGO', 'JU-GO', '🧃'), W('JIRAFA', 'JI-RA-FA', '🦒'), W('JAMÓN', 'JA-MÓN', '🍖'), W('JUGUETE', 'JU-GUE-TE', '🧸', 'juegos'),
  W('JARDÍN', 'JAR-DÍN', '🌷'), W('JABÓN', 'JA-BÓN', '🧼'), W('JUEGO', 'JUE-GO', '🕹️', 'juegos'),
  // ---- R ----
  W('RANA', 'RA-NA', '🐸', 'monstruos'), W('RATÓN', 'RA-TÓN', '🐭', 'monstruos'), W('ROCA', 'RO-CA', '🪨', 'dinos'), W('RAYO', 'RA-YO', '⚡', 'monstruos'),
  W('ROBOT', 'RO-BOT', '🤖', 'juegos'), W('RUEDA', 'RUE-DA', '🛞', 'carros'), W('REGALO', 'RE-GA-LO', '🎁', 'juegos'), W('ROSA', 'RO-SA', '🌹'),
  W('REY', 'REY', '🤴', 'juegos'), W('RELOJ', 'RE-LOJ', '⌚'), W('RADIO', 'RA-DIO', '📻'), W('REX', 'REX', '🦖', 'dinos'),
  // ---- V ----
  W('VACA', 'VA-CA', '🐄'), W('VELA', 'VE-LA', '🕯️'), W('VOLCÁN', 'VOL-CÁN', '🌋', 'dinos'), W('VASO', 'VA-SO', '🥤'),
  W('VIOLÍN', 'VIO-LÍN', '🎻'), W('VENTANA', 'VEN-TA-NA', '🪟'), W('VESTIDO', 'VES-TI-DO', '👗'), W('VENADO', 'VE-NA-DO', '🦌', 'monstruos'),
  // ---- Z ----
  W('ZORRO', 'ZO-RRO', '🦊', 'monstruos'), W('ZAPATO', 'ZA-PA-TO', '👟'), W('ZANAHORIA', 'ZA-NA-HO-RIA', '🥕'), W('ZORRILLO', 'ZO-RRI-LLO', '🦨', 'monstruos'),
  // ---- Ñ ----
  W('ÑU', 'ÑU', '🐃'), W('PIÑA', 'PI-ÑA', '🍍'), W('NIÑO', 'NI-ÑO', '👦'), W('NIÑA', 'NI-ÑA', '👧'), W('MUÑECA', 'MU-ÑE-CA', '🪆'), W('PIÑATA', 'PI-ÑA-TA', '🪅'),
  W('BAÑO', 'BA-ÑO', '🛁'), W('CABAÑA', 'CA-BA-ÑA', '🛖', 'dinos'), W('LEÑA', 'LE-ÑA', '🪵', 'dinos'), W('MOÑO', 'MO-ÑO', '🎀'),
  // ---- H ----
  W('HOJA', 'HO-JA', '🍃', 'dinos'), W('HUEVO', 'HUE-VO', '🥚', 'dinos'), W('HUESO', 'HUE-SO', '🦴', 'dinos'), W('HIELO', 'HIE-LO', '🧊', 'monstruos'),
  W('HADA', 'HA-DA', '🧚', 'monstruos'), W('HELADO', 'HE-LA-DO', '🍦'), W('HORMIGA', 'HOR-MI-GA', '🐜'), W('HIPOPÓTAMO', 'HI-PO-PÓ-TA-MO', '🦛'),
  // ---- CH ----
  W('CHOCOLATE', 'CHO-CO-LA-TE', '🍫'), W('CHISPA', 'CHIS-PA', '⚡', 'monstruos'), W('CHILE', 'CHI-LE', '🌶️'), W('LECHE', 'LE-CHE', '🥛'), W('LECHUGA', 'LE-CHU-GA', '🥬'),
  W('CHALECO', 'CHA-LE-CO', '🦺'), W('CHURRO', 'CHU-RRO', '🥖'),
  // ---- LL ----
  W('LLAVE', 'LLA-VE', '🔑', 'juegos'), W('LLUVIA', 'LLU-VIA', '🌧️', 'monstruos'), W('POLLO', 'PO-LLO', '🐔'), W('LLAMA', 'LLA-MA', '🦙'),
  // ---- QU ----
  W('QUESO', 'QUE-SO', '🧀'), W('RAQUETA', 'RA-QUE-TA', '🎾'), W('ESQUÍ', 'ES-QUÍ', '⛷️'), W('PAQUETE', 'PA-QUE-TE', '📦'), W('MÁQUINA', 'MÁ-QUI-NA', '⚙️', 'juegos'),
  W('BOSQUE', 'BOS-QUE', '🏕️', 'dinos'), W('PARQUE', 'PAR-QUE', '🛝'), W('MOSQUITO', 'MOS-QUI-TO', '🦟', 'monstruos'),
  // ---- Y ----
  W('YOYO', 'YO-YO', '🪀', 'juegos'), W('YATE', 'YA-TE', '🛥️', 'carros'), W('YEGUA', 'YE-GUA', '🐎'), W('PAYASO', 'PA-YA-SO', '🤡'),
  // ---- Trabadas ----
  W('BRAZO', 'BRA-ZO', '💪'), W('BRUJA', 'BRU-JA', '🧙‍♀️', 'juegos'), W('PLANTA', 'PLAN-TA', '🌱', 'monstruos'), W('PLATO', 'PLA-TO', '🍽️'),
  W('PLUMA', 'PLU-MA', '🪶'), W('TREN', 'TREN', '🚆', 'carros'), W('TRACTOR', 'TRAC-TOR', '🚜', 'carros'), W('TRUENO', 'TRUE-NO', '⛈️', 'monstruos'),
  W('FLECHA', 'FLE-CHA', '🏹', 'juegos'), W('GRANJA', 'GRAN-JA', '🏡'), W('GRILLO', 'GRI-LLO', '🦗'), W('DRAGÓN', 'DRA-GÓN', '🐉', 'monstruos'),
  W('PREMIO', 'PRE-MIO', '🎖️', 'juegos'), W('BLOQUE', 'BLO-QUE', '🧱', 'juegos'), W('CLAVO', 'CLA-VO', '🔩'), W('FRUTA', 'FRU-TA', '🍐'),
  W('CRÁTER', 'CRÁ-TER', '🌋', 'dinos'), W('TRICERATOPS', 'TRI-CE-RA-TOPS', '🦕', 'dinos'),
];

/* La selección por letra (inicio directo, Ñ/QU dentro de la palabra, decodificabilidad) está en lib/content.js. */

export const VOWELS = ['A', 'E', 'I', 'O', 'U'];
export const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'L', 'M', 'N', 'Ñ', 'P', 'R', 'S', 'T', 'V', 'Z'];
export const ALL_LETTERS = [...VOWELS, ...CONSONANTS];

/* Sílabas directas por consonante (para las lecciones). */
export const SYLLABLES = {
  M: ['MA', 'ME', 'MI', 'MO', 'MU'], P: ['PA', 'PE', 'PI', 'PO', 'PU'], S: ['SA', 'SE', 'SI', 'SO', 'SU'],
  L: ['LA', 'LE', 'LI', 'LO', 'LU'], T: ['TA', 'TE', 'TI', 'TO', 'TU'], N: ['NA', 'NE', 'NI', 'NO', 'NU'],
  D: ['DA', 'DE', 'DI', 'DO', 'DU'], B: ['BA', 'BE', 'BI', 'BO', 'BU'], C: ['CA', 'CO', 'CU'], F: ['FA', 'FE', 'FI', 'FO', 'FU'],
  G: ['GA', 'GO', 'GU'], J: ['JA', 'JE', 'JI', 'JO', 'JU'], R: ['RA', 'RE', 'RI', 'RO', 'RU'], V: ['VA', 'VE', 'VI', 'VO', 'VU'],
  Z: ['ZA', 'ZO', 'ZU'], Ñ: ['ÑA', 'ÑE', 'ÑI', 'ÑO', 'ÑU'], H: ['HA', 'HE', 'HI', 'HO', 'HU'], CH: ['CHA', 'CHE', 'CHI', 'CHO', 'CHU'],
  LL: ['LLA', 'LLE', 'LLI', 'LLO', 'LLU'], QU: ['QUE', 'QUI'], Y: ['YA', 'YE', 'YO', 'YU'], RR: ['RRA', 'RRE', 'RRI', 'RRO', 'RRU'],
  BR: ['BRA', 'BRE', 'BRI', 'BRO', 'BRU'], PL: ['PLA', 'PLE', 'PLI', 'PLO', 'PLU'], TR: ['TRA', 'TRE', 'TRI', 'TRO', 'TRU'],
  FL: ['FLA', 'FLE', 'FLI', 'FLO', 'FLU'], GR: ['GRA', 'GRE', 'GRI', 'GRO', 'GRU'], DR: ['DRA', 'DRE', 'DRI', 'DRO', 'DRU'],
};

/* Cómo suena cada letra (para la explicación en voz alta). */
export const LETTER_INFO = {
  A: { name: 'a', sound: 'aaa', tip: 'Abre bien la boca: aaa.' }, E: { name: 'e', sound: 'eee', tip: 'Sonríe un poco: eee.' },
  I: { name: 'i', sound: 'iii', tip: 'Sonríe mucho: iii.' }, O: { name: 'o', sound: 'ooo', tip: 'Boca redonda: ooo.' },
  U: { name: 'u', sound: 'uuu', tip: 'Labios como un besito: uuu.' },
  M: { name: 'eme', sound: 'mmm', tip: 'Cierra los labios y suena: mmm.' }, P: { name: 'pe', sound: 'p', tip: 'Los labios explotan: p, p, p.' },
  S: { name: 'ese', sound: 'sss', tip: 'Como una serpiente: sss.' }, L: { name: 'ele', sound: 'lll', tip: 'La lengua toca arriba: lll.' },
  T: { name: 'te', sound: 't', tip: 'Un golpecito de lengua: t, t, t.' }, N: { name: 'ene', sound: 'nnn', tip: 'Suena por la nariz: nnn.' },
  D: { name: 'de', sound: 'd', tip: 'La lengua entre los dientes: d, d.' }, B: { name: 'be', sound: 'b', tip: 'Los labios juntos: b, b.' },
  C: { name: 'ce', sound: 'k', tip: 'Con A, O y U suena fuerte: ca, co, cu.' }, F: { name: 'efe', sound: 'fff', tip: 'Los dientes tocan el labio: fff.' },
  G: { name: 'ge', sound: 'g', tip: 'Con A, O y U suena suave: ga, go, gu.' }, J: { name: 'jota', sound: 'jjj', tip: 'Sale del fondo de la garganta: jjj.' },
  R: { name: 'erre', sound: 'rrr', tip: 'La lengua vibra: rrr.' }, RR: { name: 'erre doble', sound: 'rrr', tip: 'Dos erres suenan fuerte: perro, carro.' }, V: { name: 'uve', sound: 'b', tip: 'Suena igual que la be: b, b.' },
  Z: { name: 'zeta', sound: 'sss', tip: 'Suena como la ese: sss.' }, Ñ: { name: 'eñe', sound: 'ñññ', tip: 'Como en niño y piña: ñ.' },
  H: { name: 'hache', sound: '', tip: 'La hache es muda: no suena.' }, CH: { name: 'che', sound: 'ch', tip: 'Como un estornudo chiquito: ch.' },
  LL: { name: 'elle', sound: 'll', tip: 'Suena como la ye: ya, ye, yo.' }, QU: { name: 'cu', sound: 'k', tip: 'La u no suena: que, qui.' },
  Y: { name: 'ye', sound: 'y', tip: 'Como en yoyo: ye.' },
  BR: { name: 'bre', sound: 'br', tip: 'Dos letras juntas: brrr.' }, PL: { name: 'ple', sound: 'pl', tip: 'Dos letras juntas: pl.' },
  TR: { name: 'tre', sound: 'tr', tip: 'Dos letras juntas: trrr.' }, FL: { name: 'fle', sound: 'fl', tip: 'Dos letras juntas: fl.' },
  GR: { name: 'gre', sound: 'gr', tip: 'Dos letras juntas: grrr.' }, DR: { name: 'dre', sound: 'dr', tip: 'Dos letras juntas: drrr.' },
};
