<template>
  <div class="task">
    <div class="big-emoji">{{ word.e }}</div>
    <div v-if="showWord" class="question">{{ word.s.join(' · ') }}</div>
    <div class="slots">
      <div v-for="(s, i) in word.s" :key="i" class="slot" :class="{ filled: i < pos }">{{ i < pos ? s : '' }}</div>
    </div>
    <div class="chips">
      <button v-for="(c, i) in chips" :key="i" class="chip" :class="c.state" @click="tap(i)">{{ c.syl }}</button>
    </div>
    <button class="btn ghost listen-btn" @click="say">🔊 Escuchar</button>
  </div>
</template>

<script setup>
/* Arma la palabra con sílabas. */
import { ref, reactive } from 'vue';
import { useGame } from '../lib/game.js';
import { pickWord } from '../lib/content.js';
import { Voice } from '../lib/voice.js';
import { Sfx } from '../lib/sfx.js';
import { shuffle, spoken, wait } from '../lib/utils.js';
import { praise } from '../lib/feedback.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done', 'wrong']);
const { level, world, setInstruction, finish, good, bad } = useGame(props, emit);
const p = props.params;
const maxSyl = p.maxSyl || (level <= 2 ? 2 : level <= 4 ? 3 : 5);
const word = pickWord({ letter: p.letter, letters: p.letters, minSyl: Math.max(2, p.minSyl || 2), maxSyl, world }) || pickWord({ minSyl: 2, maxSyl: 2 });
const showWord = p.showWord ?? level <= 2;

let order = shuffle(word.s);
if (order.join('-') === word.s.join('-')) order = [...order.slice(1), order[0]];
const chips = reactive(order.map((syl) => ({ syl, state: '' })));
const pos = ref(0);
let wrong = 0;
let busy = false;

const say = () => Voice.speak(spoken(word.w));
async function tap(i) {
  const c = chips[i];
  if (busy || c.state === 'used') return;
  if (c.syl === word.s[pos.value]) {
    Sfx.play('tap');
    c.state = 'used';
    chips.forEach((x) => { if (x.state === 'hint') x.state = ''; });
    pos.value++;
    if (pos.value === word.s.length) {
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
      const next = chips.find((x) => x.syl === word.s[pos.value] && x.state !== 'used');
      if (next) setTimeout(() => { if (next.state !== 'used') next.state = 'hint'; }, 500);
      Voice.speak(`${spoken(word.w)}. Sigue con ${spoken(word.s[pos.value])}.`);
    }
  }
}
setInstruction('Arma la palabra con las sílabas.', `Arma la palabra ${spoken(word.w)}.`);
</script>
