<template>
    <div class="card">
      <h2>{{ playlist?._id ? 'Editar Playlist' : 'Crear Playlist' }}</h2>
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
      <form @submit.prevent="savePlaylist">
        <div class="form-group">
          <input id="name" v-model="form.name" class="form-control" required placeholder=" " />
          <label for="name">Nom de la Playlist</label>
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label for="coverImage" class="file-label">
            <span class="file-button">Tria una Foto de Portada</span>
            <input id="coverImage" type="file" accept="image/png,image/jpeg" class="file-input" @change="handleImageUpload" />
          </label>
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Previsualització de la portada" />
          </div>
          <span v-if="errors.coverImage" class="error">{{ errors.coverImage }}</span>
        </div>
        <div class="form-group">
          <h3>Cançons</h3>
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
                <th>Seleccionar</th>
                <th>Títol</th>
                <th>Àlbum</th>
                <th>Duració</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="song in songs" :key="song._id">
                <td>
                  <input type="checkbox" :value="song._id" v-model="selectedSongs" />
                </td>
                <td>{{ song.title }}</td>
                <td>{{ song.album || 'N/A' }}</td>
                <td>{{ song.duration || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="alert alert-error">No hi ha cançons disponibles</div>
        </div>
        <div class="form-group buttons">
          <button type="submit" class="btn btn-primary">Desar</button>
          <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel·lar</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import SongViewModel from '../viewmodels/SongViewModel';
  
  export default {
    name: 'PlaylistForm',
    props: {
      playlist: { type: Object, default: () => ({}) }
    },
    data() {
      return {
        form: {
          name: this.playlist.name || '',
          coverImage: this.playlist.coverImage || '',
        },
        selectedSongs: this.playlist.songs?.map(song => song._id) || [],
        songs: [],
        genres: [],
        searchQuery: '',
        filterGenre: '',
        imagePreview: this.playlist.coverImage || '',
        errors: {},
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
      handleImageUpload(event) {
        console.log('Image upload triggered');
        const file = event.target.files[0];
        if (file) {
          if (!['image/png', 'image/jpeg'].includes(file.type)) {
            this.errors.coverImage = 'Només es permeten imatges PNG o JPG';
            return;
          }
          if (file.size > 2 * 1024 * 1024) {
            this.errors.coverImage = 'La imatge no pot superar els 2MB';
            return;
          }
          console.log('Selected file:', file.name, file.type, file.size);
          const reader = new FileReader();
          reader.onload = (e) => {
            this.form.coverImage = e.target.result;
            this.imagePreview = e.target.result;
            this.errors.coverImage = '';
            console.log('Image loaded, size (Base64):', e.target.result.length);
          };
          reader.onerror = (e) => {
            console.error('Error reading file:', e);
            this.errors.coverImage = 'Error al carregar la imatge';
          };
          reader.readAsDataURL(file);
        }
      },
      savePlaylist() {
        this.errors = {};
        this.errorMessage = '';
        if (!this.form.name.trim()) {
          this.errors.name = 'El nom de la playlist és obligatori';
          return;
        }
        const payload = {
          name: this.form.name,
          coverImage: this.form.coverImage || '',
          songs: this.selectedSongs
        };
        console.log('Saving playlist with payload:', {
          name: payload.name,
          coverImageLength: payload.coverImage ? payload.coverImage.length : 'empty',
          songs: payload.songs
        });
        this.$emit('save', payload);
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
    max-width: 800px;
    margin: 0 auto;
  }
  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 24px;
  }
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
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
  label.file-label {
    display: inline-block;
    cursor: pointer;
  }
  .file-input {
    display: none;
  }
  .file-button {
    display: inline-block;
    padding: 12px 24px;
    background: #535353;
    color: #fff;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s, transform 0.1s;
  }
  .file-button:hover {
    background: #636363;
    transform: scale(1.05);
  }
  .image-preview {
    margin-top: 12px;
  }
  .image-preview img {
    max-width: 200px;
    border-radius: 8px;
  }
  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
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
  .error {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 8px;
    display: block;
  }
  .alert-error {
    background-color: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    padding: 12px;
    margin-bottom: 24px;
    border-radius: 6px;
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