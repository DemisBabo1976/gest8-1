const Cliente = require('../../models/clienti/clienteModel');

// Ottieni tutti i clienti
exports.getClienti = async (req, res) => {
  try {
    // Aggiungi più log per il debug
    console.log('Inizio recupero clienti');
    
    // Aggiungi opzioni di query per ordinare e selezionare campi specifici
    const clienti = await Cliente.find()
      .select('nome telefono email badge punti') // Seleziona solo i campi necessari
      .sort({ createdAt: -1 }); // Ordina dal più recente
    
    console.log(`Trovati ${clienti.length} clienti`);
    
    res.status(200).json({
      success: true,
      count: clienti.length,
      data: clienti
    });
  } catch (error) {
    console.error('Errore dettagliato nel recupero dei clienti:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero dei clienti', 
      error: error.toString() 
    });
  }
};

// Ottieni un cliente specifico
exports.getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente non trovato' 
      });
    }
    
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero del cliente', 
      error: error.message 
    });
  }
};

// Crea un nuovo cliente
exports.createCliente = async (req, res) => {
  try {
    const nuovoCliente = await Cliente.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Cliente creato con successo',
      data: nuovoCliente
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nella creazione del cliente', 
      error: error.message 
    });
  }
};

// Aggiorna un cliente
exports.updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente non trovato' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cliente aggiornato con successo',
      data: cliente
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nell\'aggiornamento del cliente', 
      error: error.message 
    });
  }
};

// Elimina un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente non trovato' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cliente eliminato con successo'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nell\'eliminazione del cliente', 
      error: error.message 
    });
  }
};

// Implementazione del metodo di ricerca
exports.searchClienti = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query di ricerca mancante'
      });
    }
    
    // Ricerca per nome, telefono o email
    const clienti = await Cliente.find({
      $or: [
        { nome: { $regex: query, $options: 'i' } },
        { telefono: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: clienti.length,
      data: clienti
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nella ricerca dei clienti',
      error: error.message
    });
  }
};