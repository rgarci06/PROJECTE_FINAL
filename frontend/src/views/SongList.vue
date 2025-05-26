<template>
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold mb-8">Tus Canciones</h2>
    <div class="bg-spotify-dark rounded-xl shadow-lg overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="text-spotify-light-gray">
            <th class="p-4">#</th>
            <th class="p-4">Título</th>
            <th class="p-4">Artista</th>
            <th class="p-4">Género</th>
            <th class="p-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(song, index) in songs"
            :key="song._id"
            class="border-t border-spotify-light-gray hover:bg-spotify-black cursor-pointer"
            @click="playSong(song)"
          >
            <td class="p-4">{{ index + 1 }}</td>
            <td class="p-4">{{ song.title }}</td>
            <td class="p-4">{{ song.artist }}</td>
            <td class="p-4">{{ song.genre }}</td>
            <td class="p-4">
              <router-link
                :to="`/songs/${song._id}/edit`"
                class="text-spotify-green hover:text-green-500 mr-4"
                @click.stop
              >
                Editar
              </router-link>
              <button
                @click.stop="deleteSong(song._id)"
                class="text-red-500 hover:text-red-400"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { usePlayer } from '../composables/usePlayer';

const { playSong } = usePlayer();
const songs = ref([]);

const fetchSongs = async () => {
  try {
    const response = await axios.get('/api/songs');
    songs.value = response.data.songs.map(song => ({
      ...song,
      filePath: song.filePath.startsWith('http') 
        ? song.filePath 
        : `http://localhost:3007${song.filePath}`
    }));
    console.log('Canciones cargadas:', songs.value);
  } catch (error) {
    console.error('Error cargando canciones:', error);
  }
};

const deleteSong = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar esta canción?')) return;
  try {
    await axios.delete(`/api/songs/${id}`);
    songs.value = songs.value.filter(song => song._id !== id);
  } catch (error) {
    console.error('Error eliminando canción:', error);
    alert('Error al eliminar canción');
  }
};

onMounted(fetchSongs);
</script>