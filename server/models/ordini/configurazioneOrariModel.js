const mongoose = require('mongoose');

// Schema per i turni di lavoro
const TurnoSchema = new mongoose.Schema({
  apertura: {
    type: String,
    required: [true, 'L\'orario di apertura è obbligatorio'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:MM)']
  },
  chiusura: {
    type: String,
    required: [true, 'L\'orario di chiusura è obbligatorio'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato orario non valido (HH:MM)']
  }
});

// Schema per la configurazione degli orari
const ConfigurazioneOrariSchema = new mongoose.Schema({
  giorno: {
    type: Number,
    required: true,
    min: 0, // 0 = Lunedì
    max: 6, // 6 = Domenica
    unique: true
  },
  nomeGiorno: {
    type: String,
    required: true,
    enum: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
  },
  aperto: {
    type: Boolean,
    default: true
  },
  intervalloSlot: {
    type: Number,
    required: true,
    enum: [5, 10, 15, 20, 30, 60],
    default: 10
  },
  capacitaSlot: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
    default: 5
  },
  turni: {
    type: [TurnoSchema],
    default: []
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
  }
}, {
  timestamps: true
});

// Metodo statico per ottenere la configurazione di un giorno specifico
ConfigurazioneOrariSchema.statics.getConfigurazionePerGiorno = async function(giorno) {
  const configurazione = await this.findOne({ giorno });
  
  if (!configurazione) {
    const giorniSettimana = [
      'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
    ];
    
    return this.create({
      giorno,
      nomeGiorno: giorniSettimana[giorno],
      aperto: giorno < 5, // Aperto da lunedì a venerdì, chiuso sabato e domenica
      intervalloSlot: 10,
      capacitaSlot: 5,
      turni: giorno < 5 ? [
        { apertura: '12:00', chiusura: '15:00' },
        { apertura: '18:00', chiusura: '23:00' }
      ] : []
    });
  }
  
  return configurazione;
};

// Metodo per verificare se una data è una festività
ConfigurazioneOrariSchema.statics.isFestivita = async function(data) {
  const dataFormattata = data instanceof Date 
    ? data.toISOString().split('T')[0]
    : new Date(data).toISOString().split('T')[0];
  
  const configurazione = await this.findOne({ festivita: dataFormattata });
  return !!configurazione;
};

// Metodo per generare gli slot orari di un giorno
ConfigurazioneOrariSchema.methods.generaSlotOrari = function(data = new Date()) {
  if (!this.aperto || this.turni.length === 0) {
    return {
      slots: [],
      data,
      aperto: false,
      message: 'Giorno di chiusura'
    };
  }
  
  const slots = [];
  
  // Per ogni turno, genera gli slot
  for (const turno of this.turni) {
    const [oraApertura, minApertura] = turno.apertura.split(':').map(Number);
    const [oraChiusura, minChiusura] = turno.chiusura.split(':').map(Number);
    
    const dataInizio = new Date(data);
    dataInizio.setHours(oraApertura, minApertura, 0, 0);
    
    const dataFine = new Date(data);
    dataFine.setHours(oraChiusura, minChiusura, 0, 0);
    
    let slotCorrente = new Date(dataInizio);
    
    while (slotCorrente < dataFine) {
      const oraSlot = slotCorrente.getHours().toString().padStart(2, '0');
      const minSlot = slotCorrente.getMinutes().toString().padStart(2, '0');
      const orarioSlot = `${oraSlot}:${minSlot}`;
      
      slots.push({
        orario: orarioSlot,
        data: new Date(slotCorrente),
        ordiniOccupati: 0, // Da popolare con i dati reali
        maxOrdini: this.capacitaSlot,
        isCompleto: false // Da calcolare
      });
      
      // Incrementa lo slot corrente
      slotCorrente.setMinutes(slotCorrente.getMinutes() + this.intervalloSlot);
    }
  }
  
  return {
    slots,
    data,
    aperto: true,
    intervalloSlot: this.intervalloSlot,
    capacitaSlot: this.capacitaSlot,
    turni: this.turni
  };
};

module.exports = mongoose.model('ConfigurazioneOrari', ConfigurazioneOrariSchema);