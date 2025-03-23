import axios from 'axios';

const API_URL = 'http://localhost:5000/api/fedelta';

/**
 * Ottiene i dati completi del programma fedeltà
 */
export const getProgrammaFedelta = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero del programma fedeltà:', error);
    throw error;
  }
};

/**
 * Aggiorna il programma fedeltà
 * @param {Object} programmaData - Dati aggiornati del programma
 */
export const updateProgrammaFedelta = async (programmaData) => {
  try {
    const response = await axios.put(API_URL, programmaData);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento del programma fedeltà:', error);
    throw error;
  }
};

/**
 * Aggiunge una nuova campagna
 * @param {Object} campagnaData - Dati della nuova campagna
 */
export const addCampagna = async (campagnaData) => {
  try {
    const response = await axios.post(`${API_URL}/campagne`, campagnaData);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiunta della campagna:', error);
    throw error;
  }
};

/**
 * Aggiorna una campagna esistente
 * @param {string} campagnaId - ID della campagna
 * @param {Object} campagnaData - Dati aggiornati della campagna
 */
export const updateCampagna = async (campagnaId, campagnaData) => {
  try {
    const response = await axios.put(`${API_URL}/campagne/${campagnaId}`, campagnaData);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'aggiornamento della campagna ${campagnaId}:`, error);
    throw error;
  }
};

/**
 * Elimina una campagna
 * @param {string} campagnaId - ID della campagna da eliminare
 */
export const deleteCampagna = async (campagnaId) => {
  try {
    const response = await axios.delete(`${API_URL}/campagne/${campagnaId}`);
    return response.data;
  } catch (error) {
    console.error(`Errore nell'eliminazione della campagna ${campagnaId}:`, error);
    throw error;
  }
};

/**
 * Aggiorna le regole dei badge
 * @param {Array} regoleData - Array con le nuove regole dei badge
 */
export const updateRegoleBadge = async (regoleData) => {
  try {
    const response = await axios.put(`${API_URL}/regole-badge`, regoleData);
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle regole badge:', error);
    throw error;
  }
};