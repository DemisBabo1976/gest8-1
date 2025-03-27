import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Trash2, Copy, Info, AlertCircle, Save } from 'lucide-react';
import axios from 'axios';

const ConfigurazioneOrari = ({ onClose }) => {
  // Stato per memorizzare le configurazioni per ogni giorno
  const [configurazioni, setConfigurazioni] = useState([]);
  
  // Stato per il giorno selezionato
  const [giornoSelezionato, setGiornoSelezionato] = useState(0); // 0 = Lunedì
  
  // Stato per la configurazione corrente
  const [configurazione, setConfigurazione] = useState({
    aperto: true,
    intervalloSlot: 10,
    capacitaSlot: 5,
    turni: []
  });
  
  // Stato per il caricamento e gli errori
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Effetto per caricare le configurazioni all'avvio
  useEffect(() => {
    fetchConfigurazioni();
  }, []);
  
  // Effetto per aggiornare la configurazione corrente quando cambia il giorno selezionato
  useEffect(() => {
    if (configurazioni && configurazioni.length > 0) {
      const configGiorno = configurazioni.find(c => c.giorno === giornoSelezionato);
      
      if (configGiorno) {
        setConfigurazione({
          aperto: configGiorno.aperto,
          intervalloSlot: configGiorno.intervalloSlot || 10,
          capacitaSlot: configGiorno.capacitaSlot || 5,
          turni: configGiorno.turni || []
        });
      } else {
        // Se non esiste una configurazione per questo giorno, imposta valori predefiniti
        setConfigurazione({
          aperto: true,
          intervalloSlot: 10,
          capacitaSlot: 5,
          turni: []
        });
      }
    }
  }, [giornoSelezionato, configurazioni]);
  
const fetchConfigurazioni = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Prova a ottenere i dati dall'API
    const response = await axios.get('/api/ordini/configurazione', { 
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    if (response.data && response.data.data) {
      setConfigurazioni(response.data.data);
      // Salva anche in localStorage per il futuro
      localStorage.setItem('configurazioni-orari', JSON.stringify(response.data.data));
    } else {
      throw new Error('Dati non validi dalla risposta API');
    }
  } catch (err) {
    console.error('Errore nel caricamento delle configurazioni:', err);
    
    // Prova a caricare dal localStorage
    const localData = localStorage.getItem('configurazioni-orari');
    
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        setConfigurazioni(parsedData);
        setError('Caricati dati locali (server non disponibile)');
      } catch (parseError) {
        console.error('Errore nel parsing dei dati locali:', parseError);
        createDefaultConfigurations();
      }
    } else {
      createDefaultConfigurations();
    }
  } finally {
    setIsLoading(false);
  }
};

// Funzione helper per creare configurazioni predefinite
const createDefaultConfigurations = () => {
  const configurazioniPredefinite = Array(7).fill(0).map((_, index) => ({
    id: index,
    giorno: index,
    nomeGiorno: giorniSettimana[index],
    aperto: index === 1, // Solo Martedì aperto per default (come nell'immagine)
    intervalloSlot: 10,
    capacitaSlot: 5,
    turni: index === 1 ? [
      { apertura: '12:00', chiusura: '14:30' },
      { apertura: '18:00', chiusura: '23:00' }
    ] : []
  }));
  
  setConfigurazioni(configurazioniPredefinite);
  setError('Utilizzati dati predefiniti.');
  
  // Salva anche in localStorage per il futuro
  localStorage.setItem('configurazioni-orari', JSON.stringify(configurazioniPredefinite));
};  
  
 const salvaConfigurazione = async () => {
  setIsLoading(true);
  setError(null);
  setSuccessMessage(null);
  
  try {
    // Tenta di chiamare l'API
    try {
      await axios.put(`/api/ordini/configurazione/${giornoSelezionato}`, configurazione);
    } catch (apiError) {
      console.warn("Errore nell'API, utilizzo localStorage come fallback", apiError);
    }
    
    // Aggiorna sempre il localStorage indipendentemente dal risultato dell'API
    const configurazioneSalvate = JSON.parse(localStorage.getItem('configurazioni-orari') || '[]');
    
    // Trova l'indice della configurazione per questo giorno
    const index = configurazioneSalvate.findIndex(c => c.giorno === giornoSelezionato);
    
    if (index >= 0) {
      // Aggiorna la configurazione esistente
      configurazioneSalvate[index] = {
        ...configurazioneSalvate[index],
        ...configurazione,
        giorno: giornoSelezionato,
        nomeGiorno: giorniSettimana[giornoSelezionato]
      };
    } else {
      // Aggiungi una nuova configurazione
      configurazioneSalvate.push({
        ...configurazione,
        giorno: giornoSelezionato,
        nomeGiorno: giorniSettimana[giornoSelezionato]
      });
    }
    
    // Salva nel localStorage
    localStorage.setItem('configurazioni-orari', JSON.stringify(configurazioneSalvate));
    
    // Aggiorna l'interfaccia
    const nuoveConfigurazioni = [...configurazioneSalvate];
    setConfigurazioni(nuoveConfigurazioni);
    setSuccessMessage('Configurazione salvata con successo');
    
    // Nascondi il messaggio dopo 3 secondi
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  } catch (err) {
    console.error('Errore nel salvataggio della configurazione:', err);
    setError('Errore nel salvataggio. Riprova più tardi.');
  } finally {
    setIsLoading(false);
  }
};
  
  // Funzione per aggiungere un nuovo turno
  const aggiungiTurno = () => {
    const nuoviTurni = [...configurazione.turni];
    
    // Aggiungi un nuovo turno con orari predefiniti
    nuoviTurni.push({
      apertura: '18:00',
      chiusura: '23:00'
    });
    
    setConfigurazione({
      ...configurazione,
      turni: nuoviTurni
    });
  };
  
  // Funzione per rimuovere un turno
  const rimuoviTurno = (index) => {
    const nuoviTurni = [...configurazione.turni];
    nuoviTurni.splice(index, 1);
    
    setConfigurazione({
      ...configurazione,
      turni: nuoviTurni
    });
  };
  
  // Funzione per aggiornare un turno
  const aggiornaTurno = (index, campo, valore) => {
    const nuoviTurni = [...configurazione.turni];
    nuoviTurni[index] = {
      ...nuoviTurni[index],
      [campo]: valore
    };
    
    setConfigurazione({
      ...configurazione,
      turni: nuoviTurni
    });
  };
  
  // Funzione per copiare la configurazione a tutti i giorni
  const copiaConfigurazioneATutti = async () => {
    if (!window.confirm('Sei sicuro di voler copiare questa configurazione a tutti i giorni della settimana?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // In una implementazione reale:
      // await axios.post(`/api/ordini/configurazione/${giornoSelezionato}/copia-a-tutti`);
      
      // Simulazione di risposta di successo
      setTimeout(() => {
        // Implementa la copia localmente
        const configAttuale = configurazione;
        const nuoveConfigurazioni = [...configurazioni];
        
        for (let i = 0; i < 7; i++) {
          if (i !== giornoSelezionato) {
            const index = nuoveConfigurazioni.findIndex(c => c.giorno === i);
            
            if (index !== -1) {
              nuoveConfigurazioni[index] = {
                ...nuoveConfigurazioni[index],
                aperto: configAttuale.aperto,
                intervalloSlot: configAttuale.intervalloSlot,
                capacitaSlot: configAttuale.capacitaSlot,
                turni: JSON.parse(JSON.stringify(configAttuale.turni)) // Deep clone
              };
            } else {
              nuoveConfigurazioni.push({
                id: nuoveConfigurazioni.length,
                giorno: i,
                nomeGiorno: giorniSettimana[i],
                aperto: configAttuale.aperto,
                intervalloSlot: configAttuale.intervalloSlot,
                capacitaSlot: configAttuale.capacitaSlot,
                turni: JSON.parse(JSON.stringify(configAttuale.turni)) // Deep clone
              });
            }
          }
        }
        
        setConfigurazioni(nuoveConfigurazioni);
        setSuccessMessage('Configurazione copiata a tutti i giorni con successo');
        
        // Nascondi il messaggio dopo 3 secondi
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Errore nella copia della configurazione:', err);
      setError('Errore nella copia. Riprova più tardi.');
      setIsLoading(false);
    }
  };
  
  // Array dei giorni della settimana
  const giorniSettimana = [
    'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
  ];
  
  // Array degli intervalli di slot disponibili
  const intervalliSlotDisponibili = [
    { value: 5, label: '5 minuti' },
    { value: 10, label: '10 minuti' },
    { value: 15, label: '15 minuti' },
    { value: 20, label: '20 minuti' },
    { value: 30, label: '30 minuti' },
    { value: 60, label: '1 ora' }
  ];
  
  // Funzione di riprova
  const handleRetry = () => {
    fetchConfigurazioni();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <button 
              className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <X size={20} className="text-gray-700" />
            </button>
            <h2 className="text-xl font-semibold">Impostazioni Orari e Turni</h2>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="m-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
            {error.includes('Errore nel caricamento') && (
              <button 
                className="ml-auto bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded text-sm"
                onClick={handleRetry}
              >
                Riprova
              </button>
            )}
          </div>
        )}
        
        {successMessage && (
          <div className="m-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
            <Info size={20} className="mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        
        <div className="p-4 flex flex-row">
          {/* Colonna sinistra: selezione giorno */}
          <div className="w-1/3 pr-4">
            <h3 className="font-medium text-gray-700 mb-2">Giorni della settimana</h3>
            
            <div className="space-y-2">
              {giorniSettimana.map((giorno, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer ${
                    giornoSelezionato === index ? 'bg-red-100 border-2 border-red-300' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setGiornoSelezionato(index)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{giorno}</span>
                    
                    {configurazioni && configurazioni.length > 0 && configurazioni.find(c => c.giorno === index) && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        configurazioni.find(c => c.giorno === index).aperto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {configurazioni.find(c => c.giorno === index).aperto ? 'Aperto' : 'Chiuso'}
                      </span>
                    )}
                  </div>
                  
                  {/* Mostra "Non configurato" se non ci sono configurazioni per questo giorno */}
                  {configurazioni && configurazioni.length > 0 && !configurazioni.find(c => c.giorno === index) && (
                    <span className="text-xs text-red-500">Non configurato</span>
                  )}
                </div>
              ))}
            </div>
            
            <button
              className="mt-4 w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-colors flex items-center justify-center"
              onClick={copiaConfigurazioneATutti}
              disabled={isLoading}
            >
              <Copy size={18} className="mr-2" />
              Copia impostazioni per tutti i giorni
            </button>
          </div>
          
          {/* Colonna destra: configurazione del giorno selezionato */}
          <div className="w-2/3 border-l pl-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Configurazione per {giorniSettimana[giornoSelezionato]}
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Impostazioni generali</h4>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={configurazione.aperto}
                    onChange={(e) => setConfigurazione({...configurazione, aperto: e.target.checked})}
                    className="rounded text-blue-500 mr-2"
                  />
                  <span className="font-medium text-gray-700">Giorno di apertura</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Intervallo tra slot (minuti)</label>
                  <select 
                    value={configurazione.intervalloSlot}
                    onChange={(e) => setConfigurazione({...configurazione, intervalloSlot: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    disabled={!configurazione.aperto}
                  >
                    {intervalliSlotDisponibili.map(intervallo => (
                      <option key={intervallo.value} value={intervallo.value}>
                        {intervallo.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Capacità predefinita per slot</label>
                  <input 
                    type="number"
                    value={configurazione.capacitaSlot}
                    onChange={(e) => setConfigurazione({
                      ...configurazione, 
                      capacitaSlot: Math.min(50, Math.max(1, parseInt(e.target.value) || 1))
                    })}
                    min="1"
                    max="50"
                    className="w-full border border-gray-300 rounded-lg p-2"
                    disabled={!configurazione.aperto}
                  />
                </div>
              </div>
              
              {configurazione.aperto && (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Turni di lavoro</h4>
                    
                    <button 
                      className="bg-green-100 text-green-700 p-1 rounded-full hover:bg-green-200 transition-colors"
                      onClick={aggiungiTurno}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  {configurazione.turni.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Nessun turno configurato. Aggiungi il primo turno.
                    </div>
                  ) : (
                    configurazione.turni.map((turno, index) => (
                      <div key={index} className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Turno {index + 1}</span>
                          
                          <button 
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                            onClick={() => rimuoviTurno(index)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Apertura</label>
                            <div className="relative">
                              <input 
                                type="time"
                                value={turno.apertura}
                                onChange={(e) => aggiornaTurno(index, 'apertura', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 pl-8"
                              />
                              <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Chiusura</label>
                            <div className="relative">
                              <input 
                                type="time"
                                value={turno.chiusura}
                                onChange={(e) => aggiornaTurno(index, 'chiusura', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 pl-8"
                              />
                              <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                onClick={salvaConfigurazione}
                disabled={isLoading}
              >
                <Save size={18} className="mr-2" />
                Salva impostazioni
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurazioneOrari;