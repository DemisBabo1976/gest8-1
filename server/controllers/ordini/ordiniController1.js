const Ordine = require('../../models/ordini/ordineModel');
const Cliente = require('../../models/clienti/clienteModel');
const Prodotto = require('../../models/menu/prodottoModel');

/**
 * Recupera tutti gli ordini
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getOrdini = async (req, res) => {
  try {
    const { stato, tipo, data, cliente } = req.query;
    let query = {};
    
    // Filtraggio per stato
    if (stato) {
      query.stato = stato;
    }
    
    // Filtraggio per tipo
    if (tipo) {
      query.tipo = tipo;
    }
    
    // Filtraggio per data
    if (data) {
      const dataInizio = new Date(data);
      dataInizio.setHours(0, 0, 0, 0);
      
      const dataFine = new Date(data);
      dataFine.setHours(23, 59, 59, 999);
      
      query.createdAt = { $gte: dataInizio, $lte: dataFine };
    }
    
    // Filtraggio per cliente
    if (cliente) {
      query.cliente = cliente;
    }
    
    const ordini = await Ordine.find(query)
      .sort({ createdAt: -1 })
      .populate('cliente', 'nome cognome telefono email punti')
      .populate('elementi.prodotto', 'nome categoria tempoPreparazione');
    
    res.status(200).json({
      success: true,
      count: ordini.length,
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

/**
 * Recupera un singolo ordine
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getOrdine = async (req, res) => {
  try {
    const ordine = await Ordine.findById(req.params.id)
      .populate('cliente', 'nome cognome telefono email punti')
      .populate('elementi.prodotto', 'nome categoria tempoPreparazione');
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: 'Ordine non trovato'
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

/**
 * Crea un nuovo ordine
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createOrdine = async (req, res) => {
  try {
    const {
      cliente,
      nomeCliente,
      telefono,
      elementi,
      tipo,
      stato,
      indirizzoConsegna,
      numeroTavolo,
      orarioRichiesto,
      metodoPagamento,
      costoConsegna,
      sconto,
      note,
      totale
    } = req.body;
    
    // Genera numero ordine
    const numeroOrdine = await Ordine.generaNumeroOrdine();
    
    // Crea l'ordine
    const ordine = new Ordine({
      numeroOrdine,
      cliente,
      nomeCliente,
      telefono,
      elementi,
      tipo,
      stato,
      indirizzoConsegna,
      numeroTavolo,
      orarioRichiesto,
      metodoPagamento,
      costoConsegna,
      sconto,
      note,
      totale
    });
    
    // Salva l'ordine
    await ordine.save();
    
    // Se c'è un cliente associato, aggiorna i suoi punti fedeltà
    if (cliente) {
      // Calcola punti fedeltà (ad esempio, 1 punto ogni 10€ spesi)
      const puntiFedelta = Math.floor(totale / 10);
      
      // Aggiorna il cliente con i nuovi punti
      await Cliente.findByIdAndUpdate(
        cliente,
        { $inc: { punti: puntiFedelta } }
      );
      
      // Aggiorna l'ordine con i punti fedeltà assegnati
      ordine.puntiFedelta = puntiFedelta;
      await ordine.save();
    }
    
    res.status(201).json({
      success: true,
      data: ordine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione dell\'ordine',
      error: error.message
    });
  }
};

/**
 * Aggiorna un ordine esistente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateOrdine = async (req, res) => {
  try {
    const {
      cliente,
      nomeCliente,
      telefono,
      elementi,
      tipo,
      stato,
      indirizzoConsegna,
      numeroTavolo,
      orarioRichiesto,
      metodoPagamento,
      costoConsegna,
      sconto,
      note,
      totale,
      rider,
      tempoPreparazione
    } = req.body;
    
    const ordine = await Ordine.findById(req.params.id);
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: 'Ordine non trovato'
      });
    }
    
    // Aggiorna i campi
    if (cliente) ordine.cliente = cliente;
    if (nomeCliente) ordine.nomeCliente = nomeCliente;
    if (telefono) ordine.telefono = telefono;
    if (elementi) ordine.elementi = elementi;
    if (tipo) ordine.tipo = tipo;
    if (stato) ordine.stato = stato;
    if (indirizzoConsegna) ordine.indirizzoConsegna = indirizzoConsegna;
    if (numeroTavolo !== undefined) ordine.numeroTavolo = numeroTavolo;
    if (orarioRichiesto) ordine.orarioRichiesto = orarioRichiesto;
    if (metodoPagamento) ordine.metodoPagamento = metodoPagamento;
    if (costoConsegna !== undefined) ordine.costoConsegna = costoConsegna;
    if (sconto !== undefined) ordine.sconto = sconto;
    if (note !== undefined) ordine.note = note;
    if (totale) ordine.totale = totale;
    if (rider !== undefined) ordine.rider = rider;
    if (tempoPreparazione !== undefined) ordine.tempoPreparazione = tempoPreparazione;
    
    // Salva le modifiche
    await ordine.save();
    
    res.status(200).json({
      success: true,
      data: ordine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'ordine',
      error: error.message
    });
  }
};

/**
 * Aggiorna lo stato di un ordine
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateStatoOrdine = async (req, res) => {
  try {
    const { stato } = req.body;
    
    if (!stato) {
      return res.status(400).json({
        success: false,
        message: 'Lo stato è obbligatorio'
      });
    }
    
    const ordine = await Ordine.findById(req.params.id);
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: 'Ordine non trovato'
      });
    }
    
    // Aggiorna lo stato
    ordine.stato = stato;
    
    // Se l'ordine passa a "in preparazione", registra il tempo di inizio preparazione
    if (stato === 'in preparazione' && !ordine.tempoPreparazione) {
      ordine.tempoPreparazione = new Date();
    }
    
    // Salva le modifiche
    await ordine.save();
    
    res.status(200).json({
      success: true,
      data: ordine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dello stato dell\'ordine',
      error: error.message
    });
  }
};

/**
 * Elimina un ordine
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteOrdine = async (req, res) => {
  try {
    const ordine = await Ordine.findById(req.params.id);
    
    if (!ordine) {
      return res.status(404).json({
        success: false,
        message: 'Ordine non trovato'
      });
    }
    
    await ordine.remove();
    
    res.status(200).json({
      success: true,
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

/**
 * Ottiene le statistiche degli ordini
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getStatisticheOrdini = async (req, res) => {
  try {
    const { dataInizio, dataFine } = req.query;
    
    let matchStage = {};
    
    // Filtraggio per intervallo di date
    if (dataInizio && dataFine) {
      const start = new Date(dataInizio);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(dataFine);
      end.setHours(23, 59, 59, 999);
      
      matchStage.createdAt = { $gte: start, $lte: end };
    }
    
    // Statistiche generali
    const statisticheGenerali = await Ordine.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totaleOrdini: { $sum: 1 },
          totaleVendite: { $sum: '$totale' },
          mediaOrdine: { $avg: '$totale' },
          totaleConsegne: { $sum: { $cond: [{ $eq: ['$tipo', 'consegna'] }, 1, 0] } },
          totaleAsporto: { $sum: { $cond: [{ $eq: ['$tipo', 'asporto'] }, 1, 0] } },
          totaleTavolo: { $sum: { $cond: [{ $eq: ['$tipo', 'tavolo'] }, 1, 0] } }
        }
      }
    ]);
    
    // Ordini per stato
    const ordiniPerStato = await Ordine.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$stato',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Prodotti più venduti
    const prodottiPiuVenduti = await Ordine.aggregate([
      { $match: matchStage },
      { $unwind: '$elementi' },
      {
        $group: {
          _id: '$elementi.prodotto',
          nome: { $first: '$elementi.nome' },
          quantitaTotale: { $sum: '$elementi.quantita' },
          valoreTotale: { $sum: { $multiply: ['$elementi.quantita', '$elementi.prezzo'] } }
        }
      },
      { $sort: { quantitaTotale: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'prodotti',
          localField: '_id',
          foreignField: '_id',
          as: 'dettagliProdotto'
        }
      },
      {
        $project: {
          _id: 1,
          nome: 1,
          quantitaTotale: 1,
          valoreTotale: 1,
          categoria: { $arrayElemAt: ['$dettagliProdotto.categoria', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        statisticheGenerali: statisticheGenerali[0] || {},
        ordiniPerStato,
        prodottiPiuVenduti
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche degli ordini',
      error: error.message
    });
  }
};