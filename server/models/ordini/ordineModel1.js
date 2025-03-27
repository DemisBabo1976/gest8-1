const mongoose = require('mongoose');

const elementoOrdineSchema = new mongoose.Schema({
  prodotto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prodotto',
    required: [true, 'Il riferimento al prodotto è obbligatorio']
  },
  nome: {
    type: String,
    required: [true, 'Il nome del prodotto è obbligatorio']
  },
  quantita: {
    type: Number,
    required: [true, 'La quantità è obbligatoria'],
    min: [1, 'La quantità minima è 1']
  },
  prezzo: {
    type: Number,
    required: [true, 'Il prezzo è obbligatorio'],
    min: [0, 'Il prezzo non può essere negativo']
  },
  note: {
    type: String,
    trim: true
  },
  // In caso di varianti o modifiche al prodotto standard
  modifiche: [{
    tipo: String,
    descrizione: String,
    prezzo: Number
  }]
});

const ordineSchema = new mongoose.Schema({
  numeroOrdine: {
    type: String,
    required: [true, 'Il numero ordine è obbligatorio'],
    unique: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    // Non obbligatorio per ordini anonimi
  },
  nomeCliente: {
    type: String,
    trim: true,
    default: 'Cliente anonimo'
  },
  telefono: {
    type: String,
    trim: true
  },
  elementi: [elementoOrdineSchema],
  tipo: {
    type: String,
    enum: ['asporto', 'consegna', 'tavolo'],
    default: 'asporto'
  },
  stato: {
    type: String,
    enum: ['nuovo', 'in preparazione', 'pronto', 'in consegna', 'consegnato', 'annullato'],
    default: 'nuovo'
  },
  indirizzoConsegna: {
    via: String,
    civico: String,
    citta: String,
    cap: String,
    note: String
  },
  numeroTavolo: {
    type: Number,
    min: [0, 'Il numero del tavolo non può essere negativo']
  },
  orarioRichiesto: {
    type: Date
  },
  metodoPagamento: {
    type: String,
    enum: ['contanti', 'carta', 'online', 'non specificato'],
    default: 'non specificato'
  },
  costoConsegna: {
    type: Number,
    default: 0,
    min: [0, 'Il costo di consegna non può essere negativo']
  },
  sconto: {
    type: Number,
    default: 0,
    min: [0, 'Lo sconto non può essere negativo']
  },
  note: {
    type: String,
    trim: true
  },
  totale: {
    type: Number,
    required: [true, 'Il totale è obbligatorio'],
    min: [0, 'Il totale non può essere negativo']
  },
  rider: {
    type: String,
    trim: true
  },
  puntiFedelta: {
    type: Number,
    default: 0,
    min: [0, 'I punti fedeltà non possono essere negativi']
  },
  tempoPreparazione: {
    type: Number, // In minuti
    default: 0
  }
}, {
  timestamps: true, // Aggiunge automaticamente createdAt e updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
ordineSchema.virtual('totaleElementi').get(function() {
  return this.elementi.reduce((sum, elemento) => sum + elemento.quantita, 0);
});

ordineSchema.virtual('tempoStimato').get(function() {
  // Calcola il tempo stimato in base ai tempi di preparazione dei prodotti
  const tempoBase = 15; // Tempo base in minuti
  const tempoPerElemento = 2; // Tempo aggiuntivo per elemento
  
  return tempoBase + (this.totaleElementi * tempoPerElemento);
});

// Metodi statici
ordineSchema.statics.generaNumeroOrdine = async function() {
  const oggi = new Date();
  const anno = oggi.getFullYear().toString().slice(-2);
  const mese = (oggi.getMonth() + 1).toString().padStart(2, '0');
  const giorno = oggi.getDate().toString().padStart(2, '0');
  const prefisso = `${anno}${mese}${giorno}`;
  
  // Trova l'ultimo ordine del giorno
  const ultimoOrdine = await this.findOne(
    { numeroOrdine: new RegExp(`^${prefisso}`) },
    { numeroOrdine: 1 },
    { sort: { numeroOrdine: -1 } }
  );
  
  let numero = 1;
  if (ultimoOrdine) {
    const ultimoNumero = parseInt(ultimoOrdine.numeroOrdine.slice(-3));
    numero = ultimoNumero + 1;
  }
  
  return `${prefisso}-${numero.toString().padStart(3, '0')}`;
};

module.exports = mongoose.model('Ordine', ordineSchema);