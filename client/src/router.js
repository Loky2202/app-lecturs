import { createRouter, createWebHistory } from 'vue-router';
import { useApp } from './stores/app.js';

const routes = [
  { path: '/perfiles', name: 'profiles', component: () => import('./views/Profiles.vue'), meta: { noProfile: true } },
  { path: '/', name: 'home', component: () => import('./views/Home.vue') },
  { path: '/camino', name: 'path', component: () => import('./views/Path.vue') },
  { path: '/leccion/:id', name: 'lesson', component: () => import('./views/Lesson.vue'), props: true },
  { path: '/juegos', name: 'games', component: () => import('./views/Games.vue') },
  { path: '/jugar/:game', name: 'play', component: () => import('./views/Play.vue'), props: true },
  { path: '/cuentos', name: 'stories', component: () => import('./views/Stories.vue') },
  { path: '/cuento/:id', name: 'story', component: () => import('./views/Story.vue'), props: true },
  { path: '/album', name: 'album', component: () => import('./views/Album.vue') },
  { path: '/logros', name: 'trophies', component: () => import('./views/Trophies.vue') },
  { path: '/padres', name: 'parent', component: () => import('./views/Parent.vue'), meta: { noProfile: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to) => {
  const app = useApp();
  if (!app.loadedProfiles) await app.loadProfiles();
  if (!to.meta.noProfile && !app.profile) return { name: 'profiles' };
  return true;
});
