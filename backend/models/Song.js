const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  album: { type: String, default: '' },
  year: { type: Number, default: null },
  genre: {
    type: String,
    required: true,
    enum: ['Pop', 'Rock', 'Jazz', 'Clàssica', 'Electrònica', 'Reggaeton', 'Altres']
  },
  duration: {
    type: String,
    default: null,
    validate: {
      validator: function (v) {
        return v === null || /^\d+:[0-5]\d$/.test(v);
      },
      message: 'La duració ha de ser en format MM:SS'
    }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Song', songSchema);