import axios from 'axios';

const API_URL = 'http://localhost:5000/api/clienti';

// Ottieni tutti i clienti
export const getClienti = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei clienti:', error);
    throw error;
  }
};

// Ottieni un cliente specifico
export const getCliente = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel recupero del cliente ${id}:`, error);
    throw error;
  }
};

// Crea un nuovo cliente
export const createCliente = async (clienteData) => {
  try {
    const response = await axios.post(API_URL, clienteData);
    return response.data;
  } catch (error) {
    console.error('Errore nella creazione del cliente:', error);
    throw error;
  }
};

// Aggiorna un cliente
export const updateCliente = async (id, clienteData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, clienteData);
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