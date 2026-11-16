/* Mensaje flotante de acierto/error, compartido por todos los juegos. */
import { reactive } from 'vue';
import { pickOne } from './utils.js';

export const PRAISE = ['¡Muy bien!', '¡Genial!', '¡Excelente!', '¡Eso es!', '¡Súper!', '¡Lo lograste!', '¡Increíble!'];
export const RETRY = ['Casi. Inténtalo otra vez.', 'Mira bien y prueba de nuevo.', 'Tú puedes. Otra vez.'];

export const toast = reactive({ text: '', bad: false, visible: false });
let timer = null;

export function showFeedback(text, bad = false) {
  toast.text = text;
  toast.bad = bad;
  toast.visible = true;
  clearTimeout(timer);
  timer = setTimeout(() => { toast.visible = false; }, 1400);
}
export const praise = () => pickOne(PRAISE);
export const retry = () => pickOne(RETRY);
