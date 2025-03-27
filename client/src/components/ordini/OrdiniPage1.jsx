import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, PlusCircle, ArrowLeft, Filter, Download, 
  RefreshCw, Edit, Trash2, ChevronLeft, ChevronRight, Phone, 
  User, Clock, CreditCard, DollarSign, Truck, Home, Calendar,
  CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import OrdiniFilter from './OrdiniFilter';
import OrdiniList from './OrdiniList';
import OrdiniModal from './OrdiniWizard';
import StatisticheOrdini from './StatisticheOrdini';
import { 
  getOrdini, 
  getOrdine, 
  createOrdine, 
  updateOrdine, 
  deleteOrdine, 
  updateStatoOrdine 
} from '../../services/ordiniService';

const OrdiniPage = () => {
  // Stati per la gestione dati
  const [ordini, setOrdini] = useState([]);
  const [ordineSelezionato, setOrdineSelezionato] = useState(null);
  const [filtri, setFiltri] = useState({
    stato: '',
    dataInizio: null,
    dataFine: null,
    cliente: '',
    tipo: ''
  });
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const [itemPerPagina, setItemPerPagina] = useState(10);
  const [caricamento, setCaricamento] = useState(false);
  const [modalAperto, setModalAperto] = useState(false);
  const [visualizzaStatistiche, setVisualizzaStatistiche] = useState(false);
  
  const navigate = useNavigate();

  // Caricamento iniziale dati
  useEffect(() => {
    fetchOrdini();
  }, []);

  // Funzione per recuperare gli ordini dal backend
  // Modifica il componente OrdiniPage per gestire correttamente il formato dei dati
useEffect(() => {
  fetchOrdini();
}, []);

const fetchOrdini = async () => {
  try {
    setCaricamento(true);
    const risposta = await getOrdini();
    
    // Se la risposta dell'API è un oggetto con una proprietà dati
    if (risposta && risposta.data) {
      setOrdini(risposta.data);
    } 
    // Se la risposta è direttamente un array
    else if (Array.isArray(risposta)) {
      setOrdini(risposta);
    }
    // Se la risposta non è un array, inizializza con un array vuoto
    else {
      console.error('Il formato dei dati non è quello atteso:', risposta);
      setOrdini([]);
    }
  } catch (error) {
    console.error('Errore nel caricamento degli ordini:', error);
    setOrdini([]); // Inizializza con un array vuoto in caso di errore
  } finally {
    setCaricamento(false);
  }
};

  // Applicazione filtri
  const ordiniFiltrati = ordini.filter(ordine => {
    // Filtro per stato
    if (filtri.stato && ordine.stato !== filtri.stato) return false;
    
    // Filtro per date
    if (filtri.dataInizio && new Date(ordine.dataOrdine) < filtri.dataInizio) return false;
    if (filtri.dataFine && new Date(ordine.dataOrdine) > filtri.dataFine) return false;
    
    // Filtro per cliente
    if (filtri.cliente && !ordine.cliente.nome.toLowerCase().includes(filtri.cliente.toLowerCase())) return false;
    
    // Filtro per tipo ordine
    if (filtri.tipo && ordine.tipo !== filtri.tipo) return false;
    
    return true;
  });

  // Gestione paginazione
  const indiceUltimoItem = paginaCorrente * itemPerPagina;
  const indicePrimoItem = indiceUltimoItem - itemPerPagina;
  const ordiniPaginati = ordiniFiltrati.slice(indicePrimoItem, indiceUltimoItem);
  const totalePagine = Math.ceil(ordiniFiltrati.length / itemPerPagina);

  // Selezione ordine
  const handleSelectOrdine = (ordine) => {
    setOrdineSelezionato(ordine);
  };

  const handleCloseDettagli = () => {
    setOrdineSelezionato(null);
  };

  // Apertura modale per nuovo ordine
  const handleOpenModal = () => {
    setModalAperto(true);
  };

  const handleCloseModal = () => {
    setModalAperto(false);
  };

  // Gestione salvataggio nuovo ordine
  const handleSalvaOrdine = async (nuovoOrdine) => {
    try {
      setCaricamento(true);
      
      const response = await createOrdine(nuovoOrdine);
      setOrdini([...ordini, response.data]);
      
      handleCloseModal();
      alert('Ordine creato con successo!');
    } catch (error) {
      console.error('Errore durante il salvataggio dell\'ordine:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  // Cambio stato ordine
  const handleCambioStato = async (idOrdine, nuovoStato) => {
    try {
      setCaricamento(true);
      
      const response = await updateStatoOrdine(idOrdine, nuovoStato);
      
      // Aggiornamento lista ordini
      setOrdini(ordini.map(ordine => 
        ordine._id === idOrdine ? response.data : ordine
      ));
      
      // Aggiornamento ordine selezionato
      if (ordineSelezionato && ordineSelezionato._id === idOrdine) {
        setOrdineSelezionato(response.data);
      }
      
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  // Eliminazione ordine
  const handleDeleteOrdine = async (idOrdine) => {
    if (window.confirm('Sei sicuro di voler eliminare questo ordine?')) {
      try {
        setCaricamento(true);
        
        await deleteOrdine(idOrdine);
        
        // Rimozione dalla lista
        setOrdini(ordini.filter(ordine => ordine._id !== idOrdine));
        
        // Se era l'ordine selezionato, deselezionalo
        if (ordineSelezionato && ordineSelezionato._id === idOrdine) {
          setOrdineSelezionato(null);
        }
        
        alert('Ordine eliminato con successo!');
      } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'ordine:', error);
        alert('Si è verificato un errore. Riprova più tardi.');
      } finally {
        setCaricamento(false);
      }
    }
  };

  // Esportazione ordini in CSV
  const exportCSV = () => {
    const headers = ['ID', 'Cliente', 'Indirizzo', 'Telefono', 'Data', 'Totale', 'Stato', 'Tipo', 'Prodotti'];
    
    const rows = ordini.map(ordine => [
      ordine._id,
      ordine.cliente?.nome || 'N/D',
      ordine.indirizzo || 'N/D',
      ordine.telefono || 'N/D',
      new Date(ordine.dataOrdine).toLocaleString(),
      `€ ${ordine.totale.toFixed(2)}`,
      ordine.stato,
      ordine.tipo,
      ordine.prodotti?.map(p => `${p.quantita}x ${p.nome}`).join(', ') || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ordini_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Colore per lo stato dell'ordine
  const getStatoColor = (stato) => {
    switch (stato.toLowerCase()) {
      case 'nuovo': return 'bg-blue-100 text-blue-800';
      case 'in preparazione': return 'bg-amber-100 text-amber-800';
      case 'in consegna': return 'bg-purple-100 text-purple-800';
      case 'consegnato': return 'bg-green-100 text-green-800';
      case 'annullato': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle visualizzazione statistiche
  const toggleStatistiche = () => {
    setVisualizzaStatistiche(!visualizzaStatistiche);
  };

  // Formattazione prezzo
  const formatPrezzo = (prezzo) => {
    return `€ ${prezzo.toFixed(2)}`.replace('.', ',');
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 min-h-screen p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="text-gray-600" />
          </button>
          <div className="flex items-center">
            <ShoppingCart className="text-red-500 mr-2" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Gestione Ordini</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className={`px-3 py-2 rounded-lg shadow-md flex items-center space-x-2 transition-colors ${
              visualizzaStatistiche ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={toggleStatistiche}
          >
            <FileText size={18} />
            <span className="text-sm">Statistiche</span>
          </button>
          <button 
            className="bg-white rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            onClick={exportCSV}
          >
            <Download className="text-red-600" size={18} />
            <span className="text-gray-700 text-sm">Esporta</span>
          </button>
          <button 
            className="bg-red-500 rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-red-600 transition-colors text-white"
            onClick={handleOpenModal}
          >
            <PlusCircle size={18} />
            <span className="text-sm">Nuovo Ordine</span>
          </button>
        </div>
      </header>
      
      {/* Contenuto principale */}
      {visualizzaStatistiche ? (
        <StatisticheOrdini ordini={ordini} onClose={toggleStatistiche} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Filtri */}
          <OrdiniFilter 
            filtri={filtri} 
            setFiltri={setFiltri} 
            onRefresh={fetchOrdini}
            caricamento={caricamento}
          />
          
          {/* Elenco ordini e dettaglio */}
          <div className="flex gap-6">
            <div className={`bg-white rounded-xl shadow-lg ${ordineSelezionato ? 'w-2/3' : 'w-full'}`}>
              <OrdiniList 
                ordini={ordiniPaginati}
                onSelectOrdine={handleSelectOrdine}
                onDeleteOrdine={handleDeleteOrdine}
                onChangeStato={handleCambioStato}
                ordineSelezionato={ordineSelezionato}
                caricamento={caricamento}
                getStatoColor={getStatoColor}
              />
              
              {/* Paginazione */}
              {!caricamento && ordiniPaginati.length > 0 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Mostrando {ordiniFiltrati.length > 0 ? indicePrimoItem + 1 : 0} - {Math.min(indiceUltimoItem, ordiniFiltrati.length)} di {ordiniFiltrati.length} ordini
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                      disabled={paginaCorrente === 1}
                      onClick={() => setPaginaCorrente(prev => Math.max(prev - 1, 1))}
                    >
                      <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                    {[...Array(totalePagine)].map((_, index) => (
                      <button 
                        key={index}
                        className={`w-8 h-8 rounded-lg border ${paginaCorrente === index + 1 ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 hover:bg-gray-100'}`}
                        onClick={() => setPaginaCorrente(index + 1)}
                      >
                        {index + 1}
                      </button>
                    )).slice(Math.max(0, paginaCorrente - 3), Math.min(totalePagine, paginaCorrente + 2))}
                    <button 
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                      disabled={paginaCorrente === totalePagine}
                      onClick={() => setPaginaCorrente(prev => Math.min(prev + 1, totalePagine))}
                    >
                      <ChevronRight size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Dettaglio ordine */}
            {ordineSelezionato && (
              <div className="w-1/3 bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Dettaglio Ordine</h2>
                    <p className="text-sm text-gray-500">#{ordineSelezionato._id?.substring(0, 8)}</p>
                  </div>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={handleCloseDettagli}
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>
                
                {/* Stato ordine */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatoColor(ordineSelezionato.stato)}`}>
                    {ordineSelezionato.stato}
                  </span>
                  <span className="ml-2 text-gray-500 text-sm">{ordineSelezionato.tipo}</span>
                </div>
                
                {/* Info cliente */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <User className="text-red-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">{ordineSelezionato.cliente?.nome || 'Cliente non specificato'}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Phone size={14} className="mr-1" />
                        <span>{ordineSelezionato.telefono || 'N/D'}</span>
                      </div>
                      {ordineSelezionato.indirizzo && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Home size={14} className="mr-1" />
                          <span>{ordineSelezionato.indirizzo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Data e ora */}
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-600 mr-1" />
                    <span className="text-sm text-gray-700">
                      {new Date(ordineSelezionato.dataOrdine).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-600 mr-1" />
                    <span className="text-sm text-gray-700">
                      {new Date(ordineSelezionato.dataOrdine).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                
                {/* Prodotti */}
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Prodotti ordinati</h3>
                  <div className="space-y-2">
                    {ordineSelezionato.prodotti?.map((prodotto, index) => (
                      <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">
                            {prodotto.quantita}x
                          </span>
                          <div>
                            <p className="font-medium">{prodotto.nome}</p>
                            {prodotto.note && <p className="text-xs text-gray-500">{prodotto.note}</p>}
                          </div>
                        </div>
                        <span className="font-medium">{formatPrezzo(prodotto.prezzo * prodotto.quantita)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Riepilogo costi */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Subtotale:</span>
                    <span>{formatPrezzo(ordineSelezionato.subtotale || ordineSelezionato.totale)}</span>
                  </div>
                  {ordineSelezionato.costoConsegna > 0 && (
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Consegna:</span>
                      <span>{formatPrezzo(ordineSelezionato.costoConsegna)}</span>
                    </div>
                  )}
                  {ordineSelezionato.sconto > 0 && (
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Sconto:</span>
                      <span className="text-green-600">-{formatPrezzo(ordineSelezionato.sconto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                    <span>Totale:</span>
                    <span>{formatPrezzo(ordineSelezionato.totale)}</span>
                  </div>
                </div>
                
                {/* Metodo di pagamento */}
                <div className="flex items-center mb-4">
                  <CreditCard size={16} className="text-gray-600 mr-2" />
                  <span className="text-gray-700">
                    {ordineSelezionato.metodoPagamento || 'Contanti alla consegna'}
                  </span>
                </div>
                
                {/* Note */}
                {ordineSelezionato.note && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-1">Note</h3>
                    <p className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                      {ordineSelezionato.note}
                    </p>
                  </div>
                )}
                
                {/* Azioni */}
                <div className="flex flex-col space-y-2 mt-6">
                  {ordineSelezionato.stato !== 'consegnato' && ordineSelezionato.stato !== 'annullato' && (
                    <div className="grid grid-cols-2 gap-2">
                      {ordineSelezionato.stato === 'nuovo' && (
                        <button 
                          className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center justify-center"
                          onClick={() => handleCambioStato(ordineSelezionato._id, 'in preparazione')}
                        >
                          <Clock size={16} className="mr-1" />
                          <span>Inizia preparazione</span>
                        </button>
                      )}
                      
                      {ordineSelezionato.stato === 'in preparazione' && (
                        <button 
                          className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center justify-center"
                          onClick={() => handleCambioStato(ordineSelezionato._id, 'in consegna')}
                        >
                          <Truck size={16} className="mr-1" />
                          <span>Avvia consegna</span>
                        </button>
                      )}
                      
                      {ordineSelezionato.stato === 'in consegna' && (
                        <button 
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center justify-center"
                          onClick={() => handleCambioStato(ordineSelezionato._id, 'consegnato')}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          <span>Completa ordine</span>
                        </button>
                      )}
                      
                      <button 
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center justify-center"
                        onClick={() => handleCambioStato(ordineSelezionato._id, 'annullato')}
                      >
                        <AlertCircle size={16} className="mr-1" />
                        <span>Annulla ordine</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button 
                      className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 flex items-center justify-center flex-1 mr-2"
                      onClick={() => {/* Funzionalità modifica */}}
                    >
                      <Edit size={16} className="mr-1" />
                      <span>Modifica</span>
                    </button>
                    
                    <button 
                      className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 flex items-center justify-center flex-1"
                      onClick={() => handleDeleteOrdine(ordineSelezionato._id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal nuovo ordine */}
      {modalAperto && (
        <OrdiniModal 
          onClose={handleCloseModal}
          onSave={handleSalvaOrdine}
        />
      )}
    </div>
  );
};

export default OrdiniPage;