<template>
  <div class="task">
    <div class="big-emoji">{{ word.e }}</div>
    <div v-if="reveal" class="question">{{ word.s.join(' - ') }}</div>
    <div class="slots">
      <div v-for="(ch, i) in letters" :key="i" class="slot small" :class="{ filled: i < pos }">{{ i < pos ? ch : '' }}</div>
    </div>
    <div class="chips">
      <button v-for="(c, i) in chips" :key="i" class="chip small" :class="c.state" @click="tap(i)">{{ c.ch }}</button>
    </div>
    <button class="btn secondary listen-btn" @click="say">🔊 Escuchar</button>
  </div>
</template>

<script setup>
/* Dictado: escucha la palabra y escríbela con las letras. */
import { ref, reactive } from 'vue';
import { useGame } from '../lib/game.js';
import { pickWord } from '../lib/content.js';
import { Voice } from '../lib/voice.js';
import { Sfx } from '../lib/sfx.js';
import { shuffle, spoken, wait, pickOne } from '../lib/utils.js';
import { praise } from '../lib/feedback.js';
import { ALL_LETTERS, LETTER_INFO } from '../content/words.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish, good, bad } = useGame(props, emit);
const p = props.params;
const maxSyl = p.maxSyl || (level <= 3 ? 2 : 3);
const word = pickWord({ minSyl: p.minSyl, maxSyl, world, noAccents: true, predicate: (w) => w.w.length <= 7 })
  || pickWord({ maxSyl: 2, noAccents: true });
const letters = [...word.w];
const extra = [];
while (extra.length < 2) { const l = pickOne(ALL_LETTERS); if (!letters.includes(l) && !extra.includes(l)) extra.push(l); }
const chips = reactive(shuffle([...letters, ...extra]).map((ch) => ({ ch, state: '' })));
const pos = ref(0);
const reveal = ref(false);
let wrong = 0;
let busy = false;

const say = () => Voice.speak(spoken(word.w));
async function tap(i) {
  const c = chips[i];
  if (busy || c.state === 'used') return;
  if (c.ch === letters[pos.value]) {
    Sfx.play('tap');
    c.state = 'used';
    chips.forEach((x) => { if (x.state === 'hint') x.state = ''; });
    pos.value++;
    if (pos.value === letters.length) {
      busy = true;
      good(`${spoken(word.w)}. ${praise()}`);
      await wait(1200);
      finish(wrong === 0);
    }
  } else {
    wrong++;
    c.state = 'bad';
    setTimeout(() => { if (c.state === 'bad') c.state = ''; }, 500);
    bad(undefined, wrong === 1);
    if (wrong >= 2) {
      reveal.value = true;
      const next = chips.find((x) => x.ch === letters[pos.value] && x.state !== 'used');
      if (next) setTimeout(() => { if (next.state !== 'used') next.state = 'hint'; }, 500);
      const name = LETTER_INFO[letters[pos.value]]?.name || spoken(letters[pos.value]);
      Voice.speak(`${spoken(word.w)}. Sigue con la ${name}.`);
    }
  }
}
setInstruction('Escucha y escribe la palabra.', `Escucha y escribe la palabra: ${spoken(word.w)}.`);
</script>
