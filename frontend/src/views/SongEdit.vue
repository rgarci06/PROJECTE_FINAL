<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-3xl font-bold mb-8">Edit Song</h2>
    <form @submit.prevent="updateSong" class="bg-spotify-dark p-8 rounded-xl shadow-lg">
      <div class="mb-6">
        <label class="block text-sm font-medium text-spotify-gray mb-2">Title</label>
        <input
          v-model="song.title"
          class="w-full bg-spotify-black text-white border border-spotify-light-gray rounded-lg p-3 focus:outline-none focus:border-spotify-green"
          required
        />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-spotify-gray mb-2">Artist</label>
        <input
          v-model="song.artist"
          class="w-full bg-spotify-black text-white border border-spotify-light-gray rounded-lg p-3 focus:outline-none focus:border-spotify-green"
          required
        />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-spotify-gray mb-2">Genre</label>
        <select
          v-model="song.genre"
          class="w-full bg-spotify-black text-white border border-spotify-light-gray rounded-lg p-3 focus:outline-none focus:border-spotify-green"
          required
        >
          <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-spotify-gray mb-2">MP3 File (optional)</label>
        <input
          type="file"
          accept="audio/mpeg"
          @change="handleFileChange"
          class="w-full text-spotify-gray file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-spotify-green file:text-black hover:file:bg-green-500"
        />
      </div>
      <button
        type="submit"
        class="bg-spotify-green text-black font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors"
      >
        Update Song
      </button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: 'SongEdit',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const song = ref({
      title: '',
      artist: '',
      genre: '',
    });
    const genres = ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Reggaeton', 'Other'];
    const mp3File = ref(null);

    const fetchSong = async () => {
      try {
        const response = await axios.get(`/api/songs/${route.params.id}`);
        song.value = response.data;
      } catch (error) {
        console.error('Error fetching song:', error);
        alert('Error loading song');
      }
    };

    const handleFileChange = (event) => {
      mp3File.value = event.target.files[0];
    };

    const updateSong = async () => {
      try {
        const formData = new FormData();
        formData.append('title', song.value.title);
        formData.append('artist', song.value.artist);
        formData.append('genre', song.value.genre);
        if (mp3File.value) {
          formData.append('mp3File', mp3File.value);
        }

        await axios.put(`/api/songs/${route.params.id}`, formData);
        router.push('/songs');
      } catch (error) {
        console.error('Error updating song:', error);
        alert('Error updating song');
      }
    };

    onMounted(fetchSong);

    return { song, genres, handleFileChange, updateSong };
  },
};
</script>