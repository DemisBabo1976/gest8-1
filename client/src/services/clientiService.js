// services/clientiService.js
import axios from 'axios';

// Base URL per le chiamate API
const API_URL = '/api/clienti';

// Ottieni tutti i clienti
export const getClienti = async () => {
  try {
    console.log('Tento di recuperare i clienti dall\'endpoint:', API_URL);
    
    const response = await axios.get(API_URL, {
      // Aggiungi opzioni per gestire eventuali problemi di CORS o configurazione
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Risposta dal server:', response.data);
    
    // Gestisci diversi formati di risposta
    return response.data.data || response.data;
  } catch (error) {
    console.error('Errore dettagliato nel recupero dei clienti:', error);
    
    // Gestisci differenti tipi di errori
    if (error.response) {
      // Il server ha risposto con un codice di stato fuori dal range 2xx
      console.error('Dati dell\'errore:', error.response.data);
      console.error('Stato dell\'errore:', error.response.status);
    } else if (error.request) {
      // La richiesta è stata fatta ma non è stata ricevuta alcuna risposta
      console.error('Nessuna risposta ricevuta:', error.request);
    } else {
      // Qualcosa è andato storto durante la configurazione della richiesta
      console.error('Errore di configurazione:', error.message);
    }
    
    throw error;
  }
};

// Cerca clienti per query
export const cercaClienti = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { q: query }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Errore nella ricerca dei clienti:', error);
    throw error;
  }
};

// Crea un nuovo cliente
export const createCliente = async (cliente) => {
  try {
    const response = await axios.post(API_URL, cliente);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Errore nella creazione del cliente:', error);
    throw error;
  }
};

// Altre funzioni come updateCliente, deleteCliente rimangono invariate

// Aggiorna un cliente
export const updateCliente = async (id, cliente) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, cliente);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento del cliente ${id}:`, error);
    throw error;
  }
};

// Elimina un cliente
export const deleteCliente = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione del cliente ${id}:`, error);
    throw error;
  }
};