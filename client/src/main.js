import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router.js';
import { Voice } from './lib/voice.js';
import { useApp } from './stores/app.js';
import './styles.css';

Voice.init();

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');

// Al cerrar o cambiar de pestaña, envía lo que quede pendiente de guardar.
const flush = () => { const store = useApp(pinia); store.saveNow(); store.flushEvents(); };
window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
