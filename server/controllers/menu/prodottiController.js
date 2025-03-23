const Prodotto = require('../../models/menu/prodottoModel');
const fs = require('fs');
const path = require('path');

// Ottieni tutti i prodotti
exports.getProdotti = async (req, res) => {
  try {
    const prodotti = await Prodotto.find();
    res.status(200).json(prodotti);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero dei prodotti', 
      error: error.message 
    });
  }
};

// Ottieni un prodotto specifico
exports.getProdotto = async (req, res) => {
  try {
    const prodotto = await Prodotto.findById(req.params.id);
    
    if (!prodotto) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prodotto non trovato' 
      });
    }
    
    res.status(200).json(prodotto);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero del prodotto', 
      error: error.message 
    });
  }
};

// Crea un nuovo prodotto
exports.createProdotto = async (req, res) => {
  try {
    // Gestione dell'immagine (se presente)
    let immagineUrl = '';
    if (req.file) {
      immagineUrl = `/uploads/menu/${req.file.filename}`;
    }
    
    const nuovoProdotto = await Prodotto.create({
      ...req.body,
      immagine: immagineUrl
    });
    
    res.status(201).json({
      success: true,
      message: 'Prodotto creato con successo',
      data: nuovoProdotto
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nella creazione del prodotto', 
      error: error.message 
    });
  }
};

// Aggiorna un prodotto
exports.updateProdotto = async (req, res) => {
  try {
    const prodotto = await Prodotto.findById(req.params.id);
    
    if (!prodotto) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prodotto non trovato' 
      });
    }
    
    // Gestione dell'immagine (se aggiornata)
    let datiAggiornati = { ...req.body };
    
    if (req.file) {
      // Se c'è una nuova immagine caricata
      
      // Elimina la vecchia immagine se esistente
      if (prodotto.immagine) {
        const vecchioPath = path.join(__dirname, '../..', prodotto.immagine);
        if (fs.existsSync(vecchioPath)) {
          fs.unlinkSync(vecchioPath);
        }
      }
      
      // Imposta il nuovo percorso dell'immagine
      datiAggiornati.immagine = `/uploads/menu/${req.file.filename}`;
    }
    
    // Aggiorna il prodotto nel database
    const prodottoAggiornato = await Prodotto.findByIdAndUpdate(
      req.params.id, 
      datiAggiornati, 
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Prodotto aggiornato con successo',
      data: prodottoAggiornato
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Errore nell\'aggiornamento del prodotto', 
      error: error.message 
    });
  }
};

// Elimina un prodotto
exports.deleteProdotto = async (req, res) => {
  try {
    const prodotto = await Prodotto.findById(req.params.id);
    
    if (!prodotto) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prodotto non trovato' 
      });
    }
    
    // Elimina l'immagine associata se esistente
    if (prodotto.immagine) {
      const imagePath = path.join(__dirname, '../..', prodotto.immagine);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Elimina il prodotto dal database
    await Prodotto.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Prodotto eliminato con successo'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nell\'eliminazione del prodotto', 
      error: error.message 
    });
  }
};

// Cambia lo stato attivo/inattivo di un prodotto
exports.toggleProdottoAttivo = async (req, res) => {
  try {
    const prodotto = await Prodotto.findById(req.params.id);
    
    if (!prodotto) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prodotto non trovato' 
      });
    }
    
    prodotto.attivo = !prodotto.attivo;
    await prodotto.save();
    
    res.status(200).json({
      success: true,
      message: `Prodotto ${prodotto.attivo ? 'attivato' : 'disattivato'} con successo`,
      data: prodotto
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nella modifica dello stato del prodotto', 
      error: error.message 
    });
  }
};

// Cambia lo stato di promozione di un prodotto
exports.toggleProdottoPromozione = async (req, res) => {
  try {
    const prodotto = await Prodotto.findById(req.params.id);
    
    if (!prodotto) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prodotto non trovato' 
      });
    }
    
    prodotto.inPromozione = !prodotto.inPromozione;
    
    // Se il prezzoPromozione non è stato impostato, usa l'80% del prezzo normale
    if (prodotto.inPromozione && !prodotto.prezzoPromozione) {
      prodotto.prezzoPromozione = Math.round((prodotto.prezzo * 0.8) * 100) / 100;
    }
    
    await prodotto.save();
    
    res.status(200).json({
      success: true,
      message: `Prodotto ${prodotto.inPromozione ? 'messo in' : 'tolto dalla'} promozione con successo`,
      data: prodotto
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Errore nella modifica dello stato di promozione del prodotto', 
      error: error.message 
    });
  }
};