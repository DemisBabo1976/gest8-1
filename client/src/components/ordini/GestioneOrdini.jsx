import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, Settings, ArrowLeft, Save, 
  GridIcon, List, Plus, X, CheckCircle, AlertCircle,
  ChevronLeft, ChevronRight, Edit, Trash2, RefreshCw,
  ShoppingBag, Filter, FileText, User, Phone, Home,
  Truck, DollarSign, Search
} from 'lucide-react';

// Importa il componente DettaglioOrdine
import DettaglioOrdine from './DettaglioOrdine';

const GestioneOrdini = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [isLoading, setIsLoading] = useState(false);
  
  // Stati per la configurazione orari e turni
  const [configurazione, setConfigurazione] = useState({
    orarioApertura: '18:00',
    orarioChiusura: '22:00',
    intervalloSlot: 10, // minuti
    maxOrdiniPerSlot: 5,
    giornoChiusura: 1, // 0 = domenica, 1 = lunedì, ecc.
    festivita: ['2025-12-25', '2025-12-31', '2025-01-01']
  });
  
  // Stato per gli slot orari generati
  const [slotOrari, setSlotOrari] = useState([]);
  
  // Stato per mostrare/nascondere il pannello configurazione
  const [showConfigurazione, setShowConfigurazione] = useState(false);
  
  // Stato per gli ordini
  const [ordini, setOrdini] = useState([
    {
      id: 'ord001',
      clienteNome: 'Mario Rossi',
      clienteTelefono: '3331234567',
      data: '2025-03-24',
      orario: '19:00',
      stato: 'confermato', // confermato, in preparazione, completato, annullato
      tipo: 'asporto', // asporto, consegna, ritiro
      articoli: [
        { nome: 'Margherita', quantita: 2, prezzo: 5.50 },
        { nome: 'Diavola', quantita: 1, prezzo: 6.50 }
      ],
      totale: 17.50,
      note: 'Senza cipolla'
    },
    {
      id: 'ord002',
      clienteNome: 'Giulia Bianchi',
      clienteTelefono: '3339876543',
      data: '2025-03-24',
      orario: '19:10',
      stato: 'in preparazione',
      tipo: 'consegna',
      indirizzo: 'Via Roma 123',
      articoli: [
        { nome: 'Capricciosa', quantita: 1, prezzo: 8.50 },
        { nome: 'Diavola', quantita: 1, prezzo: 6.50 },
        { nome: 'Coca Cola', quantita: 2, prezzo: 2.50 }
      ],
      totale: 20.00,
      note: ''
    }
  ]);
  
  // Stato per filtri di ricerca
  const [filtri, setFiltri] = useState({
    dataSelezionata: new Date().toISOString().split('T')[0],
    stato: 'tutti',
    ricerca: ''
  });
  
  // Stato per mostrare dettaglio ordine
  const [ordineSelezionato, setOrdineSelezionato] = useState(null);
  const [showDettaglioOrdine, setShowDettaglioOrdine] = useState(false);
  const [isNuovoOrdine, setIsNuovoOrdine] = useState(false);
  
  // Funzione per generare gli slot orari in base alla configurazione
  const generaSlotOrari = useCallback(() => {
    const slots = [];
    const [oraApertura, minApertura] = configurazione.orarioApertura.split(':').map(Number);
    const [oraChiusura, minChiusura] = configurazione.orarioChiusura.split(':').map(Number);
    
    const dataInizio = new Date();
    dataInizio.setHours(oraApertura, minApertura, 0);
    
    const dataFine = new Date();
    dataFine.setHours(oraChiusura, minChiusura, 0);
    
    // Se oggi è il giorno di chiusura, mostriamo il messaggio ma generiamo comunque gli slot
    const isGiornoChiusura = new Date().getDay() === configurazione.giornoChiusura;
    
    // Controlla se oggi è una festività
    const oggi = new Date().toISOString().split('T')[0];
    const isFestivo = configurazione.festivita.includes(oggi);
    
    let slotCorrente = new Date(dataInizio);
    
    while (slotCorrente < dataFine) {
      const oraSlot = slotCorrente.getHours().toString().padStart(2, '0');
      const minSlot = slotCorrente.getMinutes().toString().padStart(2, '0');
      const orarioSlot = `${oraSlot}:${minSlot}`;
      
      // Genera ordini casuali per demo
      const ordiniOccupati = Math.floor(Math.random() * (configurazione.maxOrdiniPerSlot + 1));
      const isSuperatoLimite = Math.random() > 0.7; // Alcuni slot superano il limite
      
      slots.push({
        orario: orarioSlot,
        data: new Date(slotCorrente),
        ordiniOccupati: isSuperatoLimite ? configurazione.maxOrdiniPerSlot + 1 : ordiniOccupati,
        maxOrdini: configurazione.maxOrdiniPerSlot,
        isCompleto: isSuperatoLimite || ordiniOccupati >= configurazione.maxOrdiniPerSlot,
        ordini: [] // Qui andranno gli ordini effettivi
      });
      
      // Incrementa lo slot corrente
      slotCorrente.setMinutes(slotCorrente.getMinutes() + configurazione.intervalloSlot);
    }
    
    setSlotOrari(slots);
  }, [configurazione]);
  
  // Genera gli slot orari all'avvio e quando cambia la configurazione
  useEffect(() => {
    generaSlotOrari();
  }, [generaSlotOrari]);
  
  // Funzione per gestire il salvataggio della configurazione
  const salvaConfigurazione = () => {
    // Qui in una implementazione reale salveresti su DB
    setShowConfigurazione(false);
    generaSlotOrari();
  };
  
  // Funzione per cambiare la vista
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'card' ? 'list' : 'card');
  };
  
  // Funzione per forzare il superamento del limite ordini
  const forzaSuperamentoLimite = (index) => {
    if (window.confirm('Sei sicuro di voler forzare il superamento del limite ordini per questo slot?')) {
      const nuoviSlot = [...slotOrari];
      nuoviSlot[index].maxOrdini = nuoviSlot[index].ordiniOccupati;
      nuoviSlot[index].isCompleto = false;
      setSlotOrari(nuoviSlot);
    }
  };
  
  // Funzione per aggiungere un ordine a uno slot
  const aggiungiOrdine = (index) => {
    // Apri il form nuovo ordine preimpostato con lo slot orario selezionato
    const slotSelezionato = slotOrari[index];
    
    setIsNuovoOrdine(true);
    setOrdineSelezionato({
      clienteNome: '',
      clienteTelefono: '',
      data: filtri.dataSelezionata,
      orario: slotSelezionato.orario,
      tipo: 'asporto',
      articoli: [],
      note: ''
    });
    setShowDettaglioOrdine(true);
  };
  
  // Funzione per rimuovere un ordine da uno slot
  const rimuoviOrdine = (index) => {
    const nuoviSlot = [...slotOrari];
    if (nuoviSlot[index].ordiniOccupati > 0) {
      nuoviSlot[index].ordiniOccupati -= 1;
      nuoviSlot[index].isCompleto = false;
      setSlotOrari(nuoviSlot);
    }
  };
  
  // Funzioni per la gestione degli ordini
  const apriNuovoOrdine = () => {
    setIsNuovoOrdine(true);
    setOrdineSelezionato({
      clienteNome: '',
      clienteTelefono: '',
      data: filtri.dataSelezionata,
      orario: '19:00',
      tipo: 'asporto',
      articoli: [],
      note: ''
    });
    setShowDettaglioOrdine(true);
  };
  
  const apriDettaglioOrdine = (ordine) => {
    setIsNuovoOrdine(false);
    setOrdineSelezionato(ordine);
    setShowDettaglioOrdine(true);
  };
  
  const chiudiDettaglioOrdine = () => {
    setShowDettaglioOrdine(false);
    setOrdineSelezionato(null);
  };
  
  const salvaOrdine = (ordine) => {
    if (isNuovoOrdine) {
      // Genera un nuovo ID
      const nuovoId = 'ord' + (ordini.length + 1).toString().padStart(3, '0');
      
      // Aggiungi il nuovo ordine
      const nuovoOrdine = {
        ...ordine,
        id: nuovoId,
        stato: 'confermato'
      };
      
      setOrdini([...ordini, nuovoOrdine]);
      
      // Aggiorna anche lo slot orario
      const slotIndex = slotOrari.findIndex(slot => slot.orario === ordine.orario);
      if (slotIndex !== -1) {
        aggiornaOccupazioneSlot(slotIndex, 1);
      }
    } else {
      // Aggiorna l'ordine esistente
      const nuoviOrdini = ordini.map(o => 
        o.id === ordine.id ? ordine : o
      );
      setOrdini(nuoviOrdini);
    }
    
    // Chiudi il dettaglio
    chiudiDettaglioOrdine();
  };
  
  const eliminaOrdine = (id) => {
    // Trova l'ordine per ottenere l'orario prima di eliminarlo
    const ordine = ordini.find(o => o.id === id);
    
    if (ordine) {
      // Elimina l'ordine
      const nuoviOrdini = ordini.filter(o => o.id !== id);
      setOrdini(nuoviOrdini);
      
      // Aggiorna lo slot orario
      const slotIndex = slotOrari.findIndex(slot => slot.orario === ordine.orario);
      if (slotIndex !== -1) {
        aggiornaOccupazioneSlot(slotIndex, -1);
      }
      
      // Chiudi il dettaglio
      chiudiDettaglioOrdine();
    }
  };
  
  // Funzione per aggiornare l'occupazione di uno slot
  const aggiornaOccupazioneSlot = (index, delta) => {
    const nuoviSlot = [...slotOrari];
    nuoviSlot[index].ordiniOccupati += delta;
    nuoviSlot[index].isCompleto = nuoviSlot[index].ordiniOccupati >= nuoviSlot[index].maxOrdini;
    
    if (nuoviSlot[index].ordiniOccupati < 0) {
      nuoviSlot[index].ordiniOccupati = 0;
    }
    
    setSlotOrari(nuoviSlot);
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
  
  // Filtra gli ordini in base ai filtri attuali
  const ordiniFiltered = ordini.filter(ordine => {
    // Filtra per data
    if (ordine.data !== filtri.dataSelezionata) {
      return false;
    }
    
    // Filtra per stato
    if (filtri.stato !== 'tutti' && ordine.stato !== filtri.stato) {
      return false;
    }
    
    // Filtra per testo di ricerca
    if (filtri.ricerca) {
      const ricerca = filtri.ricerca.toLowerCase();
      return (
        ordine.clienteNome.toLowerCase().includes(ricerca) ||
        ordine.clienteTelefono.includes(ricerca) ||
        ordine.id.toLowerCase().includes(ricerca)
      );
    }
    
    return true;
  });
  
  // Array dei giorni della settimana per il selector
  const giorniSettimana = [
    'Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'
  ];
  
  // Funzione per aggiungere una festività
  const aggiungiFestivita = () => {
    const nuovaData = prompt('Inserisci una data (formato YYYY-MM-DD):');
    if (nuovaData && /^\d{4}-\d{2}-\d{2}$/.test(nuovaData)) {
      setConfigurazione({
        ...configurazione,
        festivita: [...configurazione.festivita, nuovaData]
      });
    } else if (nuovaData) {
      alert('Formato data non valido. Usa YYYY-MM-DD');
    }
  };
  
  // Funzione per rimuovere una festività
  const rimuoviFestivita = (index) => {
    const nuoveFestivita = [...configurazione.festivita];
    nuoveFestivita.splice(index, 1);
    setConfigurazione({
      ...configurazione,
      festivita: nuoveFestivita
    });
  };
  
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button 
            className="bg-white rounded-lg p-2 shadow hover:bg-gray-100 transition-colors"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="text-red-500" size={24} />
          </button>
          <h1 className="text-2xl font-bold text-red-700">Gestione Ordini</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className="bg-white rounded-lg px-3 py-2 shadow flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            onClick={toggleViewMode}
          >
            {viewMode === 'card' ? (
              <>
                <List className="text-blue-500" size={18} />
                <span className="text-gray-700">Vista Lista</span>
              </>
            ) : (
              <>
                <GridIcon className="text-blue-500" size={18} />
                <span className="text-gray-700">Vista Card</span>
              </>
            )}
          </button>
          
          <button 
            className="bg-white rounded-lg px-3 py-2 shadow flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            onClick={() => setShowConfigurazione(!showConfigurazione)}
          >
            <Settings className="text-orange-500" size={18} />
            <span className="text-gray-700">Configurazione</span>
          </button>
          
          <div className="bg-white rounded-lg px-4 py-2 shadow flex items-center">
            <Clock className="text-orange-500 mr-2" size={18} />
            <span className="text-gray-700">
              {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </header>
      
      {/* Pannello di configurazione */}
      {showConfigurazione && (
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Configurazione Orari e Turni</h2>
            <div className="flex space-x-2">
              <button 
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center hover:bg-green-200 transition-colors"
                onClick={salvaConfigurazione}
              >
                <Save size={18} className="mr-2" />
                Salva
              </button>
              <button 
                className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowConfigurazione(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2">Orari</h3>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Orario Apertura</label>
                <input 
                  type="time" 
                  className="w-full border rounded-lg p-2"
                  value={configurazione.orarioApertura}
                  onChange={(e) => setConfigurazione({...configurazione, orarioApertura: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Orario Chiusura</label>
                <input 
                  type="time" 
                  className="w-full border rounded-lg p-2"
                  value={configurazione.orarioChiusura}
                  onChange={(e) => setConfigurazione({...configurazione, orarioChiusura: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Intervallo Slot (minuti)</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={configurazione.intervalloSlot}
                  onChange={(e) => setConfigurazione({...configurazione, intervalloSlot: parseInt(e.target.value)})}
                >
                  <option value="5">5 minuti</option>
                  <option value="10">10 minuti</option>
                  <option value="15">15 minuti</option>
                  <option value="20">20 minuti</option>
                  <option value="30">30 minuti</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Ordini per Slot</label>
                <input 
                  type="number" 
                  className="w-full border rounded-lg p-2"
                  min="1"
                  max="20"
                  value={configurazione.maxOrdiniPerSlot}
                  onChange={(e) => setConfigurazione({...configurazione, maxOrdiniPerSlot: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2">Giorni</h3>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Giorno di Chiusura</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={configurazione.giornoChiusura}
                  onChange={(e) => setConfigurazione({...configurazione, giornoChiusura: parseInt(e.target.value)})}
                >
                  {giorniSettimana.map((giorno, index) => (
                    <option key={index} value={index}>{giorno}</option>
                  ))}
                </select>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm text-gray-600">Festività</label>
                  <button 
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                    onClick={aggiungiFestivita}
                  >
                    <Plus size={16} className="mr-1" />
                    Aggiungi
                  </button>
                </div>
                
                <div className="max-h-40 overflow-y-auto mt-2 border rounded-lg p-2">
                  {configurazione.festivita.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Nessuna festività configurata</p>
                  ) : (
                    <ul className="space-y-1">
                      {configurazione.festivita.map((festa, index) => (
                        <li key={index} className="flex justify-between items-center text-sm">
                          <span>{new Date(festa).toLocaleDateString('it-IT')}</span>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => rimuoviFestivita(index)}
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2">Anteprima</h3>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Orario operativo:</p>
                <p className="font-medium text-gray-800">
                  {configurazione.orarioApertura} - {configurazione.orarioChiusura}
                </p>
                
                <p className="text-sm text-gray-600 mt-2">Intervallo tra slot:</p>
                <p className="font-medium text-gray-800">{configurazione.intervalloSlot} minuti</p>
                
                <p className="text-sm text-gray-600 mt-2">Giorno di chiusura:</p>
                <p className="font-medium text-gray-800">{giorniSettimana[configurazione.giornoChiusura]}</p>
                
                <p className="text-sm text-gray-600 mt-2">Capacità per slot:</p>
                <p className="font-medium text-gray-800">{configurazione.maxOrdiniPerSlot} ordini</p>
                
                <p className="text-sm text-gray-600 mt-2">Totale slot giornalieri:</p>
                <p className="font-medium text-gray-800">{slotOrari.length} slot</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Visualizzazione degli slot orari */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Slot Orari - {new Date().toLocaleDateString('it-IT', {weekday: 'long', day: 'numeric', month: 'long'})}
          </h2>
          
          <button 
            className={`bg-white rounded-lg px-3 py-2 shadow flex items-center space-x-2 hover:bg-gray-100 transition-colors ${isLoading ? 'opacity-50' : ''}`}
            onClick={generaSlotOrari}
            disabled={isLoading}
          >
            <RefreshCw className={`text-green-500 ${isLoading ? 'animate-spin' : ''}`} size={18} />
            <span className="text-gray-700">Aggiorna Slot</span>
          </button>
        </div>
        
        {/* Controlli giorno precedente/successivo */}
        <div className="flex justify-center items-center space-x-4 mb-4">
          <button className="bg-white rounded-lg p-2 shadow hover:bg-gray-100">
            <ChevronLeft className="text-gray-700" size={24} />
          </button>
          
          <div className="bg-white rounded-lg px-4 py-2 shadow flex items-center">
            <Calendar className="text-orange-500 mr-2" size={18} />
            <span className="text-gray-700 font-medium">
              {new Date().toLocaleDateString('it-IT', {day: 'numeric', month: 'long', year: 'numeric'})}
            </span>
          </div>
          
          <button className="bg-white rounded-lg p-2 shadow hover:bg-gray-100">
            <ChevronRight className="text-gray-700" size={24} />
          </button>
        </div>
        
        {/* Verifica se è un giorno di chiusura */}
        {new Date().getDay() === configurazione.giornoChiusura && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 flex items-center justify-center">
            <AlertCircle className="mr-2" size={20} />
            <span className="font-medium">Oggi è giorno di chiusura ({giorniSettimana[configurazione.giornoChiusura]})</span>
          </div>
        )}
        
        {/* Visualizzazione in modalità card */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {slotOrari.map((slot, index) => (
              <div 
                key={index} 
                className={`
                  bg-white rounded-xl p-4 shadow-md
                  ${slot.isCompleto ? 'border-2 border-red-300' : 'hover:shadow-lg transition-shadow'}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Clock className={slot.isCompleto ? "text-red-500" : "text-green-500"} size={16} />
                    <h3 className="font-bold text-gray-800 ml-2">{slot.orario}</h3>
                  </div>
                  
                  {slot.isCompleto ? (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Completo</span>
                  ) : (
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Disponibile</span>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Occupazione: {slot.ordiniOccupati}/{slot.maxOrdini}</span>
                    <span>{Math.round((slot.ordiniOccupati / slot.maxOrdini) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        slot.isCompleto ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (slot.ordiniOccupati / slot.maxOrdini) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between space-x-2">
                  <button 
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded-lg text-sm flex items-center justify-center transition-colors"
                    onClick={() => aggiungiOrdine(index)}
                  >
                    <Plus size={16} className="mr-1" />
                    Aggiungi
                  </button>
                  
                  <button 
                    className={`
                      flex-1 py-1 px-2 rounded-lg text-sm flex items-center justify-center transition-colors
                      ${slot.ordiniOccupati > 0 
                        ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                    onClick={() => rimuoviOrdine(index)}
                    disabled={slot.ordiniOccupati === 0}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Visualizzazione in modalità lista */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Orario</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Stato</th>
                  <th className="px-4 py-3 text-center text-gray-700 font-medium">Occupazione</th>
                  <th className="px-4 py-3 text-right text-gray-700 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {slotOrari.map((slot, index) => (
                  <tr key={index} className={`border-t ${slot.isCompleto ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Clock className={slot.isCompleto ? "text-red-500" : "text-green-500"} size={16} />
                        <span className="ml-2 font-medium">{slot.orario}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {slot.isCompleto ? (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Completo</span>
                      ) : (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Disponibile</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center space-x-2">
                        <span className="text-sm">{slot.ordiniOccupati}/{slot.maxOrdini}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2 inline-block">
                          <div 
                            className={`h-2 rounded-full ${slot.isCompleto ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (slot.ordiniOccupati / slot.maxOrdini) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1 rounded-lg transition-colors"
                          onClick={() => aggiungiOrdine(index)}
                          title="Aggiungi ordine"
                        >
                          <Plus size={16} />
                        </button>
                        
                        <button 
                          className={`
                            p-1 rounded-lg transition-colors
                            ${slot.ordiniOccupati > 0 
                              ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                          `}
                          onClick={() => rimuoviOrdine(index)}
                          disabled={slot.ordiniOccupati === 0}
                          title="Rimuovi ordine"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <button 
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-1 rounded-lg transition-colors"
                          onClick={() => alert('Dettaglio slot non ancora implementato')}
                          title="Visualizza dettaglio"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestioneOrdini;