const mongoose = require('mongoose');

const slotOrarioSchema = new mongoose.Schema({
  ora: {
    type: String,
    required: true
  },
  capacitaMax: {
    type: Number,
    default: 5
  },
  ordiniAttuali: {
    type: Number,
    default: 0
  },
  attivo: {
    type: Boolean,
    default: true
  }
});

const orarioConsegnaSchema = new mongoose.Schema({
  giorno: {
    type: String,
    enum: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
    required: true
  },
  orarioApertura: {
    type: String,
    required: true
  },
  orarioChiusura: {
    type: String,
    required: true
  },
  intervalloSlot: {
    type: Number,
    default: 15
  },
  slots: [slotOrarioSchema],
  attivo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrarioConsegna', orarioConsegnaSchema);