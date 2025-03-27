// Modifica ordineModel.js
const mongoose = require('mongoose');

// Schema per gli articoli dell'ordine
const ArticoloSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome dell\'articolo è obbligatorio'],
    trim: true
  },
  quantita: {
    type: Number,
    required: [true, 'La quantità è obbligatoria'],
    min: [1, 'La quantità deve essere almeno 1']
  },
  prezzo: {
    type: Number,
    required: [true, 'Il prezzo è obbligatorio'],
    min: [0, 'Il prezzo non può essere negativo']
  }
});

// Schema per gli ordini
const OrdineSchema = new mongoose.Schema({
  // Aggiungi il riferimento al cliente
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente'
  },
  clienteNome: {
    type: String,
    required: [true, 'Il nome del cliente è obbligatorio'],
    trim: true
  },
  clienteTelefono: {
    type: String,
    required: [true, 'Il telefono del cliente è obbligatorio'],
    trim: true
  },
  data: {
    type: Date,
    required: [true, 'La data dell\'ordine è obbligatoria'],
    default: Date.now
  },
  orario: {
    type: String,
    required: [true, 'L\'orario dell\'ordine è obbligatorio'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:MM)']
  },
  stato: {
    type: String,
    enum: {
      values: ['confermato', 'in preparazione', 'completato', 'annullato'],
      message: 'Stato non valido: {VALUE}'
    },
    default: 'confermato'
  },
  tipo: {
    type: String,
    enum: {
      values: ['asporto', 'consegna', 'ritiro'],
      message: 'Tipo non valido: {VALUE}'
    },
    required: [true, 'Il tipo di ordine è obbligatorio']
  },
  indirizzo: {
    type: String,
    required: [
      function() { return this.tipo === 'consegna'; },
      'L\'indirizzo è obbligatorio per gli ordini con consegna'
    ],
    trim: true
  },
  articoli: {
    type: [ArticoloSchema],
    required: [true, 'L\'ordine deve contenere almeno un articolo'],
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'L\'ordine deve contenere almeno un articolo'
    }
  },
  totale: {
    type: Number,
    required: [true, 'Il totale dell\'ordine è obbligatorio'],
    min: [0, 'Il totale non può essere negativo']
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save hook per calcolare automaticamente il totale dell'ordine se non specificato
OrdineSchema.pre('save', function(next) {
  if (!this.totale || this.totale === 0) {
    this.totale = this.articoli.reduce((sum, item) => sum + (item.prezzo * item.quantita), 0);
  }
  next();
});

module.exports = mongoose.model('Ordine', OrdineSchema);