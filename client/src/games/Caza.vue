<template>
  <div class="task">
    <div class="row">
      <span class="muted">Atrapa:</span>
      <span class="target-pill">{{ target }}</span>
      <button class="icon-btn" aria-label="Escuchar" @click="say">🔊</button>
      <span class="muted">Ronda {{ round + 1 }}/{{ ROUNDS }}</span>
    </div>
    <div class="hunt">
      <button v-for="(t, i) in tiles" :key="round + '-' + i" class="tile" :class="t.state" @click="tap(i)">{{ t.state === 'got' ? catchEmoji : t.v }}</button>
    </div>
  </div>
</template>

<script setup>
/* Caza de letras o sílabas: toca todas las que coinciden con el objetivo. */
import { ref, reactive, computed } from 'vue';
import { useGame } from '../lib/game.js';
import { Voice } from '../lib/voice.js';
import { Sfx } from '../lib/sfx.js';
import { showFeedback, praise } from '../lib/feedback.js';
import { shuffle, pickOne, spoken, wait } from '../lib/utils.js';
import { LETTER_INFO, VOWELS, SYLLABLES } from '../content/words.js';
import { lettersForLevel, consonantsForLevel } from '../content/lessons.js';
import { randomConsonant } from '../lib/content.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const p = props.params;
const ROUNDS = 4;

let kind = p.kind; let targets = p.targets; let pool = p.pool;
if (!targets) {
  if (level <= 1) { kind = 'letra'; pool = VOWELS; targets = VOWELS; }
  else if (level === 2 || Math.random() < 0.5) { kind = 'sílaba'; const c = randomConsonant(consonantsForLevel(level)); const c2 = randomConsonant(consonantsForLevel(level).filter((x) => x !== c)); pool = SYLLABLES[c].concat(SYLLABLES[c2] || []); targets = SYLLABLES[c]; }
  else { kind = 'letra'; pool = lettersForLevel(level); targets = pool; }
}
const catchEmoji = ({ dinos: '🦖', carros: '🏎️', juegos: '👾', monstruos: '⚡' })[world] || '⭐';
const round = ref(0);
const target = ref('');
const tiles = reactive([]);
let errors = 0; let got = 0; let busy = false;

function build() {
  target.value = pickOne(targets);
  const dis = pool.filter((x) => x !== target.value);
  const picks = [target.value, target.value, target.value];
  while (picks.length < 9) picks.push(dis.length ? pickOne(dis) : pickOne(pool));
  tiles.splice(0, tiles.length, ...shuffle(picks).map((v) => ({ v, state: '' })));
  got = 0;
  say();
}
const nameOf = (t) => (kind === 'letra' && LETTER_INFO[t] ? `la letra ${LETTER_INFO[t].name}` : spoken(t));
const say = () => Voice.speak(`Atrapa todas las ${nameOf(target.value)}.`);

async function tap(i) {
  const t = tiles[i];
  if (busy || t.state) return;
  if (t.v === target.value) {
    t.state = 'got'; got++;
    Sfx.play('tap');
    if (got === 3) {
      busy = true;
      Sfx.play('ok');
      showFeedback(praise());
      await wait(700);
      if (round.value + 1 >= ROUNDS) {
        Voice.speak(errors === 0 ? '¡Caza perfecta!' : '¡Terminaste la caza!');
        await wait(700);
        return finish(errors === 0, { score: ROUNDS * 3 - errors });
      }
      round.value++;
      build();
      busy = false;
    }
  } else {
    errors++;
    t.state = 'bad';
    Sfx.play('bad');
    setTimeout(() => { if (t.state === 'bad') t.state = ''; }, 500);
    if (errors === 1) Voice.speak(`Esa no. Busca ${nameOf(target.value)}.`);
  }
}
setInstruction(kind === 'letra' ? 'Toca todas las letras iguales.' : 'Toca todas las sílabas iguales.');
build();
</script>
