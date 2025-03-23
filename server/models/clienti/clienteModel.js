const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome è obbligatorio'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'Il numero di telefono è obbligatorio'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Inserisci un indirizzo email valido']
  },
  indirizzo: {
    type: String,
    trim: true
  },
  badge: {
    type: String,
    enum: ['bronzo', 'argento', 'oro', 'vip'],
    default: 'bronzo'
  },
  punti: {
    type: Number,
    default: 0
  },
  dataRegistrazione: {
    type: Date,
    default: Date.now
  },
  ultimoOrdine: {
    type: Date
  },
  note: {
    type: String,
    trim: true
  },
  ordiniTotali: {
    type: Number,
    default: 0
  },
  spesaTotale: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cliente', clienteSchema);