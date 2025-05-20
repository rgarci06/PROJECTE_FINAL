<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Gestor de Música</h1>
      </div>
      <nav class="sidebar-nav">
        <button class="sidebar-btn" @click="showPlaylists">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M3 8h18v2H3zm0 4h18v2H3zm0 4h12v2H3z"/>
          </svg>
          Llista de Playlists
        </button>
        <button class="sidebar-btn" @click="showList">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M9 7h9v2H9zm0 4h9v2H9zm0 4h9v2H9zM6 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
          Llista de Cançons
        </button>
        <button class="sidebar-btn" @click="showForm">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 0 1 0 2h-6v6a1 1 0 0 1-2 0v-6H5a1 1 0 0 1 0-2h6V5a1 1 0 0 1 1-1z"/>
          </svg>
          Afegir Cançó
        </button>
      </nav>
    </aside>
    <main class="main-content">
      <header class="header">
        <h2>{{ currentView === 'playlists' ? 'Playlists' : currentView === 'list' ? 'Cançons' : 'Afegir Cançó' }}</h2>
      </header>
      <div class="content">
        <div v-if="notification.message" :class="['alert', notification.type === 'success' ? 'alert-success' : 'alert-error']">
          {{ notification.message }}
        </div>
        <SongList v-if="currentView === 'list'" @edit-song="editSong" />
        <PlaylistList v-if="currentView === 'playlists'" />
        <SongForm v-if="currentView === 'form'" :song="selectedSong" @song-saved="handleSongSaved" />
      </div>
    </main>
  </div>
</template>

<script>
import SongList from './views/SongList.vue';
import PlaylistList from './views/PlaylistList.vue';
import SongForm from './components/SongForm.vue';
import SongViewModel from './viewmodels/SongViewModel';

export default {
  name: 'App',
  components: { SongList, PlaylistList, SongForm },
  data() {
    return {
      currentView: 'playlists',
      selectedSong: null,
      notification: { message: '', type: '' },
      viewModel: new SongViewModel(),
    };
  },
  methods: {
    showList() {
      this.currentView = 'list';
      this.selectedSong = null;
      this.clearNotification();
    },
    showPlaylists() {
      this.currentView = 'playlists';
      this.selectedSong = null;
      this.clearNotification();
    },
    showForm() {
      this.currentView = 'form';
      this.selectedSong = null;
      this.clearNotification();
    },
    editSong(song) {
      this.selectedSong = { ...song };
      this.currentView = 'form';
    },
    async handleSongSaved(data) {
      try {
        if (!data) {
          this.showPlaylists();
          return;
        }
        if (this.selectedSong) {
          await this.viewModel.updateSong(this.selectedSong._id, data.song);
          if (data.playlists && data.playlists.length > 0) {
            for (const playlistId of data.playlists) {
              await this.viewModel.addSongToPlaylist(playlistId, this.selectedSong._id);
            }
          }
          this.notification = { message: 'Cançó actualitzada amb èxit', type: 'success' };
        } else {
          const newSong = await this.viewModel.createSong(data.song);
          if (data.playlists && data.playlists.length > 0) {
            for (const playlistId of data.playlists) {
              await this.viewModel.addSongToPlaylist(playlistId, newSong._id);
            }
          }
          this.notification = { message: 'Cançó afegida amb èxit', type: 'success' };
        }
        this.showPlaylists();
      } catch (error) {
        const errorMsg = error.response?.data?.errors
          ? Object.values(error.response.data.errors).join(', ')
          : error.response?.data?.message || error.message;
        this.notification = { message: `Error: ${errorMsg}`, type: 'error' };
      }
    },
    clearNotification() {
      this.notification = { message: '', type: '' };
    },
  },
  mounted() {
    setTimeout(() => this.clearNotification(), 5000);
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #191919, #121212);
}
.sidebar {
  width: 240px;
  background: #000;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sidebar-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sidebar-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.1s;
}
.sidebar-btn:hover {
  background: #282828;
  color: #fff;
  transform: translateX(4px);
}
.icon {
  width: 24px;
  height: 24px;
  fill: #b3b3b3;
}
.sidebar-btn:hover .icon {
  fill: #fff;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.header {
  background: linear-gradient(180deg, rgba(29, 185, 84, 0.3), transparent);
  padding: 24px 40px;
}
.header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}
.content {
  padding: 24px 40px;
  flex: 1;
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
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }
  .sidebar-header h1,
  .sidebar-btn span {
    display: none;
  }
  .sidebar-btn {
    justify-content: center;
  }
  .header,
  .content {
    padding: 16px;
  }
}
</style>