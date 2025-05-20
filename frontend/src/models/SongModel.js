export class SongModel {
  static genres = ['Pop', 'Rock', 'Jazz', 'Clàssica', 'Electrònica', 'Reggaeton', 'Altres'];

  constructor(data = {}) {
    this._id = data._id || null;
    this.title = data.title || '';
    this.artist = data.artist || '';
    this.album = data.album || '';
    this.year = data.year || null;
    this.genre = data.genre || '';
    this.duration = data.duration || null;
    this.rating = data.rating ?? null;
  }

  validate() {
    const errors = {};
    if (!this.title?.trim()) errors.title = 'El títol és obligatori';
    if (!this.artist?.trim()) errors.artist = 'L\'artista és obligatori';
    if (this.genre && !SongModel.genres.includes(this.genre)) {
      errors.genre = 'El gènere ha de ser vàlid';
    }
    if (this.year && (this.year < 1900 || this.year > new Date().getFullYear())) {
      errors.year = 'L\'any ha de ser vàlid';
    }
    if (this.duration && !/^\d+:[0-5]\d$/.test(this.duration)) {
      errors.duration = 'La duració ha de ser en format MM:SS';
    }
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
      rating: this.rating
    };
  }

  static fromArray(dataArray) {
    return dataArray.map(data => new SongModel(data));
  }
}