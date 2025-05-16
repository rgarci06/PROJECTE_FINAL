const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  album: { type: String, default: '' },
  year: { type: Number, default: null },
  genre: {
    type: String,
    required: true,
    enum: ['Pop', 'Rock', 'Jazz', 'Clàssica', 'Electrònica', 'Altres']
  },
  duration: { type: Number, default: null, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  tags: { type: [String], default: [] },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Song', songSchema);