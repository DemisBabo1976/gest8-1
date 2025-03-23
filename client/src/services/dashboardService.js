import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Servizio per recuperare i dati della dashboard dal backend
 */
export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei dati della dashboard:', error);
    throw error;
  }
};

/**
 * Servizio per aggiornare i dati della dashboard
 * @param {Object} data - I dati da aggiornare
 */
export const updateDashboardData = async (data) => {
  try {
    const response = await axios.put(`${API_URL}/dashboard`, data);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento dei dati della dashboard:', error);
    throw error;
  }
};