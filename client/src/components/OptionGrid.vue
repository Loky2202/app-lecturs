<template>
  <div class="options" :class="`cols-${cols || options.length}`">
    <button
      v-for="(o, i) in options" :key="i"
      class="opt" :class="[o.kind || 'word', state[i]]"
      :disabled="locked || state[i] === 'bad'"
      @click="choose(i)"
    >
      <small v-if="o.sub">{{ o.sub }}</small><Pic v-if="o.pic" :word="o.pic" /><template v-else>{{ o.label }}</template>
    </button>
  </div>
</template>

<script setup>
/* Cuadrícula de opciones con acierto/error/pista. Emite done({ firstTry }). */
import { ref, reactive } from 'vue';
import Pic from './Pic.vue';
import { Sfx } from '../lib/sfx.js';
import { Voice } from '../lib/voice.js';
import { showFeedback, praise, retry } from '../lib/feedback.js';
import { wait } from '../lib/utils.js';

const props = defineProps({
  options: { type: Array, required: true }, // [{ label, sub?, kind?, correct, hint? }]
  cols: { type: Number, default: 0 },
  okSpeak: { type: String, default: '' },
  delay: { type: Number, default: 1100 },
  quiet: { type: Boolean, default: false }, // sin voz ni mensaje al acertar (juegos rápidos)
});
const emit = defineEmits(['done', 'wrong']);
const state = reactive({});
const locked = ref(false);
let wrong = 0;

async function choose(i) {
  if (locked.value || state[i] === 'bad' || state[i] === 'ok') return;
  const o = props.options[i];
  if (o.correct) {
    locked.value = true;
    props.options.forEach((_, j) => { if (state[j] === 'hint') state[j] = ''; });
    state[i] = 'ok';
    Sfx.play('ok');
    if (!props.quiet) { showFeedback(praise()); Voice.speak(props.okSpeak || praise()); }
    await wait(props.delay);
    emit('done', { firstTry: wrong === 0, wrong });
  } else {
    wrong++;
    state[i] = 'bad';
    Sfx.play('bad');
    showFeedback(retry(), true);
    emit('wrong', wrong);
    if (wrong === 1) Voice.speak(retry());
    if (wrong >= 2) {
      const ci = props.options.findIndex((x) => x.correct);
      state[ci] = 'hint';
      const c = props.options[ci];
      if (c.hint) Voice.speak(c.hint);
    }
  }
}
</script>
