const mongoose = require('mongoose');

const prodottoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome del prodotto è obbligatorio'],
    trim: true
  },
  descrizione: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoria è obbligatoria'],
    enum: ['pizza', 'antipasto', 'bevanda', 'dolce', 'contorno', 'altro'],
    default: 'pizza'
  },
  prezzo: {
    type: Number,
    required: [true, 'Il prezzo è obbligatorio'],
    min: [0, 'Il prezzo non può essere negativo']
  },
  immagine: {
    type: String,  // URL o path dell'immagine
    default: ''
  },
  ingredienti: [{
    type: String,
    trim: true
  }],
  attivo: {
    type: Boolean,
    default: true
  },
  inPromozione: {
    type: Boolean,
    default: false
  },
  prezzoPromozione: {
    type: Number,
    min: [0, 'Il prezzo in promozione non può essere negativo']
  },
  tempoPreparazione: {
    type: Number,  // In minuti
    default: 15
  },
  ordinePriorita: {
    type: Number,
    default: 100
  },
  disponibile: {
    type: Boolean,
    default: true
  },
  allergeni: [{
    type: String,
    trim: true
  }],
  vegano: {
    type: Boolean,
    default: false
  },
  vegetariano: {
    type: Boolean,
    default: false
  },
  glutenFree: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prodotto', prodottoSchema);