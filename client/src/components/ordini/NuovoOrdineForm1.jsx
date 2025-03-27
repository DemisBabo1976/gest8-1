import React, { useState, useEffect } from 'react';
import { 
  X, ChevronRight, User, Phone, Calendar, Clock, ShoppingCart,
  Package, Tag, Search, Plus, Minus, Trash2, CreditCard, FileText,
  CheckCircle, Home, DollarSign, RefreshCw, Truck, AlertTriangle,
  Star, Award
} from 'lucide-react';
import { createOrdine } from '../../services/ordiniService';
import { getClienti } from '../../services/clientiService';
import { getProdotti } from '../../services/menuService';
import { getFasceOrarie } from '../../services/ordiniService';

const NuovoOrdineForm = ({ onClose }) => {
  // Stati per il form
  const [step, setStep] = useState(1); // Step del form
  const [caricamento, setCaricamento] = useState(false);
  const [clienti, setClienti] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [fasceOrarie, setFasceOrarie] = useState([]);
  const [filtroClienti, setFiltroClienti] = useState('');
  const [filtroProdotti, setFiltroProdotti] = useState('');
  const [clienteSelezionato, setClienteSelezionato] = useState(null);
  const [nuovoCliente, setNuovoCliente] = useState({
    nome: '',
    telefono: '',
    indirizzo: ''
  });
  const [carrello, setCarrello] = useState([]);
  const [note, setNote] = useState('');
  const [dataConsegna, setDataConsegna] = useState(new Date().toISOString().split('T')[0]);
  const [oraConsegna, setOraConsegna] = useState('');
  const [tipoOrdine, setTipoOrdine] = useState('Asporto');
  const [metodoPagamento, setMetodoPagamento] = useState('Contanti');
  const [numeroTavolo, setNumeroTavolo] = useState('');
  const [indirizzoConsegna, setIndirizzoConsegna] = useState({
    via: '',
    civico: '',
    citta: '',
    cap: '',
    note: ''
  });
  const [sconto, setSconto] = useState(0);
  const [puntiUtilizzati, setPuntiUtilizzati] = useState(0);
  const [errori, setErrori] = useState({});

  // Caricamento dati iniziali
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCaricamento(true);
        // Carica clienti
        const clientiData = await getClienti();
        setClienti(clientiData);
        
        // Carica prodotti
        const prodottiData = await getProdotti();
        setProdotti(prodottiData);
        
        // Carica fasce orarie per oggi
        const oggi = new Date().toISOString().split('T')[0];
        const fasceData = await getFasceOrarie(oggi);
        setFasceOrarie(fasceData.slots || []);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      } finally {
        setCaricamento(false);
      }
    };

    fetchData();
  }, []);

  // Effetto per caricare nuove fasce orarie quando cambia la data
  useEffect(() => {
    const fetchFasceOrarie = async () => {
      try {
        const fasceData = await getFasceOrarie(dataConsegna);
        setFasceOrarie(fasceData.slots || []);
        // Reset dell'ora selezionata
        setOraConsegna('');
      } catch (error) {
        console.error('Errore nel caricamento delle fasce orarie:', error);
      }
    };

    if (dataConsegna) {
      fetchFasceOrarie();
    }
  }, [dataConsegna]);

  // Calcola totali
// Modifica alla funzione calcolaTotale
const calcolaTotale = () => {
  if (!carrello || carrello.length === 0) return 0;
  
  return carrello.reduce((sum, item) => {
    // Assicuriamoci che tutti i valori siano definiti
    const prezzo = item.prezzo || 0;
    const prezzoPromo = item.prezzoPromo || 0;
    const inPromozione = Boolean(item.inPromozione);
    const quantita = item.quantita || 1;
    
    const prezzoEffettivo = inPromozione ? prezzoPromo : prezzo;
    return sum + (prezzoEffettivo * quantita);
  }, 0);
};

// Modifica a calcolaTotaleConSconto
const calcolaTotaleConSconto = () => {
  return Math.max(0, calcolaTotale() - (sconto || 0));
};

  // Filtra clienti
  const clientiFiltrati = clienti.filter(cliente => {
    if (!filtroClienti) return true;
    
    const query = filtroClienti.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(query) ||
      cliente.telefono.includes(query)
    );
  });

  // Filtra prodotti
  const prodottiFiltrati = prodotti.filter(prodotto => {
    if (!filtroProdotti) return prodotto.attivo; // Solo prodotti attivi di default
    
    const query = filtroProdotti.toLowerCase();
    return (
      prodotto.attivo && (
        prodotto.nome.toLowerCase().includes(query) ||
        prodotto.categoria.toLowerCase().includes(query)
      )
    );
  });

  // Seleziona cliente
  const handleSelectCliente = (cliente) => {
    setClienteSelezionato(cliente);
    
    // Se il cliente ha un indirizzo e il tipo ordine è Delivery, lo precompila
    if (cliente.indirizzo && tipoOrdine === 'Delivery') {
      // Supponiamo che l'indirizzo sia nel formato "Via, Civico, Città, CAP"
      const parts = cliente.indirizzo.split(',').map(part => part.trim());
      setIndirizzoConsegna({
        via: parts[0] || '',
        civico: parts[1] || '',
        citta: parts[2] || '',
        cap: parts[3] || '',
        note: ''
      });
    }
  };

  // Reset cliente
  const handleResetCliente = () => {
    setClienteSelezionato(null);
    setNuovoCliente({
      nome: '',
      telefono: '',
      indirizzo: ''
    });
  };

  // Aggiungi prodotto al carrello
const handleAggiungiProdotto = (prodotto) => {
  // Verifica se il prodotto è già nel carrello
  const index = carrello.findIndex(item => item._id === prodotto._id);
  
  if (index >= 0) {
    // Incrementa la quantità se esiste già
    const newCarrello = [...carrello];
    newCarrello[index].quantita += 1;
    setCarrello(newCarrello);
  } else {
    // Aggiungi nuovo prodotto al carrello
    setCarrello([...carrello, {
      _id: prodotto._id,
      nome: prodotto.nome,
      prezzo: prodotto.prezzo || 0,  // Aggiungo || 0 per sicurezza
      prezzoPromo: prodotto.prezzoPromo || 0,  // Aggiungo || 0 per sicurezza
      inPromozione: prodotto.inPromozione || false,  // Aggiungo || false per sicurezza
      quantita: 1,
      nota: ''
    }]);
  }
};

  // Modifica quantità prodotto
  const handleUpdateQuantita = (index, delta) => {
    const newCarrello = [...carrello];
    newCarrello[index].quantita = Math.max(1, newCarrello[index].quantita + delta);
    setCarrello(newCarrello);
  };

  // Modifica nota prodotto
  const handleUpdateNota = (index, nota) => {
    const newCarrello = [...carrello];
    newCarrello[index].nota = nota;
    setCarrello(newCarrello);
  };

  // Rimuovi prodotto dal carrello
  const handleRemoveProdotto = (index) => {
    setCarrello(carrello.filter((_, i) => i !== index));
  };

  // Passa allo step successivo
  const handleNextStep = () => {
    let erroriValidazione = {};
    
    // Validazione Step 1 (Selezione cliente)
    if (step === 1) {
      if (!clienteSelezionato && (!nuovoCliente.nome || !nuovoCliente.telefono)) {
        erroriValidazione.cliente = 'Seleziona un cliente esistente o inserisci i dati di un nuovo cliente';
      }
    }
    
    // Validazione Step 2 (Selezione prodotti)
    else if (step === 2) {
      if (carrello.length === 0) {
        erroriValidazione.carrello = 'Aggiungi almeno un prodotto al carrello';
      }
    }
    
    // Validazione Step 3 (Dettagli consegna)
    else if (step === 3) {
      if (!dataConsegna) {
        erroriValidazione.dataConsegna = 'Seleziona una data di consegna';
      }
      
      if (!oraConsegna) {
        erroriValidazione.oraConsegna = 'Seleziona un orario di consegna';
      }
      
      if (tipoOrdine === 'Tavolo' && !numeroTavolo) {
        erroriValidazione.numeroTavolo = 'Inserisci il numero del tavolo';
      }
      
      if (tipoOrdine === 'Delivery' && (!indirizzoConsegna.via || !indirizzoConsegna.civico || !indirizzoConsegna.citta)) {
        erroriValidazione.indirizzo = 'Inserisci i dati dell\'indirizzo di consegna';
      }
    }
    
    // Se ci sono errori, li mostra e non procede
    if (Object.keys(erroriValidazione).length > 0) {
      setErrori(erroriValidazione);
      return;
    }
    
    // Altrimenti, procede allo step successivo
    setErrori({});
    setStep(prevStep => prevStep + 1);
  };

  // Torna allo step precedente
  const handlePrevStep = () => {
    setStep(prevStep => Math.max(1, prevStep - 1));
  };

  // Funzione per creare l'ordine
  const handleCreaOrdine = async () => {
    try {
      setCaricamento(true);
      
      // Data e ora di consegna
      const dataOraConsegna = new Date(dataConsegna);
      const [ore, minuti] = oraConsegna.split(':');
      dataOraConsegna.setHours(parseInt(ore), parseInt(minuti), 0, 0);
      
      // Costruisci oggetto ordine
      const nuovoOrdine = {
        orarioConsegna: dataOraConsegna,
        tipoOrdine,
        metodoPagamento,
        prodotti: carrello,
        note,
        sconto,
        puntiUtilizzati
      };
      
      // Aggiungi dati cliente
      if (clienteSelezionato) {
        nuovoOrdine.cliente = clienteSelezionato._id;
        nuovoOrdine.datiCliente = {
          nome: clienteSelezionato.nome,
          telefono: clienteSelezionato.telefono,
          badge: clienteSelezionato.badge,
          punti: clienteSelezionato.punti
        };
      } else {
        nuovoOrdine.datiCliente = {
          nome: nuovoCliente.nome,
          telefono: nuovoCliente.telefono,
          badge: 'bronzo',
          punti: 0
        };
      }
      
      // Aggiungi dati specifici in base al tipo ordine
      if (tipoOrdine === 'Tavolo') {
        nuovoOrdine.tavolo = parseInt(numeroTavolo);
      } else if (tipoOrdine === 'Delivery') {
        nuovoOrdine.indirizzo = indirizzoConsegna;
      }
      
      // Invia richiesta al server
      const response = await createOrdine(nuovoOrdine);
      
      if (response.success) {
        alert('Ordine creato con successo!');
        onClose(); // Chiude il modal
      } else {
        throw new Error(response.message || 'Errore nella creazione dell\'ordine');
      }
    } catch (error) {
      console.error('Errore nella creazione dell\'ordine:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  // Renderizza step corrente
  const renderStepContent = () => {
    switch (step) {
      case 1: // Selezione cliente
        return (
          <div className="h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Seleziona Cliente</h3>
            
            {/* Input ricerca cliente */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Cerca per nome o telefono..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                value={filtroClienti}
                onChange={(e) => setFiltroClienti(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            {clienteSelezionato ? (
              // Cliente selezionato
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-800">{clienteSelezionato.nome}</h4>
                  <button 
                    className="text-gray-500 hover:text-red-500"
                    onClick={handleResetCliente}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span>{clienteSelezionato.telefono}</span>
                  </div>
                  {clienteSelezionato.indirizzo && (
                    <div className="flex items-center text-gray-600">
                      <Home size={16} className="mr-2" />
                      <span>{clienteSelezionato.indirizzo}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Award size={16} className="mr-2" />
                    <span className="capitalize">{clienteSelezionato.badge}</span>
                    <Star size={16} className="mx-2 text-amber-500" />
                    <span>{clienteSelezionato.punti} punti</span>
                  </div>
                </div>
              </div>
            ) : (
              // Lista clienti
              <div className="mb-4">
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {clientiFiltrati.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {clientiFiltrati.map(cliente => (
                        <div 
                          key={cliente._id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSelectCliente(cliente)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{cliente.nome}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              cliente.badge === 'vip' ? 'bg-purple-100 text-purple-800' :
                              cliente.badge === 'oro' ? 'bg-yellow-100 text-yellow-800' :
                              cliente.badge === 'argento' ? 'bg-gray-200 text-gray-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {cliente.badge.charAt(0).toUpperCase() + cliente.badge.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <Phone size={14} className="mr-1" />
                            <span>{cliente.telefono}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Nessun cliente trovato
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Form nuovo cliente */}
            {!clienteSelezionato && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">Nuovo Cliente</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nome*</label>
                    <input
                      type="text"
                      value={nuovoCliente.nome}
                      onChange={(e) => setNuovoCliente({...nuovoCliente, nome: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Nome del cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Telefono*</label>
                    <input
                      type="tel"
                      value={nuovoCliente.telefono}
                      onChange={(e) => setNuovoCliente({...nuovoCliente, telefono: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Numero di telefono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Indirizzo</label>
                    <input
                      type="text"
                      value={nuovoCliente.indirizzo}
                      onChange={(e) => setNuovoCliente({...nuovoCliente, indirizzo: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Indirizzo completo"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {errori.cliente && (
              <div className="mt-3 text-red-500 text-sm flex items-center">
                <AlertTriangle size={16} className="mr-1" />
                {errori.cliente}
              </div>
            )}
          </div>
        );
        
      case 2: // Selezione prodotti
        return (
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Seleziona Prodotti</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Lista prodotti */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Cerca prodotto..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={filtroProdotti}
                    onChange={(e) => setFiltroProdotti(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {prodottiFiltrati.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {prodottiFiltrati.map(prodotto => (
                        <div 
                          key={prodotto._id}
                          className="bg-white p-2 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-sm cursor-pointer"
                          onClick={() => handleAggiungiProdotto(prodotto)}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-800 text-sm">{prodotto.nome}</span>
                            {prodotto.inPromozione && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                Promo
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex justify-between items-end">
                            <span className="text-xs text-gray-500">{prodotto.categoria}</span>
                            <span className="font-bold text-red-600">
                              € {prodotto.inPromozione ? prodotto.prezzoPromo.toFixed(2) : prodotto.prezzo.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Nessun prodotto trovato
                    </div>
                  )}
                </div>
              </div>
              
              {/* Carrello */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <ShoppingCart size={18} className="mr-2 text-red-500" />
                  Carrello
                </h4>
                
                {carrello.length > 0 ? (
                  <div className="flex-grow flex flex-col">
                    <div className="flex-grow overflow-y-auto">
                      {carrello.map((item, index) => (
                        <div key={index} className="border-b border-gray-100 py-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-800">{item.nome}</span>
                                <div className="flex items-center">
                                  <button 
                                    className="p-1 rounded-full hover:bg-red-50"
                                    onClick={() => handleUpdateQuantita(index, -1)}
                                  >
                                    <Minus size={14} className="text-red-600" />
                                  </button>
                                  <span className="mx-2 text-gray-800">{item.quantita}</span>
                                  <button 
                                    className="p-1 rounded-full hover:bg-green-50"
                                    onClick={() => handleUpdateQuantita(index, 1)}
                                  >
                                    <Plus size={14} className="text-green-600" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-500">
                                  {item.inPromozione ? (
                                    <span className="flex items-center text-red-600">
                                      <Tag size={14} className="mr-1" />
                                      <s className="text-gray-400 mr-1">€{item.prezzo.toFixed(2)}</s>
                                      €{item.prezzoPromo.toFixed(2)}
                                    </span>
                                  ) : (
                                    `€${item.prezzo.toFixed(2)}`
                                  )}
                                </span>
                                <span className="font-bold text-gray-800">
                                  € {((item.inPromozione ? item.prezzoPromo : item.prezzo) * item.quantita).toFixed(2)}
                                </span>
                              </div>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  value={item.nota}
                                  onChange={(e) => handleUpdateNota(index, e.target.value)}
                                  placeholder="Nota (es. senza cipolla)"
                                  className="text-xs w-full px-2 py-1 border border-gray-200 rounded"
                                />
                              </div>
                            </div>
                            <button 
                              className="ml-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleRemoveProdotto(index)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-gray-200">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Subtotale:</span>
                        <span className="font-medium">€ {calcolaTotale().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Sconto:</span>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={sconto}
                            onChange={(e) => setSconto(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-right mr-1"
                            min="0"
                            step="0.5"
                          />
                          <span>€</span>
                        </div>
                      </div>
                      {clienteSelezionato && clienteSelezionato.punti > 0 && (
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Utilizza punti:</span>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={puntiUtilizzati}
                              onChange={(e) => setPuntiUtilizzati(Math.min(
                                clienteSelezionato.punti,
                                Math.max(0, parseInt(e.target.value) || 0)
                              ))}
                              className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-right mr-1"
                              min="0"
                              max={clienteSelezionato.punti}
                            />
                            <span>pt</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Totale:</span>
                        <span className="text-red-600">€ {calcolaTotaleConSconto().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                    <ShoppingCart size={40} className="mb-3 text-gray-300" />
                    <p>Il carrello è vuoto</p>
                    <p className="text-sm">Seleziona dei prodotti dalla lista</p>
                  </div>
                )}
              </div>
            </div>
            
            {errori.carrello && (
              <div className="mt-3 text-red-500 text-sm flex items-center">
                <AlertTriangle size={16} className="mr-1" />
                {errori.carrello}
              </div>
            )}
          </div>
        );
        
      case 3: // Dettagli ordine e consegna
        return (
          <div className="h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dettagli Ordine</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonna sinistra */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo di Ordine*</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        tipoOrdine === 'Asporto' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setTipoOrdine('Asporto')}
                    >
                      <Package size={24} className={tipoOrdine === 'Asporto' ? 'text-red-500' : 'text-gray-500'} />
                      <span className="text-sm mt-1">Asporto</span>
                    </button>
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        tipoOrdine === 'Tavolo' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setTipoOrdine('Tavolo')}
                    >
                      <User size={24} className={tipoOrdine === 'Tavolo' ? 'text-red-500' : 'text-gray-500'} />
                      <span className="text-sm mt-1">Tavolo</span>
                    </button>
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        tipoOrdine === 'Delivery' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setTipoOrdine('Delivery')}
                    >
                      <Truck size={24} className={tipoOrdine === 'Delivery' ? 'text-red-500' : 'text-gray-500'} />
                      <span className="text-sm mt-1">Delivery</span>
                    </button>
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        tipoOrdine === 'Online' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setTipoOrdine('Online')}
                    >
                      <CreditCard size={24} className={tipoOrdine === 'Online' ? 'text-red-500' : 'text-gray-500'} />
					  <span className="text-sm mt-1">Online</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Data Consegna*</label>
                  <input
                    type="date"
                    value={dataConsegna}
                    onChange={(e) => setDataConsegna(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errori.dataConsegna && (
                    <p className="text-red-500 text-xs mt-1">{errori.dataConsegna}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Orario Consegna*</label>
                  <select
                    value={oraConsegna}
                    onChange={(e) => setOraConsegna(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seleziona orario</option>
                    {fasceOrarie.map((slot, index) => (
                      <option key={index} value={slot.ora}>
                        {slot.ora} ({slot.capacitaMax - slot.ordiniAttuali} slot disponibili)
                      </option>
                    ))}
                  </select>
                  {errori.oraConsegna && (
                    <p className="text-red-500 text-xs mt-1">{errori.oraConsegna}</p>
                  )}
                </div>
                
                {tipoOrdine === 'Tavolo' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Numero Tavolo*</label>
                    <input
                      type="number"
                      value={numeroTavolo}
                      onChange={(e) => setNumeroTavolo(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Es. 12"
                      min="1"
                    />
                    {errori.numeroTavolo && (
                      <p className="text-red-500 text-xs mt-1">{errori.numeroTavolo}</p>
                    )}
                  </div>
                )}
                
                {tipoOrdine === 'Delivery' && (
                  <div className="space-y-3 border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700">Indirizzo di consegna</h4>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Via*</label>
                      <input
                        type="text"
                        value={indirizzoConsegna.via}
                        onChange={(e) => setIndirizzoConsegna({...indirizzoConsegna, via: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Es. Via Roma"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Civico*</label>
                      <input
                        type="text"
                        value={indirizzoConsegna.civico}
                        onChange={(e) => setIndirizzoConsegna({...indirizzoConsegna, civico: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Es. 123"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Città*</label>
                      <input
                        type="text"
                        value={indirizzoConsegna.citta}
                        onChange={(e) => setIndirizzoConsegna({...indirizzoConsegna, citta: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Es. Milano"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">CAP</label>
                      <input
                        type="text"
                        value={indirizzoConsegna.cap}
                        onChange={(e) => setIndirizzoConsegna({...indirizzoConsegna, cap: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Es. 20100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Note per la consegna</label>
                      <textarea
                        value={indirizzoConsegna.note}
                        onChange={(e) => setIndirizzoConsegna({...indirizzoConsegna, note: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
                        placeholder="Es. Citofono n.3, piano 2"
                      />
                    </div>
                    {errori.indirizzo && (
                      <p className="text-red-500 text-xs">{errori.indirizzo}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Colonna destra */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Metodo di Pagamento</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        metodoPagamento === 'Contanti' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setMetodoPagamento('Contanti')}
                    >
                      <DollarSign size={20} className={metodoPagamento === 'Contanti' ? 'text-green-500' : 'text-gray-500'} />
                      <span className="text-xs mt-1">Contanti</span>
                    </button>
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        metodoPagamento === 'Carta' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setMetodoPagamento('Carta')}
                    >
                      <CreditCard size={20} className={metodoPagamento === 'Carta' ? 'text-blue-500' : 'text-gray-500'} />
                      <span className="text-xs mt-1">Carta</span>
                    </button>
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        metodoPagamento === 'Buoni pasto' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setMetodoPagamento('Buoni pasto')}
                    >
                      <FileText size={20} className={metodoPagamento === 'Buoni pasto' ? 'text-amber-500' : 'text-gray-500'} />
                      <span className="text-xs mt-1">Buoni</span>
                    </button>
                    <button 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border ${
                        metodoPagamento === 'Online' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setMetodoPagamento('Online')}
                    >
                      <ShoppingCart size={20} className={metodoPagamento === 'Online' ? 'text-purple-500' : 'text-gray-500'} />
                      <span className="text-xs mt-1">Online</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Note Ordine</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                    placeholder="Note aggiuntive per l'ordine..."
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Riepilogo Ordine</h4>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium text-gray-800">
                        {clienteSelezionato ? clienteSelezionato.nome : nuovoCliente.nome || 'Cliente non specificato'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prodotti:</span>
                      <span className="font-medium text-gray-800">{carrello.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consegna:</span>
                      <span className="font-medium text-gray-800">
                        {dataConsegna && oraConsegna ? 
                          `${new Date(dataConsegna).toLocaleDateString('it-IT')} ${oraConsegna}` : 
                          'Non specificata'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo ordine:</span>
                      <span className="font-medium text-gray-800">{tipoOrdine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pagamento:</span>
                      <span className="font-medium text-gray-800">{metodoPagamento}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Subtotale:</span>
                      <span className="font-medium">€ {calcolaTotale().toFixed(2)}</span>
                    </div>
                    {sconto > 0 && (
                      <div className="flex justify-between mb-1 text-red-600">
                        <span>Sconto:</span>
                        <span>- € {sconto.toFixed(2)}</span>
                      </div>
                    )}
                    {puntiUtilizzati > 0 && (
                      <div className="flex justify-between mb-1 text-amber-600">
                        <span>Punti utilizzati:</span>
                        <span>{puntiUtilizzati} pt</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Totale:</span>
                      <span className="text-red-600">€ {calcolaTotaleConSconto().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4: // Conferma ordine
        return (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Conferma Ordine</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Conferma la creazione dell'ordine con i dettagli inseriti
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg w-full max-w-md mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">
                    {clienteSelezionato ? clienteSelezionato.nome : nuovoCliente.nome}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefono:</span>
                  <span className="font-medium">
                    {clienteSelezionato ? clienteSelezionato.telefono : nuovoCliente.telefono}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo Ordine:</span>
                  <span className="font-medium">{tipoOrdine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consegna:</span>
                  <span className="font-medium">
                    {`${new Date(dataConsegna).toLocaleDateString('it-IT')} alle ${oraConsegna}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prodotti:</span>
                  <span className="font-medium">{carrello.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pagamento:</span>
                  <span className="font-medium">{metodoPagamento}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                  <span>Totale:</span>
                  <span className="text-red-600">€ {calcolaTotaleConSconto().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={handlePrevStep}
              >
                Modifica
              </button>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                onClick={handleCreaOrdine}
                disabled={caricamento}
              >
                {caricamento ? (
                  <RefreshCw size={20} className="animate-spin mr-2" />
                ) : (
                  <CheckCircle size={20} className="mr-2" />
                )}
                Conferma Ordine
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {step === 1 ? 'Nuovo Ordine - Cliente' : 
             step === 2 ? 'Nuovo Ordine - Prodotti' :
             step === 3 ? 'Nuovo Ordine - Dettagli' :
             'Nuovo Ordine - Conferma'}
          </h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Stepper */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <User size={18} />
              </div>
              <span className="text-xs mt-1">Cliente</span>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className={`h-1 w-full ${step >= 2 ? 'bg-red-300' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <ShoppingCart size={18} />
              </div>
              <span className="text-xs mt-1">Prodotti</span>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className={`h-1 w-full ${step >= 3 ? 'bg-red-300' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <Calendar size={18} />
              </div>
              <span className="text-xs mt-1">Dettagli</span>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className={`h-1 w-full ${step >= 4 ? 'bg-red-300' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${step >= 4 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 4 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckCircle size={18} />
              </div>
              <span className="text-xs mt-1">Conferma</span>
            </div>
          </div>
        </div>
        
        {/* Contenuto */}
        <div className="flex-grow p-6 overflow-y-auto">
          {renderStepContent()}
        </div>
        
        {/* Footer con pulsanti */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={step === 1 ? onClose : handlePrevStep}
            >
              {step === 1 ? 'Annulla' : 'Indietro'}
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              onClick={handleNextStep}
            >
              {step === 3 ? 'Riepilogo' : 'Continua'}
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NuovoOrdineForm;