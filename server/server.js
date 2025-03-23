const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Carica le variabili d'ambiente
dotenv.config();

// Inizializza l'app Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurazione directory file statici
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Assicurati che le directory di upload esistano
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/menu'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, 'public', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};
createUploadDirs();

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gest8', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connessione a MongoDB stabilita con successo'))
.catch(err => console.error('Errore di connessione a MongoDB:', err));

// Importa le rotte
const clientiRoutes = require('./routes/clienti/clientiRoutes');
const prodottiRoutes = require('./routes/menu/prodottiRoutes');
const dashboardRoutes = require('./routes/dashboard');
const fedeltaRoutes = require('./routes/fedelta/fedeltaRoutes');

// Usa le rotte
app.use('/api/clienti', clientiRoutes);
app.use('/api/menu/prodotti', prodottiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fedelta', fedeltaRoutes);

// Rotta base
app.get('/', (req, res) => {
  res.json({ message: 'Benvenuto nell\'API GEST8 per la gestione della pizzeria' });
});

// Gestione errori 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trovato'
  });
});

// Gestione errori generali
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Definizione delle porte
const PORT = process.env.PORT || 5000;

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});