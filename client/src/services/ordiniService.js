import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Ottiene tutti gli ordini
export const getOrdini = async (filtri = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ordini`, { params: filtri });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero degli ordini:', error);
    throw error;
  }
};

// Ottiene un ordine specifico
export const getOrdine = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/ordini/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel recupero dell'ordine con ID ${id}:`, error);
    throw error;
  }
};

// Crea un nuovo ordine
export const createOrdine = async (ordine, force = false) => {
  try {
    const url = force ? `${API_URL}/ordini?force=true` : `${API_URL}/ordini`;
    const response = await axios.post(url, ordine);
    return response.data;
  } catch (error) {
    console.error('Errore nella creazione dell\'ordine:', error);
    throw error;
  }
};

// Aggiorna un ordine esistente
export const updateOrdine = async (id, ordine, force = false) => {
  try {
    const url = force ? `${API_URL}/ordini/${id}?force=true` : `${API_URL}/ordini/${id}`;
    const response = await axios.put(url, ordine);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento dell'ordine con ID ${id}:`, error);
    throw error;
  }
};

// Elimina un ordine
export const deleteOrdine = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/ordini/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione dell'ordine con ID ${id}:`, error);
    throw error;
  }
};

// Aggiorna solo lo stato di un ordine
export const updateStatoOrdine = async (id, nuovoStato) => {
  try {
    const response = await axios.patch(`${API_URL}/ordini/${id}/stato`, { stato: nuovoStato });
    return response.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento dello stato dell'ordine con ID ${id}:`, error);
    throw error;
  }
};

// Ottiene statistiche sugli ordini
export const getStatisticheOrdini = async (filtri = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ordini/statistiche/riassunto`, { params: filtri });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle statistiche degli ordini:', error);
    throw error;
  }
};

// Ottiene gli slot orari disponibili per una data
export const getSlotOrari = async (data) => {
  try {
    const response = await axios.get(`${API_URL}/ordini/slots`, { params: { data } });
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero degli slot orari:', error);
    throw error;
  }
};

// Ottiene le configurazioni orari
export const getConfigurazioniOrari = async () => {
  try {
    const response = await axios.get(`${API_URL}/ordini/configurazione`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle configurazioni orari:', error);
    throw error;
  }
};

// Ottiene configurazione per un giorno specifico
export const getConfigurazioneGiorno = async (giorno) => {
  try {
    const response = await axios.get(`${API_URL}/ordini/configurazione/${giorno}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel recupero della configurazione per il giorno ${giorno}:`, error);
    throw error;
  }
};

// Aggiorna configurazione per un giorno
export const updateConfigurazioneGiorno = async (giorno, configurazione) => {
  try {
    const response = await axios.put(`${API_URL}/ordini/configurazione/${giorno}`, configurazione);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento della configurazione per il giorno ${giorno}:`, error);
    throw error;
  }
};

// Copia configurazione a tutti i giorni
export const copiaConfigurazioneATutti = async (giorno) => {
  try {
    const response = await axios.post(`${API_URL}/ordini/configurazione/${giorno}/copia-a-tutti`);
    return response.data;
  } catch (error) {
    console.error('Errore nella copia della configurazione a tutti i giorni:', error);
    throw error;
  }
};

export default {
  getOrdini,
  getOrdine,
  createOrdine,
  updateOrdine,
  deleteOrdine,
  updateStatoOrdine,
  getStatisticheOrdini,
  getSlotOrari,
  getConfigurazioniOrari,
  getConfigurazioneGiorno,
  updateConfigurazioneGiorno,
  copiaConfigurazioneATutti
};