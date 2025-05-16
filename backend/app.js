const express = require('express');
const mongoose = require('mongoose');
const Song = require('./models/Song');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per parsejar JSON
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Connexió a MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/gestor_musica', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connectat');
  } catch (error) {
    console.error('Error de connexió a MongoDB:', error.message);
    process.exit(1);
  }
}
connectDB();

// Middleware bàsic per CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Validacions
function validateSong(data) {
  const errors = {};
  if (!data.title?.trim()) errors.title = 'El títol és obligatori';
  if (!data.artist?.trim()) errors.artist = 'L\'artista és obligatori';
  if (!data.genre || !['Pop', 'Rock', 'Jazz', 'Clàssica', 'Electrònica', 'Altres'].includes(data.genre)) {
    errors.genre = 'El gènere ha de ser vàlid';
  }
  if (data.year && (data.year < 1900 || data.year > new Date().getFullYear())) {
    errors.year = 'L\'any ha de ser vàlid';
  }
  if (data.duration && data.duration < 0) {
    errors.duration = 'La duració no pot ser negativa';
  }
  if (data.rating && (data.rating < 0 || data.rating > 5)) {
    errors.rating = 'La valoració ha d\'estar entre 0 i 5';
  }
  return errors;
}

// Ruta de benvinguda
app.get('/', (req, res) => {
  res.json({
    message: 'Benvingut a l\'API del Gestor de Música',
    version: '1.0.0',
    endpoints: ['/api/songs', '/api/genres', '/api/artists', '/api/favorites', '/api/stats']
  });
});

// Llista de cançons
app.get('/api/songs', async (req, res) => {
  try {
    const { search, genre, artist, sortBy = 'title', order = 'asc', page = 1, limit = 10 } = req.query;
    const query = {};

    // Cerca
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtres
    if (genre) query.genre = genre;
    if (artist) query.artist = artist;

    // Ordenació
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    // Paginació
    const skip = (page - 1) * limit;
    const songs = await Song.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Song.countDocuments(query);

    res.json({
      songs,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al llistar cançons: ' + error.message });
  }
});

// Obtenir cançó per ID
app.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Cançó no trobada' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir cançó: ' + error.message });
  }
});

// Crear cançó
app.post('/api/songs', async (req, res) => {
  try {
    const errors = validateSong(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const song = new Song({
      title: req.body.title,
      artist: req.body.artist,
      album: req.body.album || '',
      year: req.body.year || null,
      genre: req.body.genre,
      duration: req.body.duration || null,
      rating: req.body.rating || 0,
      tags: req.body.tags || [],
      isFavorite: req.body.isFavorite || false
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cançó: ' + error.message });
  }
});

// Actualitzar cançó
app.put('/api/songs/:id', async (req, res) => {
  try {
    const errors = validateSong(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        artist: req.body.artist,
        album: req.body.album || '',
        year: req.body.year || null,
        genre: req.body.genre,
        duration: req.body.duration || null,
        rating: req.body.rating || 0,
        tags: req.body.tags || [],
        isFavorite: req.body.isFavorite || false
      },
      { new: true, runValidators: true }
    );

    if (!song) {
      return res.status(404).json({ error: 'Cançó no trobada' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualitzar cançó: ' + error.message });
  }
});

// Eliminar cançó
app.delete('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Cançó no trobada' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cançó: ' + error.message });
  }
});

// Llista de gèneres
app.get('/api/genres', async (req, res) => {
  try {
    const genres = ['Pop', 'Rock', 'Jazz', 'Clàssica', 'Electrònica', 'Altres'];
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Error al llistar gèneres: ' + error.message });
  }
});

// Llista d'artistes
app.get('/api/artists', async (req, res) => {
  try {
    const artists = await Song.distinct('artist');
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: 'Error al llistar artistes: ' + error.message });
  }
});

// Llista de favorites
app.get('/api/favorites', async (req, res) => {
  try {
    const songs = await Song.find({ isFavorite: true });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Error al llistar favorites: ' + error.message });
  }
});

// Canviar estat de favorita
app.put('/api/songs/:id/favorite', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Cançó no trobada' });
    }
    song.isFavorite = !song.isFavorite;
    await song.save();
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Error al canviar favorita: ' + error.message });
  }
});

// Estadístiques
app.get('/api/stats', async (req, res) => {
  try {
    const totalSongs = await Song.countDocuments();
    const genresCount = await Song.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } }
    ]);
    const favoriteCount = await Song.countDocuments({ isFavorite: true });
    res.json({
      totalSongs,
      genres: genresCount,
      favoriteCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir estadístiques: ' + error.message });
  }
});

// Gestió d'errors 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no trobada' });
});

// Gestió d'errors globals
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  res.status(500).json({ error: 'Error intern del servidor: ' + err.message });
});

// Inici del servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciat a http://localhost:${PORT}`);
});

// Tancament elegant
process.on('SIGTERM', () => {
  console.log('Rebut SIGTERM. Tancant servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Connexió a MongoDB tancada');
      process.exit(0);
    });
  });
});