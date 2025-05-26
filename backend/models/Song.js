const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  genre: {
    type: String,
    required: true,
    enum: ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Reggaeton', 'Other'],
  },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Song', songSchema);