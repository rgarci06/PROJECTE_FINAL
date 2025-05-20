<template>
  <div class="card">
    <h2>{{ song?._id ? 'Editar Cançó' : 'Afegir Cançó' }}</h2>
    <form @submit.prevent="saveSong">
      <div class="form-group">
        <input id="title" v-model="form.title" class="form-control" required placeholder=" " />
        <label for="title">Títol</label>
        <span v-if="errors.title" class="error">{{ errors.title }}</span>
      </div>
      <div class="form-group">
        <input id="artist" v-model="form.artist" class="form-control" required placeholder=" " />
        <label for="artist">Artista</label>
        <span v-if="errors.artist" class="error">{{ errors.artist }}</span>
      </div>
      <div class="form-group">
        <input id="album" v-model="form.album" class="form-control" placeholder=" " />
        <label for="album">Àlbum</label>
      </div>
      <div class="form-group">
        <input id="year" v-model="form.year" type="number" class="form-control" placeholder=" " />
        <label for="year">Any</label>
        <span v-if="errors.year" class="error">{{ errors.year }}</span>
      </div>
      <div class="form-group">
        <select id="genre" v-model="form.genre" class="form-control" required>
          <option value="" disabled>Selecciona un gènere</option>
          <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
        <label for="genre">Gènere</label>
        <span v-if="errors.genre" class="error">{{ errors.genre }}</span>
      </div>
      <div class="form-group">
        <input id="duration" v-model="form.duration" class="form-control" placeholder=" " />
        <label for="duration">Duració (MM:SS)</label>
        <span v-if="errors.duration" class="error">{{ errors.duration }}</span>
      </div>
      <div class="form-group">
        <input id="rating" v-model="form.rating" type="number" min="0" max="5" class="form-control" placeholder=" " />
        <label for="rating">Valoració (0-5)</label>
        <span v-if="errors.rating" class="error">{{ errors.rating }}</span>
      </div>
      <div class="form-group">
        <select v-model="selectedPlaylists" class="form-control" multiple>
          <option v-for="playlist in playlists" :key="playlist._id" :value="playlist._id">
            {{ playlist.name }}
          </option>
        </select>
        <label for="playlists">Playlists</label>
      </div>
      <div class="form-group buttons">
        <button type="submit" class="btn btn-primary">Desar</button>
        <button type="button" class="btn btn-secondary" @click="$emit('song-saved', null)">Cancel·lar</button>
      </div>
    </form>
  </div>
</template>

<script>
import { SongModel } from '../models/SongModel';
import SongViewModel from '../viewmodels/SongViewModel';

export default {
  name: 'SongForm',
  props: {
    song: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      form: new SongModel(this.song || {}),
      errors: {},
      genres: SongModel.genres,
      playlists: [],
      selectedPlaylists: [],
      viewModel: new SongViewModel()
    };
  },
  async created() {
    try {
      const response = await this.viewModel.getPlaylists({ limit: 100 });
      this.playlists = response.playlists || [];
    } catch (error) {
      this.errors.api = 'No s\'han pogut carregar les playlists';
    }
  },
  methods: {
    saveSong() {
      this.errors = this.form.validate();
      if (Object.keys(this.errors).length === 0) {
        this.$emit('song-saved', {
          song: this.form.toJSON(),
          playlists: this.selectedPlaylists
        });
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
  max-width: 600px;
  margin: 0 auto;
}
h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 24px;
}
.form-group {
  margin-bottom: 20px;
  position: relative;
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
.form-control[multiple] {
  height: 140px;
}
.form-control:placeholder-shown + label {
  top: 12px;
  left: 12px;
  font-size: 1rem;
}
.form-control:focus + label,
.form-control:not(:placeholder-shown) + label {
  top: -8px;
  left: 8px;
  font-size: 0.75rem;
  color: #1DB954;
  background: #181818;
  padding: 0 4px;
}
label {
  position: absolute;
  color: #b3b3b3;
  transition: all 0.2s;
  pointer-events: none;
}
select.form-control {
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23b3b3b3" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 8px;
  display: block;
}
.buttons {
  display: flex;
  gap: 12px;
}
.btn {
  padding: 12px 24px;
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
.btn-secondary {
  background: #535353;
  color: #fff;
}
.btn-secondary:hover {
  background: #636363;
  transform: scale(1.05);
}
</style>