<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-3xl font-bold mb-8">Add New Song</h2>
    <form @submit.prevent="saveSong" class="bg-spotify-dark p-8 rounded-xl shadow-lg">
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
        <label class="block text-sm font-medium text-spotify-gray mb-2">MP3 File</label>
        <input
          type="file"
          accept="audio/mpeg"
          @change="handleFileChange"
          class="w-full text-spotify-gray file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-spotify-green file:text-black hover:file:bg-green-500"
          required
        />
      </div>
      <button
        type="submit"
        class="bg-spotify-green text-black font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors"
      >
        Save Song
      </button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'SongForm',
  setup() {
    const router = useRouter();
    const song = ref({
      title: '',
      artist: '',
      genre: '',
    });
    const genres = ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Reggaeton', 'Other'];
    const mp3File = ref(null);

    const handleFileChange = (event) => {
      mp3File.value = event.target.files[0];
      console.log('Selected file:', mp3File.value?.name);
    };

    const saveSong = async () => {
      try {
        const formData = new FormData();
        formData.append('title', song.value.title);
        formData.append('artist', song.value.artist);
        formData.append('genre', song.value.genre);
        if (mp3File.value) {
          formData.append('mp3File', mp3File.value);
        } else {
          throw new Error('MP3 file is required');
        }

        console.log('Sending song data:', {
          title: song.value.title,
          artist: song.value.artist,
          genre: song.value.genre,
          file: mp3File.value.name,
        });

        const response = await axios.post('/api/songs', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Song created:', response.data);
        router.push('/songs');
      } catch (error) {
        console.error('Error saving song:', error.response?.data || error.message);
        alert(`Error saving song: ${error.response?.data?.message || error.message}`);
      }
    };

    return { song, genres, handleFileChange, saveSong };
  },
};
</script>