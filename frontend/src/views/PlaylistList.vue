<template>
  <div class="card">
    <div v-if="currentView === 'list'">
      <div class="form-group">
        <input v-model="newPlaylistName" class="form-control" placeholder="Nom de la nova playlist" />
        <button class="btn btn-primary" @click="createPlaylist">Crear Playlist</button>
      </div>
      <div v-if="notification.message" :class="['alert', notification.type === 'success' ? 'alert-success' : 'alert-error']">
        {{ notification.message }}
      </div>
      <div class="playlist-grid">
        <div v-for="playlist in playlists" :key="playlist._id" class="playlist-card">
          <div class="playlist-cover" :style="{ backgroundImage: playlist.coverImage ? `url(${playlist.coverImage})` : '' }"></div>
          <h3>{{ playlist.name }}</h3>
          <ul>
            <li v-for="song in playlist.songs" :key="song._id">
              {{ song.title }} - {{ song.artist }} ({{ song.duration || 'N/A' }})
            </li>
          </ul>
          <p>Duració Total: {{ calculateTotalDuration(playlist.songs) }}</p>
          <div class="playlist-actions">
            <button class="btn btn-primary btn-small" @click="editPlaylist(playlist)">Editar</button>
            <button class="btn btn-danger btn-small" @click="deletePlaylist(playlist._id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
    <PlaylistForm v-if="currentView === 'form'" :playlist="selectedPlaylist" @save="handlePlaylistSaved" @cancel="showList" />
  </div>
</template>

<script>
import SongViewModel from '../viewmodels/SongViewModel';
import PlaylistForm from '../components/PlaylistForm.vue';

export default {
  name: 'PlaylistList',
  components: { PlaylistForm },
  data() {
    return {
      playlists: [],
      newPlaylistName: '',
      notification: { message: '', type: '' },
      currentView: 'list',
      selectedPlaylist: null,
      viewModel: new SongViewModel(),
    };
  },
  async created() {
    console.log('SongViewModel initialized:', this.viewModel);
    await this.fetchPlaylists();
  },
  methods: {
    async fetchPlaylists() {
      try {
        const response = await this.viewModel.getPlaylists({ limit: 100 });
        this.playlists = response.playlists || [];
        this.notification = { message: '', type: '' };
      } catch (error) {
        this.notification = { message: 'Error al carregar playlists: ' + (error.response?.data?.message || error.message), type: 'error' };
      }
    },
    async createPlaylist() {
      if (!this.newPlaylistName.trim()) {
        this.notification = { message: 'El nom de la playlist és obligatori', type: 'error' };
        return;
      }
      try {
        await this.viewModel.createPlaylist({ name: this.newPlaylistName });
        this.newPlaylistName = '';
        this.notification = { message: 'Playlist creada amb èxit', type: 'success' };
        await this.fetchPlaylists();
      } catch (error) {
        this.notification = { message: 'Error al crear playlist: ' + (error.response?.data?.errors?.name || error.message), type: 'error' };
      }
    },
    async deletePlaylist(playlistId) {
      if (confirm('Segur que vols eliminar aquesta playlist?')) {
        try {
          await this.viewModel.deletePlaylist(playlistId);
          this.notification = { message: 'Playlist eliminada amb èxit', type: 'success' };
          await this.fetchPlaylists();
        } catch (error) {
          this.notification = { message: 'Error al eliminar playlist: ' + (error.response?.data?.message || error.message), type: 'error' };
        }
      }
    },
    editPlaylist(playlist) {
      this.selectedPlaylist = { ...playlist };
      this.currentView = 'form';
      this.notification = { message: '', type: '' };
    },
    async handlePlaylistSaved(data) {
      try {
        console.log('Handling playlist save with data:', {
          name: data.name,
          coverImageLength: data.coverImage ? data.coverImage.length : 'empty',
          songs: data.songs
        });
        if (this.selectedPlaylist) {
          console.log('Calling updatePlaylist with ID:', this.selectedPlaylist._id);
          await this.viewModel.updatePlaylist(this.selectedPlaylist._id, data);
          this.notification = { message: 'Playlist actualitzada amb èxit', type: 'success' };
        }
        this.showList();
      } catch (error) {
        const errorMsg = error.response?.data?.errors
          ? Object.values(error.response.data.errors).join(', ')
          : error.response?.data?.message || error.message;
        console.error('Save playlist error:', errorMsg);
        this.notification = { message: `Error al desar la playlist: ${errorMsg}`, type: 'error' };
      }
    },
    showList() {
      this.currentView = 'list';
      this.selectedPlaylist = null;
      this.fetchPlaylists();
    },
    calculateTotalDuration(songs) {
      let totalSeconds = 0;
      songs.forEach(song => {
        if (song.duration) {
          const [minutes, seconds] = song.duration.split(':').map(Number);
          totalSeconds += minutes * 60 + seconds;
        }
      });
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
}
.form-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.form-control {
  flex: 1;
  padding: 10px;
  border: 1px solid #535353;
  border-radius: 6px;
  background: #282828;
  color: #fff;
  font-size: 0.9rem;
}
.form-control:focus {
  outline: none;
  border-color: #1DB954;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
}
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
.playlist-card {
  background: #282828;
  padding: 16px;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.playlist-cover {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #1DB954, #191919);
  border-radius: 8px;
  margin-bottom: 12px;
  background-size: cover;
  background-position: center;
}
.playlist-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
}
.playlist-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
}
.playlist-card li {
  font-size: 0.85rem;
  color: #fff;
  margin-bottom: 8px;
}
.playlist-card p {
  font-size: 0.85rem;
  color: #fff;
  margin: 0 0 12px;
}
.playlist-actions {
  display: flex;
  gap: 8px;
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
.alert {
  padding: 12px;
  margin-bottom: 24px;
  border-radius: 6px;
  font-size: 0.9rem;
}
.alert-success {
  background-color: rgba(29, 185, 84, 0.2);
  color: #1DB954;
}
.alert-error {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}
</style>