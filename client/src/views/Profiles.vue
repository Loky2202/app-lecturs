<template>
  <section class="screen">
    <div class="card center" style="align-items: center;">
      <div class="hero-emoji">🦖🚗🎮⚡</div>
      <h1>Misión Lectura</h1>
      <p v-if="!app.serverOk" class="error">No se pudo conectar con el servidor. Revisa que el contenedor esté encendido.</p>
      <p v-else-if="!creating" class="lead">¿Quién va a leer hoy?</p>
    </div>

    <div v-if="!creating" class="profiles">
      <button v-for="p in app.profiles" :key="p.id" class="profile-btn" @click="choose(p)">
        <span class="pe">{{ p.avatar }}</span><span>{{ p.name }}</span>
        <span class="small muted">⭐ {{ p.stars }} · Nivel {{ p.level }}</span>
      </button>
      <button class="profile-btn new" @click="creating = true"><span class="pe">➕</span><span>Nuevo niño</span></button>
    </div>

    <div v-else class="card">
      <h2>Nuevo perfil</h2>
      <input v-model="name" type="text" maxlength="20" placeholder="Nombre" aria-label="Nombre" @keydown.enter="create">
      <p class="muted">Elige tu personaje:</p>
      <div class="avatars">
        <button v-for="a in AVATARS" :key="a" class="avatar-pick" :class="{ active: avatar === a }" @click="avatar = a">{{ a }}</button>
      </div>
      <p class="muted">¿Qué te gusta más?</p>
      <div class="worlds">
        <button v-for="w in WORLDS" :key="w.id" class="world" :class="{ active: favorite === w.id }" :style="{ background: w.color }" @click="favorite = w.id">
          <span class="we">{{ w.emoji }}</span>{{ w.name }}
        </button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="row">
        <button class="btn ghost" @click="creating = false">Cancelar</button>
        <button class="btn primary big" @click="create">¡Empezar! 🚀</button>
      </div>
    </div>

    <div class="row" style="margin-top: auto;">
      <router-link class="btn ghost" to="/padres">👨‍👩‍👧 Zona de padres</router-link>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../stores/app.js';
import { WORLDS, AVATARS } from '../content/misc.js';
import { Voice } from '../lib/voice.js';

const app = useApp();
const router = useRouter();
const creating = ref(app.loadedProfiles && app.profiles.length === 0);
const name = ref('');
const avatar = ref('🦖');
const favorite = ref('dinos');
const error = ref('');

async function choose(p) {
  await app.selectProfile(p.id);
  Voice.speak(`¡Hola, ${p.name}!`);
  router.push('/');
}
async function create() {
  error.value = '';
  if (!name.value.trim()) { error.value = 'Escribe un nombre.'; return; }
  try {
    await app.createProfile({ name: name.value.trim(), avatar: avatar.value, favorite: favorite.value });
    Voice.speak(`¡Hola, ${name.value.trim()}! Bienvenido a Misión Lectura.`);
    router.push('/');
  } catch (e) { error.value = e.message; }
}
</script>
