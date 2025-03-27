import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Ottiene tutti i clienti
export const getClienti = async () => {
  try {
    const response = await axios.get(`${API_URL}/clienti`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei clienti:', error);
    throw error;
  }
};

// Ottiene un cliente specifico
export const getCliente = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/clienti/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel recupero del cliente con ID ${id}:`, error);
    throw error;
  }
};

// Crea un nuovo cliente
export const createCliente = async (cliente) => {
  try {
    const response = await axios.post(`${API_URL}/clienti`, cliente);
    return response.data;
  } catch (error) {
    console.error('Errore nella creazione del cliente:', error);
    throw error;
  }
};

// Aggiorna un cliente esistente
export const updateCliente = async (id, cliente) => {
  try {
    const response = await axios.put(`${API_URL}/clienti/${id}`, cliente);
    return response.data;
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

// Ricerca clienti per telefono
export const searchClienteByTelefono = async (telefono) => {
  try {
    const response = await axios.get(`${API_URL}/clienti/search`, {
      params: { telefono }
    });
    return response.data;
  } catch (error) {
    console.error(`Errore nella ricerca del cliente con telefono ${telefono}:`, error);
    throw error;
  }
};

// Ottieni i punti cliente
export const getClientePunti = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/clienti/${id}/punti`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel recupero dei punti del cliente con ID ${id}:`, error);
    throw error;
  }
};

// Aggiorna i punti cliente
export const updateClientePunti = async (id, punti) => {
  try {
    const response = await axios.patch(`${API_URL}/clienti/${id}/punti`, { punti });
    return response.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento dei punti del cliente con ID ${id}:`, error);
    throw error;
  }
};

// Ottieni la storia ordini di un cliente
export const getClienteOrdini = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/clienti/${id}/ordini`);
    return response.data;
  } catch (error) {
    console.error(`Errore nel recupero degli ordini del cliente con ID ${id}:`, error);
    throw error;
  }
};

export default {
  getClienti,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  searchClienteByTelefono,
  getClientePunti,
  updateClientePunti,
  getClienteOrdini
};