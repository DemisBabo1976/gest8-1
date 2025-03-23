import axios from 'axios';

const API_URL = 'http://localhost:5000/api/menu/prodotti';

// Ottieni tutti i prodotti
export const getProdotti = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei prodotti:', error);
    throw error;
  }
};

// Ottieni un prodotto specifico
export const getProdotto = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel recupero del prodotto ${id}:`, error);
    throw error;
  }
};

// Crea un nuovo prodotto con immagine
export const createProdotto = async (prodottoData) => {
  try {
    // Utilizziamo FormData per inviare sia i dati che l'immagine
    const formData = new FormData();
    
    // Aggiungi tutti i campi del prodotto
    Object.keys(prodottoData).forEach(key => {
      if (key === 'immagine' && prodottoData[key] instanceof File) {
        formData.append(key, prodottoData[key]);
      } else if (key === 'ingredienti' || key === 'allergeni') {
        // Gestisci array convertendoli in stringhe JSON
        formData.append(key, JSON.stringify(prodottoData[key]));
      } else {
        formData.append(key, prodottoData[key]);
      }
    });
    
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Errore nella creazione del prodotto:', error);
    throw error;
  }
};

// Aggiorna un prodotto con possibile immagine
export const updateProdotto = async (id, prodottoData) => {
  try {
    const formData = new FormData();
    
    // Aggiungi tutti i campi aggiornati
    Object.keys(prodottoData).forEach(key => {
      if (key === 'immagine' && prodottoData[key] instanceof File) {
        formData.append(key, prodottoData[key]);
      } else if (key === 'ingredienti' || key === 'allergeni') {
        // Gestisci array convertendoli in stringhe JSON
        formData.append(key, JSON.stringify(prodottoData[key]));
      } else {
        formData.append(key, prodottoData[key]);
      }
    });
    
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento del prodotto ${id}:`, error);
    throw error;
  }
};

// Elimina un prodotto
export const deleteProdotto = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione del prodotto ${id}:`, error);
    throw error;
  }
};

// Cambia lo stato attivo/inattivo di un prodotto
export const toggleProdottoAttivo = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/toggle-attivo`);
    return response.data;
  } catch (error) {
    console.error(`Errore nella modifica dello stato del prodotto ${id}:`, error);
    throw error;
  }
};

// Cambia lo stato di promozione di un prodotto
export const toggleProdottoPromozione = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/toggle-promozione`);
    return response.data;
  } catch (error) {
    console.error(`Errore nella modifica dello stato di promozione del prodotto ${id}:`, error);
    throw error;
  }
};