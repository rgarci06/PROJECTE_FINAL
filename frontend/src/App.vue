<template>
  <div class="container">
    <header class="header">
      <h1>Gestor de Música</h1>
      <nav class="nav">
        <button class="btn btn-primary" @click="showList">Llista de Cançons</button>
        <button class="btn btn-secondary" @click="showForm">Afegir Cançó</button>
      </nav>
    </header>
    <main>
      <div v-if="notification.message" :class="['alert', notification.type === 'success' ? 'alert-success' : 'alert-error']">
        {{ notification.message }}
      </div>
      <SongList v-if="currentView === 'list'" @edit-song="editSong" />
      <SongForm v-if="currentView === 'form'" :song="selectedSong" @song-saved="handleSongSaved" />
    </main>
    <footer class="footer">
      <p>&copy; 2025 Gestor de Música. Tots els drets reservats.</p>
    </footer>
  </div>
</template>

<script>
import SongList from './views/SongList.vue';
import SongForm from './components/SongForm.vue';
import SongViewModel from './viewmodels/SongViewModel';

export default {
  name: 'App',
  components: { SongList, SongForm },
  data() {
    return {
      currentView: 'list',
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
    showForm() {
      this.currentView = 'form';
      this.selectedSong = null;
      this.clearNotification();
    },
    editSong(song) {
      this.selectedSong = { ...song };
      this.currentView = 'form';
    },
    async handleSongSaved(songData) {
      try {
        if (this.selectedSong) {
          await this.viewModel.updateSong(this.selectedSong._id, songData);
          this.notification = { message: 'Cançó actualitzada amb èxit', type: 'success' };
        } else {
          await this.viewModel.createSong(songData);
          this.notification = { message: 'Cançó afegida amb èxit', type: 'success' };
        }
        this.showList();
      } catch (error) {
        this.notification = { message: `Error: ${error.message}`, type: 'error' };
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
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
  padding: 20px 0;
}
</style>