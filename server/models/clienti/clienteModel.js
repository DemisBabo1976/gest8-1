const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome è obbligatorio'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'Il telefono è obbligatorio'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true // Permette valori nulli unici
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
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cliente', ClienteSchema);