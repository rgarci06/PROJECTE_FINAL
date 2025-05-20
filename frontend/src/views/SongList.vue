<template>
  <div class="card">
    <h2>Llista de Cançons</h2>
    <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
    <div class="filters">
      <input v-model="searchQuery" class="form-control" placeholder="Cerca per títol o artista" @input="fetchSongs" />
      <select v-model="filterGenre" class="form-control" @change="fetchSongs">
        <option value="">Tots els gèneres</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
    </div>
    <table v-if="songs.length > 0" class="table">
      <thead>
        <tr>
          <th>Títol</th>
          <th>Artista</th>
          <th>Àlbum</th>
          <th>Gènere</th>
          <th>Duració</th>
          <th>Accions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="song in songs" :key="song._id">
          <td>{{ song.title }}</td>
          <td>{{ song.artist }}</td>
          <td>{{ song.album || 'N/A' }}</td>
          <td>{{ song.genre || 'N/A' }}</td>
          <td>{{ song.duration || 'N/A' }}</td>
          <td>
            <button class="btn btn-primary btn-small" @click="editSong(song)">Editar</button>
            <button class="btn btn-danger btn-small" @click="deleteSong(song._id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="alert alert-error">No hi ha cançons disponibles</div>
  </div>
</template>

<script>
import SongViewModel from '../viewmodels/SongViewModel';

export default {
  name: 'SongList',
  data() {
    return {
      songs: [],
      genres: [],
      searchQuery: '',
      filterGenre: '',
      errorMessage: '',
      viewModel: new SongViewModel()
    };
  },
  async created() {
    try {
      this.genres = await this.viewModel.getGenres();
      await this.fetchSongs();
    } catch (error) {
      this.errorMessage = 'No s\'han pogut carregar les dades inicials: ' + (error.response?.data?.message || error.message);
    }
  },
  methods: {
    async fetchSongs() {
      try {
        const params = {
          search: this.searchQuery,
          genre: this.filterGenre,
          sortBy: 'createdAt',
          order: 'desc',
          limit: 100,
        };
        console.log('Fetching songs with params:', params);
        const response = await this.viewModel.getSongs(params);
        this.songs = response.songs || [];
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = 'Error al carregar cançons: ' + (error.response?.data?.message || error.message);
      }
    },
    editSong(song) {
      // Implementar lògica per editar una cançó (per exemple, obrir un formulari)
      console.log('Editar cançó:', song);
    },
    async deleteSong(songId) {
      if (confirm('Segur que vols eliminar aquesta cançó?')) {
        try {
          await this.viewModel.deleteSong(songId);
          this.errorMessage = '';
          await this.fetchSongs();
        } catch (error) {
          this.errorMessage = 'Error al eliminar la cançó: ' + (error.response?.data?.message || error.message);
        }
      }
    }
  }
};
</script>

<style scoped>
.card {
  background: #181818;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  max-width: 1000px;
  margin: 0 auto;
}
h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 24px;
}
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #535353;
  border-radius: 6px;
  background: #282828;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-control:focus {
  outline: none;
  border-color: #1DB954;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
}
select.form-control {
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23b3b3b3" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.table {
  width: 100%;
  border-collapse: collapse;
  background: #181818;
}
.table th {
  padding: 14px;
  text-align: left;
  font-weight: 500;
  font-size: 0.95rem;
  color: #fff;
  background: #282828;
}
.table tbody td {
  padding: 14px;
  font-size: 0.9rem;
  color: #fff !important;
  border-top: 1px solid #282828;
}
.table tr:hover {
  background: #333;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary {
  background: #1DB954;
  color: #fff;
}
.btn-primary:hover {
  background: #1ed760;
  transform: scale(1.05);
}
.btn-danger {
  background: #dc3545;
  color: #fff;
}
.btn-danger:hover {
  background: #e4606d;
  transform: scale(1.05);
}
.btn-small {
  padding: 6px 12px;
  font-size: 0.85rem;
}
.alert-error {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  padding: 12px;
  margin-bottom: 24px;
  border-radius: 6px;
}
</style>