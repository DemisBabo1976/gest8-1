const Cliente = require('../../models/clienti/clienteModel');

// Ottieni tutti i clienti
exports.getClienti = async (req, res) => {
  try {
    const clienti = await Cliente.find();
    res.status(200).json(clienti);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero dei clienti', 
      error: error.message 
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