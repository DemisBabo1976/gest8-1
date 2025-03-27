const Ordine = require('../../models/ordini/ordineModel');
const ConfigurazioneOrari = require('../../models/ordini/configurazioneOrariModel');

// @desc    Ottieni tutti gli ordini
// @route   GET /api/ordini
// @access  Private
exports.getOrdini = async (req, res) => {
  try {
    // Parametri di filtro opzionali
    const filtri = {};
    
    // Filtraggio per data
    if (req.query.data) {
      const dataRichiesta = new Date(req.query.data);
      const dataInizio = new Date(dataRichiesta);
      dataInizio.setHours(0, 0, 0, 0);
      
      const dataFine = new Date(dataRichiesta);
      dataFine.setHours(23, 59, 59, 999);
      
      filtri.data = { $gte: dataInizio, $lte: dataFine };
    }
    
    // Filtraggio per stato
    if (req.query.stato && req.query.stato !== 'tutti') {
      filtri.stato = req.query.stato;
    }
    
    // Filtraggio per tipo
    if (req.query.tipo && req.query.tipo !== 'tutti') {
      filtri.tipo = req.query.tipo;
    }
    
    // Filtraggio per cliente (ricerca testuale)
    if (req.query.cliente) {
      filtri.$or = [
        { clienteNome: { $regex: req.query.cliente, $options: 'i' } },
        { clienteTelefono: { $regex: req.query.cliente, $options: 'i' } }
      ];
    }
    
    // Opzioni di paginazione
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Opzioni di ordinamento
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Ordinamento predefinito per data e orario
      sort.data = -1;
      sort.orario = 1;
    }
    
    // Esegui la query
    const ordini = await Ordine.find(filtri)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Conta il totale per la paginazione
    const total = await Ordine.countDocuments(filtri);
    
    res.status(200).json({
      success: true,
      count: ordini.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: ordini
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli ordini',
      error: error.message
    });
  }
};

// @desc    Ottieni un singolo ordine
// @route   GET /api/ordini/:id
// @access  Private
exports.getOrdine = async (req, res) => {
  try {
    const ordine = await Ordine.findById(req.params.id);
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: `Ordine con ID ${req.params.id} non trovato`
      });
    }
    
    res.status(200).json({
      success: true,
      data: ordine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'ordine',
      error: error.message
    });
  }
};

// @desc    Crea un nuovo ordine
// @route   POST /api/ordini
// @access  Private
exports.createOrdine = async (req, res) => {
  try {
    const {
      clienteNome, clienteTelefono, data, orario, 
      tipo, indirizzo, articoli, note
    } = req.body;
    
    // Controllo se c'è posto nello slot richiesto
    const dataRichiesta = new Date(data);
    const giornoJS = dataRichiesta.getDay();
    const giorno = giornoJS === 0 ? 6 : giornoJS - 1;
    
    // Recupera la configurazione per il giorno
    const configurazione = await ConfigurazioneOrari.findOne({ giorno });
    
    if (!configurazione) {
      return res.status(400).json({
        success: false,
        message: 'Configurazione non trovata per il giorno richiesto'
      });
    }
    
    if (!configurazione.aperto) {
      return res.status(400).json({
        success: false,
        message: 'Impossibile creare un ordine in un giorno di chiusura'
      });
    }
    
    // Verifica se l'orario richiesto rientra in un turno
    const [oraOrdine, minOrdine] = orario.split(':').map(Number);
    let inTurno = false;
    
    for (const turno of configurazione.turni) {
      const [oraApertura, minApertura] = turno.apertura.split(':').map(Number);
      const [oraChiusura, minChiusura] = turno.chiusura.split(':').map(Number);
      
      const orarioOrdine = oraOrdine * 60 + minOrdine;
      const orarioApertura = oraApertura * 60 + minApertura;
      const orarioChiusura = oraChiusura * 60 + minChiusura;
      
      if (orarioOrdine >= orarioApertura && orarioOrdine < orarioChiusura) {
        inTurno = true;
        break;
      }
    }
    
    if (!inTurno) {
      return res.status(400).json({
        success: false,
        message: 'L\'orario richiesto non rientra in nessun turno di lavoro'
      });
    }
    
    // Conta gli ordini esistenti per questo slot
    const dataFormattata = dataRichiesta.toISOString().split('T')[0];
    const countOrdini = await Ordine.countDocuments({
      data: { $gte: new Date(dataFormattata), $lt: new Date(dataFormattata + 'T23:59:59.999Z') },
      orario,
      stato: { $ne: 'annullato' }
    });
    
    // Verifica se lo slot è pieno
    if (countOrdini >= configurazione.capacitaSlot && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: 'Slot orario completo. Utilizzare ?force=true per forzare l\'inserimento',
        isCompleto: true
      });
    }
    
    // Calcola il totale dell'ordine
    const totale = articoli.reduce((sum, item) => sum + (item.prezzo * item.quantita), 0);
    
    // Crea il nuovo ordine
    const nuovoOrdine = await Ordine.create({
      clienteNome,
      clienteTelefono,
      data: dataRichiesta,
      orario,
      tipo,
      indirizzo,
      articoli,
      totale,
      note,
      stato: 'confermato'
    });
    
    res.status(201).json({
      success: true,
      data: nuovoOrdine,
      message: 'Ordine creato con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione dell\'ordine',
      error: error.message
    });
  }
};

// @desc    Aggiorna un ordine esistente
// @route   PUT /api/ordini/:id
// @access  Private
exports.updateOrdine = async (req, res) => {
  try {
    const ordine = await Ordine.findById(req.params.id);
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: `Ordine con ID ${req.params.id} non trovato`
      });
    }
    
    // Aggiorna i campi dell'ordine
    const campiAggiornabili = [
      'clienteNome', 'clienteTelefono', 'data', 'orario', 
      'tipo', 'indirizzo', 'articoli', 'note', 'stato'
    ];
    
    // Se l'orario o la data vengono modificati, verifica la disponibilità
    if ((req.body.data && req.body.data !== ordine.data.toISOString().split('T')[0]) || 
        (req.body.orario && req.body.orario !== ordine.orario)) {
      
      const dataRichiesta = req.body.data ? new Date(req.body.data) : ordine.data;
      const orarioRichiesto = req.body.orario || ordine.orario;
      
      const giornoJS = dataRichiesta.getDay();
      const giorno = giornoJS === 0 ? 6 : giornoJS - 1;
      
      // Recupera la configurazione per il giorno
      const configurazione = await ConfigurazioneOrari.findOne({ giorno });
      
      if (!configurazione || !configurazione.aperto) {
        return res.status(400).json({
          success: false,
          message: 'La nuova data scelta è un giorno di chiusura'
        });
      }
      
      // Verifica se l'orario richiesto rientra in un turno
      const [oraOrdine, minOrdine] = orarioRichiesto.split(':').map(Number);
      let inTurno = false;
      
      for (const turno of configurazione.turni) {
        const [oraApertura, minApertura] = turno.apertura.split(':').map(Number);
        const [oraChiusura, minChiusura] = turno.chiusura.split(':').map(Number);
        
        const orarioOrdine = oraOrdine * 60 + minOrdine;
        const orarioApertura = oraApertura * 60 + minApertura;
        const orarioChiusura = oraChiusura * 60 + minChiusura;
        
        if (orarioOrdine >= orarioApertura && orarioOrdine < orarioChiusura) {
          inTurno = true;
          break;
        }
      }
      
      if (!inTurno) {
        return res.status(400).json({
          success: false,
          message: 'Il nuovo orario richiesto non rientra in nessun turno di lavoro'
        });
      }
      
      // Conta gli ordini esistenti per questo slot (escludendo l'ordine corrente)
      const dataFormattata = dataRichiesta.toISOString().split('T')[0];
      const countOrdini = await Ordine.countDocuments({
        _id: { $ne: req.params.id },
        data: { $gte: new Date(dataFormattata), $lt: new Date(dataFormattata + 'T23:59:59.999Z') },
        orario: orarioRichiesto,
        stato: { $ne: 'annullato' }
      });
      
      // Verifica se lo slot è pieno
      if (countOrdini >= configurazione.capacitaSlot && !req.query.force) {
        return res.status(400).json({
          success: false,
          message: 'Il nuovo slot orario è completo. Utilizzare ?force=true per forzare la modifica',
          isCompleto: true
        });
      }
    }
    
    // Aggiorna i campi specificati
    for (const campo of campiAggiornabili) {
      if (req.body[campo] !== undefined) {
        ordine[campo] = req.body[campo];
      }
    }
    
    // Se vengono aggiornati gli articoli, ricalcola il totale
    if (req.body.articoli) {
      ordine.totale = req.body.articoli.reduce((sum, item) => sum + (item.prezzo * item.quantita), 0);
    }
    
    // Salva le modifiche
    await ordine.save();
    
    res.status(200).json({
      success: true,
      data: ordine,
      message: 'Ordine aggiornato con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'ordine',
      error: error.message
    });
  }
};

// @desc    Aggiorna lo stato di un ordine
// @route   PATCH /api/ordini/:id/stato
// @access  Private
exports.updateStatoOrdine = async (req, res) => {
  try {
    const { stato } = req.body;
    
    if (!stato) {
      return res.status(400).json({
        success: false,
        message: 'Il campo stato è obbligatorio'
      });
    }
    
    // Verifica che lo stato sia valido
    const statiValidi = ['confermato', 'in preparazione', 'completato', 'annullato'];
    if (!statiValidi.includes(stato)) {
      return res.status(400).json({
        success: false,
        message: `Stato non valido. Valori consentiti: ${statiValidi.join(', ')}`
      });
    }
    
    const ordine = await Ordine.findById(req.params.id);
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: `Ordine con ID ${req.params.id} non trovato`
      });
    }
    
    // Aggiorna lo stato
    ordine.stato = stato;
    await ordine.save();
    
    res.status(200).json({
      success: true,
      data: ordine,
      message: 'Stato dell\'ordine aggiornato con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dello stato dell\'ordine',
      error: error.message
    });
  }
};

// @desc    Elimina un ordine
// @route   DELETE /api/ordini/:id
// @access  Private
exports.deleteOrdine = async (req, res) => {
  try {
    const ordine = await Ordine.findById(req.params.id);
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: `Ordine con ID ${req.params.id} non trovato`
      });
    }
    
    // Elimina l'ordine
    await Ordine.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Ordine eliminato con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione dell\'ordine',
      error: error.message
    });
  }
};

// @desc    Ottieni statistiche sugli ordini
// @route   GET /api/ordini/statistiche/riassunto
// @access  Private
exports.getStatisticheOrdini = async (req, res) => {
  try {
    // Parametri di filtro opzionali
    const filtri = {};
    
    // Filtraggio per data
    if (req.query.data) {
      const dataRichiesta = new Date(req.query.data);
      const dataInizio = new Date(dataRichiesta);
      dataInizio.setHours(0, 0, 0, 0);
      
      const dataFine = new Date(dataRichiesta);
      dataFine.setHours(23, 59, 59, 999);
      
      filtri.data = { $gte: dataInizio, $lte: dataFine };
    }
    
    // Calcola conteggi per tipo di ordine
    const conteggiPerTipo = await Ordine.aggregate([
      { $match: filtri },
      { $group: { _id: '$tipo', count: { $sum: 1 } } }
    ]);
    
    // Calcola conteggi per stato
    const conteggiPerStato = await Ordine.aggregate([
      { $match: filtri },
      { $group: { _id: '$stato', count: { $sum: 1 } } }
    ]);
    
    // Calcola l'incasso totale
    const incassoTotale = await Ordine.aggregate([
      { $match: { ...filtri, stato: { $ne: 'annullato' } } },
      { $group: { _id: null, totale: { $sum: '$totale' } } }
    ]);
    
    // Formatta i risultati
    const tipiOrdineCounts = {
      asporto: 0,
      consegna: 0,
      ritiro: 0
    };
    
    conteggiPerTipo.forEach(item => {
      tipiOrdineCounts[item._id] = item.count;
    });
    
    const statiCounts = {
      confermato: 0,
      'in preparazione': 0,
      completato: 0,
      annullato: 0
    };
    
    conteggiPerStato.forEach(item => {
      statiCounts[item._id] = item.count;
    });
    
    // Conta totale ordini non annullati
    const totaleOrdini = Object.values(statiCounts).reduce((sum, count) => sum + count, 0) - (statiCounts.annullato || 0);
    
    res.status(200).json({
      success: true,
      data: {
        totaleOrdini,
        tipiOrdine: tipiOrdineCounts,
        stati: statiCounts,
        incassoTotale: incassoTotale.length > 0 ? incassoTotale[0].totale : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche',
      error: error.message
    });
  }
};
// ... Qui continua da dove è stato troncato

// @desc    Ottieni festività
// @route   GET /api/ordini/festivita
// @access  Private
exports.getFestivita = async (req, res) => {
  try {
    // Recupera tutte le configurazioni
    const configurazioni = await ConfigurazioneOrari.find();
    
    // Estrai le festività da tutte le configurazioni
    const festivita = [];
    
    // Estrai le date festive specifiche
    if (configurazioni.length > 0) {
      // Estrai eventuali festività globali dal primo documento di configurazione
      const configPrincipale = configurazioni[0];
      if (configPrincipale.festivita && Array.isArray(configPrincipale.festivita)) {
        festivita.push(...configPrincipale.festivita);
      }
    }
    
    res.status(200).json({
      success: true,
      data: festivita
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle festività',
      error: error.message
    });
  }
};

// @desc    Aggiungi festività
// @route   POST /api/ordini/festivita
// @access  Private
exports.addFestivita = async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'La data della festività è obbligatoria'
      });
    }
    
    // Verifica il formato della data (YYYY-MM-DD)
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexData.test(data)) {
      return res.status(400).json({
        success: false,
        message: 'Formato data non valido. Usa YYYY-MM-DD'
      });
    }
    
    // Recupera la configurazione principale
    let configPrincipale = await ConfigurazioneOrari.findOne();
    
    if (!configPrincipale) {
      // Se non esiste, crea una configurazione di base
      const giorniSettimana = [
        'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
      ];
      
      configPrincipale = await ConfigurazioneOrari.create({
        giorno: 0,
        nomeGiorno: giorniSettimana[0],
        aperto: true,
        intervalloSlot: 10,
        capacitaSlot: 5,
        turni: [
          { apertura: '12:00', chiusura: '15:00' },
          { apertura: '18:00', chiusura: '23:00' }
        ],
        festivita: [data] // Aggiungi subito la nuova festività
      });
    } else {
      // Verifica se la data è già presente
      if (!configPrincipale.festivita) {
        configPrincipale.festivita = [];
      }
      
      if (configPrincipale.festivita.includes(data)) {
        return res.status(400).json({
          success: false,
          message: 'Questa data è già impostata come festività'
        });
      }
      
      // Aggiungi la nuova festività
      configPrincipale.festivita.push(data);
      await configPrincipale.save();
    }
    
    res.status(201).json({
      success: true,
      data: configPrincipale.festivita,
      message: 'Festività aggiunta con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiunta della festività',
      error: error.message
    });
  }
};

// @desc    Rimuovi festività
// @route   DELETE /api/ordini/festivita/:data
// @access  Private
exports.deleteFestivita = async (req, res) => {
  try {
    const dataFestivita = req.params.data;
    
    // Verifica il formato della data (YYYY-MM-DD)
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexData.test(dataFestivita)) {
      return res.status(400).json({
        success: false,
        message: 'Formato data non valido. Usa YYYY-MM-DD'
      });
    }
    
    // Recupera la configurazione principale
    const configPrincipale = await ConfigurazioneOrari.findOne();
    
    if (!configPrincipale || !configPrincipale.festivita) {
      return res.status(404).json({
        success: false,
        message: 'Nessuna configurazione o festività trovata'
      });
    }
    
    // Verifica se la data è presente nell'array delle festività
    const index = configPrincipale.festivita.indexOf(dataFestivita);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Festività non trovata'
      });
    }
    
    // Rimuovi la festività
    configPrincipale.festivita.splice(index, 1);
    await configPrincipale.save();
    
    res.status(200).json({
      success: true,
      data: configPrincipale.festivita,
      message: 'Festività rimossa con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nella rimozione della festività',
      error: error.message
    });
  }
};