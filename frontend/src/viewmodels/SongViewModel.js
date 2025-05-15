import axios from 'axios';
import { SongModel } from '../models/SongModel';

export default class SongViewModel {
  constructor() {
    this.baseUrl = '/api';
  }

  async getSongs(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/songs`, { params });
      return {
        songs: SongModel.fromArray(response.data.songs),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      };
    } catch (error) {
      throw new Error('No s\'han pogut carregar les cançons');
    }
  }

  async getSongById(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/songs/${id}`);
      return new SongModel(response.data);
    } catch (error) {
      throw new Error('No s\'ha pogut carregar la cançó');
    }
  }

  async createSong(songData) {
    try {
      const model = new SongModel(songData);
      const errors = model.validate();
      if (Object.keys(errors).length > 0) {
        throw new Error('Dades invàlides: ' + Object.values(errors).join(', '));
      }
      const response = await axios.post(`${this.baseUrl}/songs`, model.toJSON());
      return new SongModel(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'No s\'ha pogut crear la cançó');
    }
  }

  async updateSong(id, songData) {
    try {
      const model = new SongModel(songData);
      const errors = model.validate();
      if (Object.keys(errors).length > 0) {
        throw new Error('Dades invàlides: ' + Object.values(errors).join(', '));
      }
      const response = await axios.put(`${this.baseUrl}/songs/${id}`, model.toJSON());
      return new SongModel(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'No s\'ha pogut actualitzar la cançó');
    }
  }

  async deleteSong(id) {
    try {
      await axios.delete(`${this.baseUrl}/songs/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'No s\'ha pogut eliminar la cançó');
    }
  }

  async toggleFavorite(id) {
    try {
      const response = await axios.put(`${this.baseUrl}/songs/${id}/favorite`);
      return new SongModel(response.data);
    } catch (error) {
      throw new Error('No s\'ha pogut canviar l\'estat de favorita');
    }
  }

  async getGenres() {
    try {
      const response = await axios.get(`${this.baseUrl}/genres`);
      return response.data;
    } catch (error) {
      return SongModel.genres;
    }
  }

  async getArtists() {
    try {
      const response = await axios.get(`${this.baseUrl}/artists`);
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async getFavorites() {
    try {
      const response = await axios.get(`${this.baseUrl}/favorites`);
      return SongModel.fromArray(response.data);
    } catch (error) {
      throw new Error('No s\'han pogut carregar les favorites');
    }
  }

  async getRecent() {
    try {
      const response = await axios.get(`${this.baseUrl}/recent`);
      return SongModel.fromArray(response.data);
    } catch (error) {
      throw new Error('No s\'han pogut carregar les recents');
    }
  }

  async getTopRated() {
    try {
      const response = await axios.get(`${this.baseUrl}/top-rated`);
      return SongModel.fromArray(response.data);
    } catch (error) {
      throw new Error('No s\'han pogut carregar les millor valorades');
    }
  }

  async searchSongs(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/songs`, { params: { search: query } });
      return SongModel.fromArray(response.data.songs);
    } catch (error) {
      throw new Error('No s\'han pogut cercar les cançons');
    }
  }

  async getByYearRange(startYear, endYear) {
    try {
      const response = await axios.get(`${this.baseUrl}/year-range`, {
        params: { startYear, endYear },
      });
      return SongModel.fromArray(response.data);
    } catch (error) {
      throw new Error('No s\'han pogut carregar les cançons per rang d\'any');
    }
  }

  async getByDuration(minDuration, maxDuration) {
    try {
      const response = await axios.get(`${this.baseUrl}/duration`, {
        params: { minDuration, maxDuration },
      });
      return SongModel.fromArray(response.data);
    } catch (error) {
      throw new Error('No s\'han pogut carregar les cançons per duració');
    }
  }

  async getByTag(tag) {
    try {
      const response = await axios.get(`${this.baseUrl}/tag`, { params: { tag } });
      return SongModel.fromArray(response.data);
    } catch (error) {
      throw new Error('No s\'han pogut carregar les cançons per etiqueta');
    }
  }

  async getStats() {
    try {
      const response = await axios.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      throw new Error('No s\'han pogut carregar les estadístiques');
    }
  }
}