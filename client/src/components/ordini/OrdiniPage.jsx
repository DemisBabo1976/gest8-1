import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Calendar, Clock, Filter, 
  Search, Download, Plus, Eye, Edit, Trash2,
  X, RefreshCw, ArrowLeft, Grid, List, Cog, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';

// Componenti del wizard di creazione ordine
import NuovoOrdineCliente from './NuovoOrdineCliente';
import NuovoOrdineProdotti from './NuovoOrdineProdotti';
import NuovoOrdineDettagli from './NuovoOrdineDettagli';
import NuovoOrdineConferma from './NuovoOrdineConferma';

// Componente per la configurazione orari e turni
import ConfigurazioneOrari from './ConfigurazioneOrari';

const OrdiniPage = () => {
  const navigate = useNavigate();
  
  // Stati per la gestione degli ordini
  const [ordini, setOrdini] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Stati per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Stati per i filtri
  const [filtri, setFiltri] = useState({
    dataSelezionata: new Date().toISOString().split('T')[0],
    stato: 'tutti',
    tipo: 'tutti',
    ricerca: ''
  });
  
  // Stato per il nuovo ordine
  const [nuovoOrdine, setNuovoOrdine] = useState({
    clienteNome: '',
    clienteTelefono: '',
    indirizzo: '',
    data: new Date().toISOString().split('T')[0],
    orario: '19:00',
    tipo: 'asporto',
    articoli: [],
    note: ''
  });
  
  // Stato per il wizard di creazione ordine
  const [showNuovoOrdine, setShowNuovoOrdine] = useState(false);
  const [stepNuovoOrdine, setStepNuovoOrdine] = useState(1);
  
  // Stato per la configurazione orari
  const [showConfigurazioneOrari, setShowConfigurazioneOrari] = useState(false);
  
  // Effetto per caricare gli ordini all'avvio e quando cambiano i filtri
  useEffect(() => {
    fetchOrdini();
  }, [filtri, currentPage]);
  
  // Funzione per recuperare gli ordini dal server
  const fetchOrdini = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: 10,
        data: filtri.dataSelezionata
      };
      
      if (filtri.stato !== 'tutti') {
        params.stato = filtri.stato;
      }
      
      if (filtri.tipo !== 'tutti') {
        params.tipo = filtri.tipo;
      }
      
      if (filtri.ricerca) {
        params.cliente = filtri.ricerca;
      }
      
      const response = await axios.get('/api/ordini', { params });
      
      setOrdini(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Errore nel caricamento degli ordini. Riprova più tardi.');
      console.error('Errore nel caricamento degli ordini:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funzione per cambiare la data selezionata
  const cambiaData = (delta) => {
    const data = new Date(filtri.dataSelezionata);
    data.setDate(data.getDate() + delta);
    
    setFiltri({
      ...filtri,
      dataSelezionata: data.toISOString().split('T')[0]
    });
  };
  
  // Funzione per aprire il wizard di creazione ordine
  const apriNuovoOrdine = () => {
    setNuovoOrdine({
      clienteNome: '',
      clienteTelefono: '',
      indirizzo: '',
      data: filtri.dataSelezionata,
      orario: '19:00',
      tipo: 'asporto',
      articoli: [],
      note: ''
    });
    setStepNuovoOrdine(1);
    setShowNuovoOrdine(true);
  };
  
  // Funzione per chiudere il wizard di creazione ordine
  const chiudiNuovoOrdine = () => {
    if (window.confirm('Sei sicuro di voler annullare la creazione dell\'ordine?')) {
      setShowNuovoOrdine(false);
    }
  };
  
  // Funzione per gestire il cambio di step nel wizard di creazione ordine
  const cambiaStepOrdine = (direzione) => {
    const nuovoStep = stepNuovoOrdine + direzione;
    
    if (nuovoStep >= 1 && nuovoStep <= 4) {
      setStepNuovoOrdine(nuovoStep);
    }
  };
  
  // Funzione per aggiornare i dati del nuovo ordine
  const aggiornaOrdine = (campo, valore) => {
    setNuovoOrdine({
      ...nuovoOrdine,
      [campo]: valore
    });
  };
  
  // Funzione per salvare il nuovo ordine
  const salvaOrdine = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.post('/api/ordini', nuovoOrdine);
      
      // Aggiorna la lista degli ordini
      fetchOrdini();
      
      // Chiudi il wizard
      setShowNuovoOrdine(false);
      
      // Mostra messaggio di successo
      alert('Ordine creato con successo');
    } catch (err) {
      console.error('Errore nella creazione dell\'ordine:', err);
      
      if (err.response && err.response.data && err.response.data.isCompleto) {
        if (window.confirm('Lo slot orario è completo. Vuoi forzare l\'inserimento?')) {
          try {
            const response = await axios.post('/api/ordini?force=true', nuovoOrdine);
            
            // Aggiorna la lista degli ordini
            fetchOrdini();
            
            // Chiudi il wizard
            setShowNuovoOrdine(false);
            
            // Mostra messaggio di successo
            alert('Ordine creato con successo (forzato)');
          } catch (forcedErr) {
            alert('Errore nella creazione dell\'ordine: ' + (forcedErr.response?.data?.message || 'Errore sconosciuto'));
          }
        }
      } else {
        alert('Errore nella creazione dell\'ordine: ' + (err.response?.data?.message || 'Errore sconosciuto'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funzione per eliminare un ordine
  const eliminaOrdine = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo ordine?')) {
      try {
        setIsLoading(true);
        
        await axios.delete(`/api/ordini/${id}`);
        
        // Aggiorna la lista degli ordini
        fetchOrdini();
        
        // Mostra messaggio di successo
        alert('Ordine eliminato con successo');
      } catch (err) {
        console.error('Errore nell\'eliminazione dell\'ordine:', err);
        alert('Errore nell\'eliminazione dell\'ordine: ' + (err.response?.data?.message || 'Errore sconosciuto'));
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Funzione per aggiornare lo stato di un ordine
  const cambiaStatoOrdine = async (id, nuovoStato) => {
    try {
      setIsLoading(true);
      
      await axios.patch(`/api/ordini/${id}/stato`, { stato: nuovoStato });
      
      // Aggiorna la lista degli ordini
      fetchOrdini();
    } catch (err) {
      console.error('Errore nell\'aggiornamento dello stato dell\'ordine:', err);
      alert('Errore nell\'aggiornamento dello stato dell\'ordine: ' + (err.response?.data?.message || 'Errore sconosciuto'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funzione per esportare gli ordini
  const esportaOrdini = () => {
    alert('Funzionalità di esportazione non ancora implementata');
  };
  
  // Funzione per aprire la configurazione orari
  const apriConfigurazioneOrari = () => {
    setShowConfigurazioneOrari(true);
  };
  
  // Funzione per chiudere la configurazione orari
  const chiudiConfigurazioneOrari = () => {
    setShowConfigurazioneOrari(false);
  };
  
  // Rendering condizionale del wizard di creazione ordine
  const renderWizardNuovoOrdine = () => {
    if (!showNuovoOrdine) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {stepNuovoOrdine === 1 && (
            <NuovoOrdineCliente 
              ordine={nuovoOrdine}
              onUpdate={aggiornaOrdine}
              onClose={chiudiNuovoOrdine}
              onNext={() => cambiaStepOrdine(1)}
            />
          )}
          
          {stepNuovoOrdine === 2 && (
            <NuovoOrdineProdotti 
              ordine={nuovoOrdine}
              onUpdate={aggiornaOrdine}
              onClose={chiudiNuovoOrdine}
              onPrev={() => cambiaStepOrdine(-1)}
              onNext={() => cambiaStepOrdine(1)}
            />
          )}
          
          {stepNuovoOrdine === 3 && (
            <NuovoOrdineDettagli 
              ordine={nuovoOrdine}
              onUpdate={aggiornaOrdine}
              onClose={chiudiNuovoOrdine}
              onPrev={() => cambiaStepOrdine(-1)}
              onNext={() => cambiaStepOrdine(1)}
            />
          )}
          
          {stepNuovoOrdine === 4 && (
            <NuovoOrdineConferma 
              ordine={nuovoOrdine}
              onClose={chiudiNuovoOrdine}
              onPrev={() => cambiaStepOrdine(-1)}
              onSave={salvaOrdine}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    );
  };
  
  // Rendering condizionale della configurazione orari
  const renderConfigurazioneOrari = () => {
    if (!showConfigurazioneOrari) return null;
    
    return (
      <ConfigurazioneOrari 
        onClose={chiudiConfigurazioneOrari}
      />
    );
  };
  
  return (
    <div className="bg-orange-50 min-h-screen">
      <header className="bg-white shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold flex items-center text-gray-800">
              <ShoppingCart className="text-red-500 mr-2" size={24} />
              Gestione Ordini
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg flex items-center hover:bg-gray-200 transition-colors"
              onClick={esportaOrdini}
            >
              <Download size={18} className="mr-2" />
              Esporta
            </button>
            
            <button 
              className="bg-red-500 text-white px-3 py-2 rounded-lg flex items-center hover:bg-red-600 transition-colors"
              onClick={apriNuovoOrdine}
            >
              <Plus size={18} className="mr-2" />
              Nuovo Ordine
            </button>
            
            <button 
              className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
              onClick={apriConfigurazioneOrari}
            >
              <Cog size={18} className="mr-2" />
              Gestione Orari
            </button>
          </div>
        </div>
      </header>
      
      <div className="p-4">
        {/* Barra dei filtri */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <label className="flex-1">
                <div className="relative">
                  <input 
                    type="text"
                    value={filtri.ricerca}
                    onChange={(e) => setFiltri({...filtri, ricerca: e.target.value})}
                    placeholder="Cerca ordine, cliente..."
                    className="w-full border border-gray-300 rounded-lg pl-10 py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <select 
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtri.stato}
                onChange={(e) => setFiltri({...filtri, stato: e.target.value})}
              >
                <option value="tutti">Tutti gli stati</option>
                <option value="confermato">Confermato</option>
                <option value="in preparazione">In preparazione</option>
                <option value="completato">Completato</option>
                <option value="annullato">Annullato</option>
              </select>
              
              <select 
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtri.tipo}
                onChange={(e) => setFiltri({...filtri, tipo: e.target.value})}
              >
                <option value="tutti">Tutti i tipi</option>
                <option value="asporto">Asporto</option>
                <option value="consegna">Consegna</option>
                <option value="ritiro">Ritiro</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 justify-center">
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => cambiaData(-1)}
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              
              <div className="relative flex-1">
                <input 
                  type="date"
                  value={filtri.dataSelezionata}
                  onChange={(e) => setFiltri({...filtri, dataSelezionata: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg pl-10 py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => cambiaData(1)}
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>
              
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={fetchOrdini}
              >
                <RefreshCw size={20} className={`text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabella ordini */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading && (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          )}
          
          {!isLoading && !error && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numero</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Totale</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {ordini.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      Nessun ordine trovato per la data selezionata
                    </td>
                  </tr>
                ) : (
                  ordini.map(ordine => (
                    <tr key={ordine._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{ordine._id.slice(-5).toUpperCase()}</td>
                      <td className="px-4 py-3">{new Date(ordine.data).toLocaleDateString('it-IT')}</td>
                      <td className="px-4 py-3">{ordine.orario}</td>
                      <td className="px-4 py-3">{ordine.clienteNome}</td>
                      <td className="px-4 py-3 capitalize">{ordine.tipo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ordine.stato === 'confermato' ? 'bg-blue-100 text-blue-700' :
                          ordine.stato === 'in preparazione' ? 'bg-orange-100 text-orange-700' :
                          ordine.stato === 'completato' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ordine.stato}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">&euro; {ordine.totale.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button 
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Visualizza"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="p-1 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded"
                            title="Modifica"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Elimina"
                            onClick={() => eliminaOrdine(ordine._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {ordini.length} ordini su {totalPages} pagine
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              
              <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center">
                <span className="mx-2">{currentPage}</span>
              </div>
              
              <button 
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Wizard Nuovo Ordine */}
      {renderWizardNuovoOrdine()}
      
      {/* Configurazione Orari */}
      {renderConfigurazioneOrari()}
    </div>
  );
};

export default OrdiniPage;