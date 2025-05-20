import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

class SongViewModel {
  async getSongs(params = {}) {
    const response = await axios.get(`${API_URL}/songs`, { params });
    return response.data;
  }

  async getGenres() {
    const response = await axios.get(`${API_URL}/songs/genres`);
    return response.data;
  }

  async createSong(song) {
    const response = await axios.post(`${API_URL}/songs`, song);
    return response.data;
  }

  async updateSong(id, song) {
    const response = await axios.put(`${API_URL}/songs/${id}`, song);
    return response.data;
  }

  async deleteSong(id) {
    const response = await axios.delete(`${API_URL}/songs/${id}`);
    return response.data;
  }

  async getPlaylists(params = {}) {
    const response = await axios.get(`${API_URL}/playlists`, { params });
    return response.data;
  }

  async createPlaylist(playlist) {
    const response = await axios.post(`${API_URL}/playlists`, playlist);
    return response.data;
  }

  async updatePlaylist(id, playlist) {
    console.log('Updating playlist via API:', { id, playlist });
    const response = await axios.put(`${API_URL}/playlists/${id}`, playlist);
    return response.data;
  }

  async deletePlaylist(id) {
    const response = await axios.delete(`${API_URL}/playlists/${id}`);
    return response.data;
  }

  async addSongToPlaylist(playlistId, songId) {
    const response = await axios.post(`${API_URL}/playlists/${playlistId}/songs`, { songId });
    return response.data;
  }
}

export default SongViewModel;