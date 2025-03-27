const mongoose = require('mongoose');

const ConfigurazioneOrdiniSchema = new mongoose.Schema({
  orarioApertura: {
    type: String,
    required: [true, 'L\'orario di apertura è obbligatorio'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:MM)'],
    default: '18:00'
  },
  
  orarioChiusura: {
    type: String,
    required: [true, 'L\'orario di chiusura è obbligatorio'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:MM)'],
    default: '22:00'
  },
  
  intervalloSlot: {
    type: Number,
    required: [true, 'L\'intervallo tra gli slot è obbligatorio'],
    min: [5, 'L\'intervallo minimo è di 5 minuti'],
    max: [60, 'L\'intervallo massimo è di 60 minuti'],
    enum: [5, 10, 15, 20, 30, 60],
    default: 10
  },
  
  maxOrdiniPerSlot: {
    type: Number,
    required: [true, 'Il numero massimo di ordini per slot è obbligatorio'],
    min: [1, 'Deve essere almeno 1 ordine per slot'],
    max: [50, 'Non più di 50 ordini per slot'],
    default: 5
  },
  
  giornoChiusura: {
    type: Number,
    required: [true, 'Il giorno di chiusura è obbligatorio'],
    min: [0, 'Il valore deve essere compreso tra 0 (Domenica) e 6 (Sabato)'],
    max: [6, 'Il valore deve essere compreso tra 0 (Domenica) e 6 (Sabato)'],
    default: 1  // 1 = Lunedì
  },
  
  festivita: {
    type: [String],
    validate: {
      validator: function(v) {
        // Valida il formato data YYYY-MM-DD
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return v.every(data => regex.test(data));
      },
      message: 'Le date devono essere nel formato YYYY-MM-DD'
    },
    default: []
  },
  
  attivo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Metodo statico per ottenere la configurazione attiva
ConfigurazioneOrdiniSchema.statics.getConfigurazioneAttiva = async function() {
  const configurazione = await this.findOne({ attivo: true }).sort({ updatedAt: -1 });
  
  // Se non esiste, crea una configurazione predefinita
  if (!configurazione) {
    return this.create({
      orarioApertura: '18:00',
      orarioChiusura: '22:00',
      intervalloSlot: 10,
      maxOrdiniPerSlot: 5,
      giornoChiusura: 1,
      festivita: [],
      attivo: true
    });
  }
  
  return configurazione;
};

// Metodo per generare gli slot orari in base alla configurazione
ConfigurazioneOrdiniSchema.methods.generaSlotOrari = function(data = new Date()) {
  const slots = [];
  const [oraApertura, minApertura] = this.orarioApertura.split(':').map(Number);
  const [oraChiusura, minChiusura] = this.orarioChiusura.split(':').map(Number);
  
  const dataInizio = new Date(data);
  dataInizio.setHours(oraApertura, minApertura, 0);
  
  const dataFine = new Date(data);
  dataFine.setHours(oraChiusura, minChiusura, 0);
  
  // Verifica se è il giorno di chiusura
  const isGiornoChiusura = data.getDay() === this.giornoChiusura;
  
  // Verifica se è una festività
  const dataFormattata = data.toISOString().split('T')[0];
  const isFestivo = this.festivita.includes(dataFormattata);
  
  let slotCorrente = new Date(dataInizio);
  
  while (slotCorrente < dataFine) {
    const oraSlot = slotCorrente.getHours().toString().padStart(2, '0');
    const minSlot = slotCorrente.getMinutes().toString().padStart(2, '0');
    const orarioSlot = `${oraSlot}:${minSlot}`;
    
    slots.push({
      orario: orarioSlot,
      data: new Date(slotCorrente),
      ordiniOccupati: 0, // Da popolara con i dati reali
      maxOrdini: this.maxOrdiniPerSlot,
      isCompleto: false, // Da calcolare
      isGiornoChiusura,
      isFestivo
    });
    
    // Incrementa lo slot corrente
    slotCorrente.setMinutes(slotCorrente.getMinutes() + this.intervalloSlot);
  }
  
  return {
    slots,
    data: data,
    isGiornoChiusura,
    isFestivo,
    message: isGiornoChiusura ? 'Giorno di chiusura' : (isFestivo ? 'Giorno festivo' : '')
  };
};

module.exports = mongoose.model('ConfigurazioneOrdini', ConfigurazioneOrdiniSchema);