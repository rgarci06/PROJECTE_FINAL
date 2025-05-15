export class SongModel {
    constructor(data = {}) {
      this._id = data._id || null;
      this.title = data.title || '';
      this.artist = data.artist || '';
      this.album = data.album || '';
      this.year = data.year || null;
      this.genre = data.genre || '';
      this.duration = data.duration || null;
      this.rating = data.rating || 0;
      this.tags = data.tags || [];
      this.isFavorite = data.isFavorite || false;
      this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    }
  
    validate() {
      const errors = {};
      if (!this.title.trim()) errors.title = 'El títol és obligatori';
      if (!this.artist.trim()) errors.artist = 'L\'artista és obligatori';
      if (this.year && (this.year < 1900 || this.year > new Date().getFullYear())) {
        errors.year = 'L\'any ha de ser vàlid';
      }
      if (!this.genre) errors.genre = 'El gènere és obligatori';
      if (this.duration && this.duration < 0) errors.duration = 'La duració no pot ser negativa';
      if (this.rating && (this.rating < 0 || this.rating > 5)) {
        errors.rating = 'La valoració ha d\'estar entre 0 i 5';
      }
      return errors;
    }
  
    toJSON() {
      return {
        _id: this._id,
        title: this.title,
        artist: this.artist,
        album: this.album,
        year: this.year,
        genre: this.genre,
        duration: this.duration,
        rating: this.rating,
        tags: this.tags,
        isFavorite: this.isFavorite,
        createdAt: this.createdAt,
      };
    }
  
    static fromArray(dataArray) {
      return dataArray.map(data => new SongModel(data));
    }
  
    formatDuration() {
      if (!this.duration) return 'N/A';
      const minutes = Math.floor(this.duration / 60);
      const seconds = this.duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  
    getFullInfo() {
      return `${this.title} - ${this.artist} (${this.year || 'N/A'})`;
    }
  
    isValidYear() {
      return !this.year || (this.year >= 1900 && this.year <= new Date().getFullYear());
    }
  
    isValidDuration() {
      return !this.duration || this.duration >= 0;
    }
  
    isValidRating() {
      return !this.rating || (this.rating >= 0 && this.rating <= 5);
    }
  
    addTag(tag) {
      if (tag && !this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    }
  
    removeTag(tag) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  
    toggleFavorite() {
      this.isFavorite = !this.isFavorite;
    }
  
    update(data) {
      Object.assign(this, data);
    }
  
    clone() {
      return new SongModel(this.toJSON());
    }
  
    static genres = ['Pop', 'Rock', 'Jazz', 'Clàssica', 'Electrònica', 'Altres'];
  
    static validateField(field, value) {
      switch (field) {
        case 'title':
        case 'artist':
          return value.trim().length > 0;
        case 'year':
          return !value || (value >= 1900 && value <= new Date().getFullYear());
        case 'genre':
          return SongModel.genres.includes(value);
        case 'duration':
          return !value || value >= 0;
        case 'rating':
          return !value || (value >= 0 && value <= 5);
        default:
          return true;
      }
    }
  
    static formatField(field, value) {
      if (field === 'duration' && value) {
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      return value || 'N/A';
    }
  
    static createEmpty() {
      return new SongModel();
    }
  
    static isValidSong(data) {
      const model = new SongModel(data);
      return Object.keys(model.validate()).length === 0;
    }
  }