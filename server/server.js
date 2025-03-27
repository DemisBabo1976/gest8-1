const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Carica le variabili d'ambiente
dotenv.config();

// Inizializza l'app Express
const app = express();

// Configurazione CORS più permissiva per lo sviluppo
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware per parsing del body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurazione directory file statici
app.use(express.static(path.join(__dirname, 'public')));

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gest8', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connessione a MongoDB stabilita con successo'))
.catch(err => console.error('Errore di connessione a MongoDB:', err));

// Importa le rotte
const clientiRoutes = require('./routes/clienti/clientiRoutes');

// Usa le rotte
app.use('/api/clienti', clientiRoutes);

// Gestore errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Definizione porta
const PORT = process.env.PORT || 5000;

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});