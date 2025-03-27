const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Aggiunto PATCH per supportare updateStatoOrdine
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gest8', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connessione a MongoDB stabilita con successo'))
.catch(err => console.error('Errore di connessione a MongoDB:', err));

// Importazione delle rotte
const clientiRoutes = require('./routes/clienti/clientiRoutes');
const fedeltaRoutes = require('./routes/fedelta/fedeltaRoutes');
const ordiniRoutes = require('./routes/ordini/ordiniRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Configurazione delle rotte API
app.use('/api/clienti', clientiRoutes);
app.use('/api/fedelta', fedeltaRoutes);
app.use('/api/ordini', ordiniRoutes);   // Questa è la rotta che gestisce tutte le operazioni sugli ordini
app.use('/api/dashboard', dashboardRoutes);

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});