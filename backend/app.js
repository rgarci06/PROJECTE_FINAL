const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('./models/Song');

const app = express();
const port = process.env.PORT || 3007;

// Configuración mejorada de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/x-m4a'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos MP3'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Configuración de CORS mejorada
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Conexión a MongoDB con mejores prácticas
mongoose.connect('mongodb://localhost:27017/musicDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Validaciones
const songValidationRules = [
  body('title').trim().notEmpty().withMessage('El título es requerido'),
  body('artist').trim().notEmpty().withMessage('El artista es requerido'),
  body('genre').isIn(['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Reggaeton', 'Other'])
    .withMessage('Género no válido'),
];

// Middleware de manejo de errores
const handleErrors = (err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
};

// Endpoints
app.get('/api/songs', async (req, res, next) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    const songsWithFullUrl = songs.map(song => ({
      ...song.toObject(),
      filePath: `${req.protocol}://${req.get('host')}${song.filePath}`
    }));
    res.json({ songs: songsWithFullUrl });
  } catch (error) {
    next(error);
  }
});

app.post('/api/songs', (req, res, next) => {
  upload.single('mp3File')(req, res, async (err) => {
    try {
      // Manejo de errores de Multer
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
      }

      const { title, artist, genre } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'Archivo MP3 requerido' });
      }

      const newSong = new Song({
        title,
        artist,
        genre,
        filePath: `/uploads/${req.file.filename}`
      });

      await newSong.save();
      
      res.status(201).json({
        ...newSong.toObject(),
        filePath: `${req.protocol}://${req.get('host')}${newSong.filePath}`
      });

    } catch (error) {
      next(error);
    }
  });
});

// Resto de endpoints (GET by ID, PUT, DELETE) con el mismo patrón de mejoras...

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware de errores
app.use(handleErrors);

// Configuración para producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`🎧 Servidor escuchando en http://localhost:${port}`);
});