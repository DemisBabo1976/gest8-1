const mongoose = require('mongoose');

/**
 * Schema per le campagne di fedeltà
 * Gestisce i diversi tipi di campagne promozionali
 */
const campagnaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome della campagna è obbligatorio'],
    trim: true
  },
  tipo: {
    type: String,
    enum: ['whatsapp', 'social', 'webapp', 'email', 'altro'],
    default: 'altro'
  },
  descrizione: {
    type: String,
    trim: true
  },
  dataInizio: {
    type: Date,
    default: Date.now
  },
  dataFine: {
    type: Date
  },
  attiva: {
    type: Boolean,
    default: true
  },
  contattiRaggiunti: {
    type: Number,
    default: 0
  },
  obiettivo: {
    type: Number,
    default: 0
  },
  messaggioPromo: {
    type: String,
    trim: true
  }
}, { timestamps: true });

/**
 * Schema per le regole dei badge clienti
 * Definisce le regole per assegnare i badge ai clienti
 */
const regolaBadgeSchema = new mongoose.Schema({
  badge: {
    type: String,
    enum: ['bronzo', 'argento', 'oro', 'vip'],
    required: true
  },
  puntiNecessari: {
    type: Number,
    required: true
  },
  scontoAssociato: {
    type: Number,
    default: 0
  },
  descrizione: {
    type: String,
    trim: true
  }
});

/**
 * Schema principale per il programma fedeltà
 */
const fedeltaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome del programma è obbligatorio'],
    default: 'Programma Fedeltà',
    trim: true
  },
  descrizione: {
    type: String,
    trim: true
  },
  attivo: {
    type: Boolean,
    default: true
  },
  puntiTotali: {
    type: Number,
    default: 0
  },
  regolePunti: {
    euroPerPunto: { type: Number, default: 1 },
    puntiExtra: { type: Boolean, default: false },
    puntiCompleanno: { type: Number, default: 0 },
    puntiRegistrazione: { type: Number, default: 0 }
  },
  regoleBadge: [regolaBadgeSchema],
  campagneAttive: [campagnaSchema],
  promozioneAttuale: {
    nome: { type: String, trim: true },
    descrizione: { type: String, trim: true },
    attiva: { type: Boolean, default: false },
    dataInizio: { type: Date },
    dataFine: { type: Date }
  },
  ultimaModifica: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Inizializza con valori di default se è il primo documento
fedeltaSchema.pre('save', async function(next) {
  if (this.isNew && this.regoleBadge.length === 0) {
    this.regoleBadge = [
      { badge: 'bronzo', puntiNecessari: 0, scontoAssociato: 0, descrizione: 'Badge iniziale' },
      { badge: 'argento', puntiNecessari: 100, scontoAssociato: 5, descrizione: 'Badge fedeltà base' },
      { badge: 'oro', puntiNecessari: 300, scontoAssociato: 10, descrizione: 'Badge fedeltà premium' },
      { badge: 'vip', puntiNecessari: 600, scontoAssociato: 15, descrizione: 'Badge cliente VIP' }
    ];
  }
  next();
});

module.exports = mongoose.model('Fedelta', fedeltaSchema);