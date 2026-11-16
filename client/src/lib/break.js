/* Pausa activa (movimiento) entre actividades. */
import { reactive } from 'vue';
import { BREAKS } from '../content/misc.js';
import { pickOne } from './utils.js';

export const breakState = reactive({ visible: false, item: BREAKS[0], secs: 30 });
let resolver = null;

export function runBreak() {
  return new Promise((resolve) => {
    resolver = resolve;
    breakState.item = pickOne(BREAKS);
    breakState.secs = 30;
    breakState.visible = true;
  });
}
export function endBreak() {
  breakState.visible = false;
  const r = resolver;
  resolver = null;
  if (r) r();
}
