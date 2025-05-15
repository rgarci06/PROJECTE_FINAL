<template>
  <div class="card">
    <h2>Llista de Cançons</h2>
    <div class="form-group">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Cercar per títol o artista"
        @input="fetchSongs"
      />
    </div>
    <div class="form-group">
      <select v-model="filters.genre" class="form-control" @change="fetchSongs">
        <option value="">Tots els gèneres</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
      <select v-model="filters.artist" class="form-control" @change="fetchSongs">
        <option value="">Tots els artistes</option>
        <option v-for="artist in artists" :key="artist" :value="artist">{{ artist }}</option>
      </select>
    </div>
    <div class="form-group">
      <select v-model="sortBy" class="form-control" @change="fetchSongs">
        <option value="title">Títol</option>
        <option value="artist">Artista</option>
        <option value="year">Any</option>
        <option value="rating">Valoració</option>
      </select>
      <select v-model="sortOrder" class="form-control" @change="fetchSongs">
        <option value="asc">Ascendent</option>
        <option value="desc">Descendent</option>
      </select>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Títol</th>
          <th>Artista</th>
          <th>Àlbum</th>
          <th>Any</th>
          <th>Gènere</th>
          <th>Duració</th>
          <th>Valoració</th>
          <th>Favorita</th>
          <th>Accions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="song in songs" :key="song._id" class="fade-in">
          <td>{{ song.title }}</td>
          <td>{{ song.artist }}</td>
          <td>{{ song.album || 'N/A' }}</td>
          <td>{{ song.year || 'N/A' }}</td>
          <td>{{ song.genre }}</td>
          <td>{{ formatDuration(song.duration) }}</td>
          <td>
            <span v-for="n in 5" :key="n" :class="{ star: n <= song.rating }">★</span>
          </td>
          <td>
            <input
              type="checkbox"
              :checked="song.isFavorite"
              @change="toggleFavorite(song)"
            />
          </td>
          <td class="table-actions">
            <button class="btn btn-primary" @click="$emit('edit-song', song)">Editar</button>
            <button class="btn btn-danger" @click="deleteSong(song._id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="form-group">
      <button
        class="btn btn-secondary"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        Anterior
      </button>
      <span>Pàgina {{ currentPage }} de {{ totalPages }}</span>
      <button
        class="btn btn-secondary"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Següent
      </button>
    </div>
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
      artists: [],
      searchQuery: '',
      filters: { genre: '', artist: '' },
      sortBy: 'title',
      sortOrder: 'asc',
      currentPage: 1,
      limit: 10,
      total: 0,
      viewModel: new SongViewModel(),
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.limit);
    },
  },
  watch: {
    currentPage() {
      this.fetchSongs();
    },
  },
  async created() {
    await this.fetchSongs();
    this.genres = await this.viewModel.getGenres();
    this.artists = await this.viewModel.getArtists();
  },
  methods: {
    async fetchSongs() {
      try {
        const params = {
          search: this.searchQuery,
          genre: this.filters.genre,
          artist: this.filters.artist,
          sortBy: this.sortBy,
          order: this.sortOrder,
          page: this.currentPage,
          limit: this.limit,
        };
        const response = await this.viewModel.getSongs(params);
        this.songs = response.songs;
        this.total = response.total;
      } catch (error) {
        console.error('Error al carregar cançons:', error);
      }
    },
    async deleteSong(id) {
      if (confirm('Segur que vols eliminar aquesta cançó?')) {
        try {
          await this.viewModel.deleteSong(id);
          this.fetchSongs();
        } catch (error) {
          console.error('Error al eliminar:', error);
        }
      }
    },
    async toggleFavorite(song) {
      try {
        await this.viewModel.toggleFavorite(song._id);
        song.isFavorite = !song.isFavorite;
      } catch (error) {
        console.error('Error al canviar favorita:', error);
      }
    },
    formatDuration(seconds) {
      if (!seconds) return 'N/A';
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
  },
};
</script>

<style scoped>
.table-actions {
  display: flex;
  gap: 10px;
}
.form-group {
  display: flex;
  gap: 10px;
  align-items: center;
}
.form-group select,
.form-group input {
  flex: 1;
}
</style>