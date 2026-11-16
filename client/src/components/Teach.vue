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
          <span class="we">{{ w.e }}</span><span class="ww">{{ w.w }}</span><span class="ws">{{ w.s.join(' - ') }}</span>
        </button>
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
import { LETTER_INFO } from '../content/words.js';
import { filterWords, syllablesOf } from '../lib/content.js';
import { shuffle, spoken } from '../lib/utils.js';
import { useApp } from '../stores/app.js';

const props = defineProps({ screen: { type: Object, required: true } });
const app = useApp();
const said = reactive(new Set());

const info = computed(() => LETTER_INFO[props.screen.letter] || { name: '', sound: '', tip: '' });
const syls = computed(() => syllablesOf(props.screen.letter));
const examples = computed(() => {
  const s = props.screen;
  const f = s.letter ? { letter: s.letter } : { minSyl: s.minSyl, maxSyl: s.maxSyl };
  const list = filterWords(f);
  const fav = app.profile?.favorite;
  const ordered = list.filter((w) => w.world === fav).concat(list.filter((w) => w.world !== fav));
  return ordered.slice(0, s.count || 4);
});

function sayLetter() { Voice.speak(`Esta es la letra ${info.value.name}. ${info.value.sound ? `Suena ${info.value.sound}.` : ''} ${info.value.tip}`); }
function saySound() { Voice.speak(info.value.sound, { rate: 0.7 }); }
function saySyl(s) { Sfx.play('tap'); said.add(s); Voice.speak(spoken(s), { rate: 0.75 }); }
function sayWord(w) { Sfx.play('tap'); Voice.speak(`${w.s.map(spoken).join('. ')}. ${spoken(w.w)}.`, { rate: 0.8 }); }

watch(() => props.screen, (s) => {
  said.clear();
  if (!app.settings.autoRead) return;
  setTimeout(() => {
    if (s.type === 'letter') sayLetter();
    else if (s.type === 'syllables') Voice.speak(`Con la ${info.value.name} y las vocales: ${syls.value.map(spoken).join(', ')}.`);
    else if (s.type === 'words') Voice.speak('Toca cada palabra para oírla por sílabas.');
    else Voice.speak(`${s.title}. ${s.body}`);
  }, 200);
}, { immediate: true });
</script>
