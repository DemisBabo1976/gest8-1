const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Carica le variabili d'ambiente
dotenv.config();

// Modello per OrarioConsegna
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

const OrarioConsegna = mongoose.model('OrarioConsegna', orarioConsegnaSchema);

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gest8', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connessione a MongoDB stabilita con successo'))
.catch(err => console.error('Errore di connessione a MongoDB:', err));

// Funzione per creare gli slot orari
const creaSlots = (orarioApertura, orarioChiusura, intervalloSlot) => {
  const slots = [];
  const [oraAperturaHH, oraAperturaMM] = orarioApertura.split(':').map(Number);
  const [oraChiusuraHH, oraChiusuraMM] = orarioChiusura.split(':').map(Number);
  
  let currentHH = oraAperturaHH;
  let currentMM = oraAperturaMM;
  
  while (
    currentHH < oraChiusuraHH || 
    (currentHH === oraChiusuraHH && currentMM < oraChiusuraMM)
  ) {
    slots.push({
      ora: `${currentHH.toString().padStart(2, '0')}:${currentMM.toString().padStart(2, '0')}`,
      capacitaMax: 5,
      ordiniAttuali: 0,
      attivo: true
    });
    
    // Incrementa di intervallo minuti
    currentMM += intervalloSlot;
    if (currentMM >= 60) {
      currentHH += Math.floor(currentMM / 60);
      currentMM %= 60;
    }
  }
  
  return slots;
};

// Inizializza le configurazioni per ogni giorno della settimana
const initOrari = async () => {
  try {
    // Prima rimuovi tutte le configurazioni esistenti
    await OrarioConsegna.deleteMany({});
    
    // Giorni della settimana
    const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    
    for (const giorno of giorni) {
      // Configurazione diversa per il weekend
      const isWeekend = giorno === 'Sabato' || giorno === 'Domenica';
      const orarioApertura = isWeekend ? '12:00' : '18:00';
      const orarioChiusura = isWeekend ? '23:00' : '22:30';
      const intervalloSlot = 15; // 15 minuti tra uno slot e l'altro
      
      // Crea gli slot orari
      const slots = creaSlots(orarioApertura, orarioChiusura, intervalloSlot);
      
      // Crea la configurazione per questo giorno
      await OrarioConsegna.create({
        giorno,
        orarioApertura,
        orarioChiusura,
        intervalloSlot,
        slots,
        attivo: true
      });
      
      console.log(`Configurazione creata per ${giorno}`);
    }
    
    console.log('Inizializzazione fasce orarie completata!');
    process.exit(0);
  } catch (error) {
    console.error('Errore durante l\'inizializzazione:', error);
    process.exit(1);
  }
};

// Esegui l'inizializzazione
initOrari();