const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

mongoose.connect('mongodb://localhost:27017/musicDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: String,
  year: Number,
  genre: String,
  duration: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now },
});

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  coverImage: { type: String, default: '' },
});

const Song = mongoose.model('Song', songSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);

const songValidationRules = [
  body('title').notEmpty().withMessage('El títol és obligatori'),
  body('artist').notEmpty().withMessage('L\'artista és obligatori'),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('L\'any ha de ser vàlid'),
  body('duration').optional().matches(/^\d+:[0-5]\d$/).withMessage('La duració ha de ser en format MM:SS'),
  body('rating').optional().isInt({ min: 0, max: 5 }).withMessage('La valoració ha d\'estar entre 0 i 5'),
];

const playlistValidationRules = [
  body('name').notEmpty().withMessage('El nom de la playlist és obligatori'),
  body('songs').optional().isArray().withMessage('Les cançons han de ser un array d\'IDs'),
  body('coverImage').optional().isString().withMessage('La imatge de portada ha de ser una cadena'),
];

app.get('/api/songs', async (req, res) => {
  try {
    const { search, genre, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) query.genre = genre;

    const songs = await Song.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Song.countDocuments(query);

    res.json({ songs, total });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: `Error al obtenir cançons: ${error.message}` });
  }
});

app.get('/api/songs/genres', async (req, res) => {
  try {
    const genres = await Song.distinct('genre');
    res.json(genres.filter(genre => genre));
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: `Error al obtenir gèneres: ${error.message}` });
  }
});

app.post('/api/songs', songValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  try {
    const song = new Song(req.body);
    const newSong = await song.save();
    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(400).json({ message: `Error al crear cançó: ${error.message}` });
  }
});

app.put('/api/songs/:id', songValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!song) return res.status(404).json({ message: 'Cançó no trobada' });
    res.json(song);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(400).json({ message: `Error al actualitzar cançó: ${error.message}` });
  }
});

app.delete('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: 'Cançó no trobada' });
    await Playlist.updateMany(
      { songs: req.params.id },
      { $pull: { songs: req.params.id } }
    );
    res.json({ message: 'Cançó eliminada' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: `Error al eliminar cançó: ${error.message}` });
  }
});

app.get('/api/playlists', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const playlists = await Playlist.find()
      .populate('songs')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Playlist.countDocuments();
    res.json({ playlists, total });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: `Error al obtenir playlists: ${error.message}` });
  }
});

app.post('/api/playlists', playlistValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  try {
    const playlist = new Playlist({ name: req.body.name, songs: [], coverImage: '' });
    const newPlaylist = await playlist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(400).json({ message: `Error al crear playlist: ${error.message}` });
  }
});

app.post('/api/playlists/:id/songs', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist no trobada' });

    const song = await Song.findById(req.body.songId);
    if (!song) return res.status(404).json({ message: 'Cançó no trobada' });

    if (!playlist.songs.includes(song._id)) {
      playlist.songs.push(song._id);
      await playlist.save();
    }

    const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(400).json({ message: `Error al afegir cançó a la playlist: ${error.message}` });
  }
});

app.put('/api/playlists/:id', playlistValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.mapped());
    return res.status(400).json({ errors: errors.mapped() });
  }

  try {
    const { name, coverImage, songs } = req.body;
    console.log('Updating playlist with data:', { name, coverImageLength: coverImage ? coverImage.length : 'empty', songs });
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist no trobada' });

    playlist.name = name || playlist.name;
    playlist.coverImage = coverImage !== undefined ? coverImage : playlist.coverImage;
    playlist.songs = Array.isArray(songs) ? songs : playlist.songs;

    const updatedPlaylist = await playlist.save();
    await updatedPlaylist.populate('songs');
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ message: `Error al actualitzar la playlist: ${error.message}` });
  }
});

app.delete('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist no trobada' });
    res.json({ message: 'Playlist eliminada' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: `Error al eliminar playlist: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});