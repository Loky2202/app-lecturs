<template>
  <div class="teach">
    <!-- Letra -->
    <template v-if="screen.type === 'letter'">
      <div class="big-letter">{{ screen.letter }} <small>{{ screen.letter.toLowerCase() }}</small></div>
      <div class="tip">{{ info.tip }}</div>
      <div class="row">
        <button class="btn secondary listen-btn" @click="sayLetter">🔊 Escuchar</button>
        <button v-if="info.sound" class="btn ghost listen-btn" @click="saySound">👄 Sonido</button>
      </div>
      <div class="word-list">
        <button v-for="w in examples" :key="w.w" class="word-item" @click="sayWord(w)">
          <span class="we">{{ w.e }}</span><span class="ww">{{ w.w }}</span>
        </button>
      </div>
    </template>

    <!-- Sílabas -->
    <template v-else-if="screen.type === 'syllables'">
      <div class="big-letter">{{ screen.letter }}</div>
      <p class="lead center">{{ screen.letter }} + vocal = sílaba. Toca cada una para oírla.</p>
      <div class="syl-table">
        <button v-for="s in syls" :key="s" class="syl" :class="{ said: said.has(s) }" @click="saySyl(s)">{{ s }}</button>
      </div>
      <div class="word-list">
        <button v-for="w in examples" :key="w.w" class="word-item" @click="sayWord(w)">
          <span class="we">{{ w.e }}</span><span class="ww">{{ w.w }}</span><span class="ws">{{ w.s.join(' - ') }}</span>
        </button>
      </div>
    </template>

    <!-- Palabras -->
    <template v-else-if="screen.type === 'words'">
      <p class="lead center">Toca cada palabra para oírla por sílabas.</p>
      <div class="word-list">
        <button v-for="w in examples" :key="w.w" class="word-item" @click="sayWord(w)">
          <span class="we">{{ w.e }}</span><span class="ww">{{ show(w.w) }}</span><span class="ws">{{ w.s.map(show).join(' - ') }}</span>
        </button>
      </div>
    </template>

    <!-- Mayúsculas y minúsculas -->
    <template v-else-if="screen.type === 'case'">
      <p class="lead center">Grande y pequeña. Toca cada pareja para oírla.</p>
      <div class="case-grid">
        <button v-for="l in screen.letters" :key="l" class="case-item" :class="{ said: said.has(l) }" @click="sayCase(l)">{{ l }}<small>{{ l.toLowerCase() }}</small></button>
      </div>
    </template>

    <!-- Texto -->
    <template v-else>
      <div class="hero-emoji">{{ screen.e }}</div>
      <h2>{{ screen.title }}</h2>
      <p class="lead center" style="max-width: 600px;">{{ screen.body }}</p>
      <button class="btn secondary listen-btn" @click="Voice.speak(screen.body)">🔊 Escuchar</button>
    </template>
  </div>
</template>

<script setup>
/* Pantallas de enseñanza de una lección. */
import { computed, reactive, watch } from 'vue';
import { Voice } from '../lib/voice.js';
import { Sfx } from '../lib/sfx.js';
import { LetterAudio } from '../lib/audio.js';
import { LETTER_INFO } from '../content/words.js';
import { filterWords, syllablesOf } from '../lib/content.js';
import { shuffle, spoken } from '../lib/utils.js';
import { useApp } from '../stores/app.js';

const props = defineProps({ screen: { type: Object, required: true } });
const app = useApp();
const said = reactive(new Set());

const info = computed(() => LETTER_INFO[props.screen.letter] || { name: '', sound: '', tip: '' });
const syls = computed(() => syllablesOf(props.screen.letter));
const show = (t) => (props.screen.lower ? t.toLowerCase() : t);
/* Ejemplos: solo palabras descifrables con las letras conocidas (si hay suficientes),
   primero las del mundo favorito, en orden distinto cada vez. */
const examples = computed(() => {
  const s = props.screen;
  const f = s.letter ? { letter: s.letter } : { minSyl: s.minSyl, maxSyl: s.maxSyl };
  const n = s.count || 4;
  let list = filterWords({ ...f, known: s.known ?? null });
  if (list.length < 2 && s.known) list = filterWords({ ...f, known: null });
  const fav = app.profile?.favorite;
  const ordered = shuffle(list.filter((w) => w.world === fav)).concat(shuffle(list.filter((w) => w.world !== fav)));
  return ordered.slice(0, n);
});

function sayLetter() { Voice.speak(`Esta es la letra ${info.value.name}. ${info.value.sound ? `Suena ${info.value.sound}.` : ''} ${info.value.tip}`); }
function saySound() { LetterAudio.playSound(props.screen.letter); }
function saySyl(s) { Sfx.play('tap'); said.add(s); Voice.speak(spoken(s), { rate: 0.75 }); }
function sayWord(w) { Sfx.play('tap'); Voice.speak(`${w.s.map(spoken).join('. ')}. ${spoken(w.w)}.`, { rate: 0.8 }); }
function sayCase(l) { Sfx.play('tap'); said.add(l); const name = LETTER_INFO[l]?.name || spoken(l); Voice.speak(`${name} grande, ${name} pequeña.`, { rate: 0.8 }); }

watch(() => props.screen, (s) => {
  said.clear();
  if (!app.settings.autoRead) return;
  setTimeout(() => {
    if (s.type === 'letter') sayLetter();
    else if (s.type === 'syllables') Voice.speak(`Con la ${info.value.name} y las vocales: ${syls.value.map(spoken).join(', ')}.`);
    else if (s.type === 'words') Voice.speak('Toca cada palabra para oírla por sílabas.');
    else if (s.type === 'case') Voice.speak('Cada letra tiene una forma grande y una pequeña. Toca cada pareja para oírla.');
    else Voice.speak(`${s.title}. ${s.body}`);
  }, 200);
}, { immediate: true });
</script>
