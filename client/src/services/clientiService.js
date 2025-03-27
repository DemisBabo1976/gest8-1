import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Ottiene tutti i clienti
export const getClienti = async (filtri = {}) => {
  try {
    const response = await axios.get(`${API_URL}/clienti`, { params: filtri });
    return response.data.data;
  } catch (error) {
    console.error('Errore nel recupero dei clienti:', error);
    throw error;
  }
};

// Ottiene un cliente specifico
export const getCliente = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/clienti/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Errore nel recupero del cliente con ID ${id}:`, error);
    throw error;
  }
};

// Crea un nuovo cliente
export const createCliente = async (cliente) => {
  try {
    const response = await axios.post(`${API_URL}/clienti`, cliente);
    return response.data.data;
  } catch (error) {
    console.error('Errore nella creazione del cliente:', error);
    throw error;
  }
};

// Aggiorna un cliente esistente
export const updateCliente = async (id, cliente) => {
  try {
    const response = await axios.put(`${API_URL}/clienti/${id}`, cliente);
    return response.data.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento del cliente con ID ${id}:`, error);
    throw error;
  }
};

// Elimina un cliente
export const deleteCliente = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/clienti/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione del cliente con ID ${id}:`, error);
    throw error;
  }
};

// Cerca clienti
export const searchClienti = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/clienti/search`, { params: { q: query } });
    return response.data.data;
  } catch (error) {
    console.error('Errore nella ricerca dei clienti:', error);
    throw error;
  }
};

export default {
  getClienti,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  searchClienti
};