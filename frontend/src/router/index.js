import { createRouter, createWebHistory } from 'vue-router';
import SongList from '../views/SongList.vue';
import SongForm from '../views/SongForm.vue';
import SongEdit from '../views/SongEdit.vue';

const routes = [
  { path: '/', redirect: '/songs' },
  { path: '/songs', component: SongList },
  { path: '/songs/new', component: SongForm },
  { path: '/songs/:id/edit', component: SongEdit },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;