<template>
    <div class="card">
      <h2>{{ song ? 'Editar Cançó' : 'Afegir Cançó' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">Títol</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="form-control"
            :class="{ error: errors.title }"
            placeholder="Introdueix el títol"
          />
          <span v-if="errors.title" class="error-text">{{ errors.title }}</span>
        </div>
        <div class="form-group">
          <label for="artist">Artista</label>
          <input
            id="artist"
            v-model="form.artist"
            type="text"
            class="form-control"
            :class="{ error: errors.artist }"
            placeholder="Introdueix l'artista"
          />
          <span v-if="errors.artist" class="error-text">{{ errors.artist }}</span>
        </div>
        <div class="form-group">
          <label for="album">Àlbum</label>
          <input
            id="album"
            v-model="form.album"
            type="text"
            class="form-control"
            placeholder="Introdueix l'àlbum (opcional)"
          />
        </div>
        <div class="form-group">
          <label for="year">Any</label>
          <input
            id="year"
            v-model.number="form.year"
            type="number"
            class="form-control"
            :class="{ error: errors.year }"
            placeholder="Introdueix l'any"
          />
          <span v-if="errors.year" class="error-text">{{ errors.year }}</span>
        </div>
        <div class="form-group">
          <label for="genre">Gènere</label>
          <select id="genre" v-model="form.genre" class="form-control" :class="{ error: errors.genre }">
            <option value="">Selecciona un gènere</option>
            <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
          </select>
          <span v-if="errors.genre" class="error-text">{{ errors.genre }}</span>
        </div>
        <div class="form-group">
          <label for="duration">Duració (segons)</label>
          <input
            id="duration"
            v-model.number="form.duration"
            type="number"
            class="form-control"
            :class="{ error: errors.duration }"
            placeholder="Introdueix la duració"
          />
          <span v-if="errors.duration" class="error-text">{{ errors.duration }}</span>
        </div>
        <div class="form-group">
          <label for="rating">Valoració (0-5)</label>
          <input
            id="rating"
            v-model.number="form.rating"
            type="number"
            min="0"
            max="5"
            class="form-control"
            :class="{ error: errors.rating }"
            placeholder="Introdueix la valoració"
          />
          <span v-if="errors.rating" class="error-text">{{ errors.rating }}</span>
        </div>
        <div class="form-group">
          <label for="tags">Etiquetes (separades per comes)</label>
          <input
            id="tags"
            v-model="tagsInput"
            type="text"
            class="form-control"
            placeholder="ex. rock, clàssic, favorit"
          />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="form.isFavorite" /> Favorita
          </label>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Guardar</button>
          <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel·lar</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import SongViewModel from '../viewmodels/SongViewModel';
  
  export default {
    name: 'SongForm',
    props: {
      song: { type: Object, default: null },
    },
    data() {
      return {
        form: {
          title: '',
          artist: '',
          album: '',
          year: null,
          genre: '',
          duration: null,
          rating: null,
          tags: [],
          isFavorite: false,
        },
        tagsInput: '',
        errors: {},
        genres: ['Pop', 'Rock', 'Jazz', 'Clàssica', 'Electrònica', 'Altres'],
        viewModel: new SongViewModel(),
      };
    },
    watch: {
      song: {
        immediate: true,
        handler(newSong) {
          if (newSong) {
            this.form = { ...newSong, tags: newSong.tags || [] };
            this.tagsInput = newSong.tags ? newSong.tags.join(', ') : '';
          } else {
            this.resetForm();
          }
        },
      },
    },
    methods: {
      resetForm() {
        this.form = {
          title: '',
          artist: '',
          album: '',
          year: null,
          genre: '',
          duration: null,
          rating: null,
          tags: [],
          isFavorite: false,
        };
        this.tagsInput = '';
        this.errors = {};
      },
      validateForm() {
        this.errors = {};
        if (!this.form.title.trim()) this.errors.title = 'El títol és obligatori';
        if (!this.form.artist.trim()) this.errors.artist = 'L\'artista és obligatori';
        if (this.form.year && (this.form.year < 1900 || this.form.year > new Date().getFullYear())) {
          this.errors.year = 'L\'any ha de ser vàlid';
        }
        if (!this.form.genre) this.errors.genre = 'El gènere és obligatori';
        if (this.form.duration && this.form.duration < 0) this.errors.duration = 'La duració no pot ser negativa';
        if (this.form.rating && (this.form.rating < 0 || this.form.rating > 5)) {
          this.errors.rating = 'La valoració ha d\'estar entre 0 i 5';
        }
        return Object.keys(this.errors).length === 0;
      },
      handleSubmit() {
        if (!this.validateForm()) return;
        this.form.tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        this.$emit('song-saved', { ...this.form });
        this.resetForm();
      },
    },
  };
  </script>
  
  <style scoped>
  .card h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  </style>