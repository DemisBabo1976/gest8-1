import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Home, ChevronLeft, ChevronRight, User, Phone, CreditCard, FileText, ShoppingCart, Check } from 'lucide-react';
import { getClienti } from '../../services/clientiService';
import { getProdotti } from '../../services/menuService';

const OrdiniWizard = ({ onClose, onSave }) => {
  // Stato per il passaggio attuale del wizard
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Stati per i dati del form
  const [formData, setFormData] = useState({
    cliente: null,
    telefono: '',
    indirizzo: '',
    tipo: 'consegna', // consegna o asporto
    prodotti: [],
    metodoPagamento: 'contanti',
    costoConsegna: 0,
    sconto: 0,
    note: ''
  });
  
  // Stati per la ricerca
  const [clienti, setClienti] = useState([]);
  const [prodotti, setProdotti] = useState([]);
  const [ricercaCliente, setRicercaCliente] = useState('');
  const [ricercaProdotto, setRicercaProdotto] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('pizza');
  const [caricamento, setCaricamento] = useState(false);
  const [clientiVisibili, setClientiVisibili] = useState(false);
  
  // Caricamento dati iniziali
  useEffect(() => {
    const fetchData = async () => {
      setCaricamento(true);
      try {
        // Carica clienti
        const clientiData = await getClienti();
        setClienti(Array.isArray(clientiData) ? clientiData : []);
        
        // Carica prodotti
        const prodottiData = await getProdotti();
        setProdotti(Array.isArray(prodottiData) ? prodottiData.filter(p => p.attivo) : []);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      } finally {
        setCaricamento(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtro clienti in base alla ricerca
  const clientiFiltrati = clienti.filter(cliente => 
    cliente.nome?.toLowerCase().includes(ricercaCliente.toLowerCase()) ||
    cliente.telefono?.includes(ricercaCliente)
  );
  
  // Filtro prodotti in base alla ricerca e categoria
  const prodottiFiltrati = prodotti.filter(prodotto => {
    const matchCategoria = categoriaAttiva === 'tutti' || prodotto.categoria === categoriaAttiva;
    const matchRicerca = prodotto.nome?.toLowerCase().includes(ricercaProdotto.toLowerCase());
    return matchCategoria && matchRicerca;
  });
  
  // Categorie uniche dai prodotti
  const categorie = ['pizza', ...new Set(prodotti.map(p => p.categoria).filter(Boolean))];
  
  // Gestione input form
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Selezione cliente
  const handleSelectCliente = (cliente) => {
    setFormData(prev => ({
      ...prev,
      cliente: cliente,
      telefono: cliente.telefono || '',
      indirizzo: cliente.indirizzo || ''
    }));
    setRicercaCliente('');
    setClientiVisibili(false);
  };
  
  // Selezione tipo ordine
  const handleSelectTipoOrdine = (tipo) => {
    setFormData(prev => ({
      ...prev,
      tipo
    }));
  };
  
  // Aggiunta prodotto
  const handleAddProdotto = (prodotto) => {
    // Controlla se il prodotto è già nel carrello
    const esistente = formData.prodotti.findIndex(p => p._id === prodotto._id);
    
    if (esistente >= 0) {
      // Incrementa la quantità
      const nuoviProdotti = [...formData.prodotti];
      nuoviProdotti[esistente].quantita += 1;
      
      setFormData(prev => ({
        ...prev,
        prodotti: nuoviProdotti
      }));
    } else {
      // Aggiungi nuovo prodotto
      setFormData(prev => ({
        ...prev,
        prodotti: [...prev.prodotti, { ...prodotto, quantita: 1, note: '' }]
      }));
    }
  };

  // Rimozione prodotto
  const handleRemoveProdotto = (index) => {
    setFormData(prev => ({
      ...prev,
      prodotti: prev.prodotti.filter((_, i) => i !== index)
    }));
  };

  // Aggiorna quantità prodotto
  const handleUpdateQuantita = (index, valore) => {
    const nuoviProdotti = [...formData.prodotti];
    nuoviProdotti[index].quantita = Math.max(1, valore);
    
    setFormData(prev => ({
      ...prev,
      prodotti: nuoviProdotti
    }));
  };
  
  // Calcolo subtotale
  const calcolaSubtotale = () => {
    return formData.prodotti.reduce((total, p) => total + (p.prezzo * p.quantita), 0);
  };
  
  // Calcolo totale
  const calcolaTotale = () => {
    const subtotale = calcolaSubtotale();
    return subtotale + formData.costoConsegna - formData.sconto;
  };
  
  // Formattazione prezzo
  const formatPrezzo = (prezzo) => {
    return `€ ${prezzo.toFixed(2)}`.replace('.', ',');
  };
  
  // Validazione step corrente
  const validateCurrentStep = () => {
    switch (step) {
      case 1: // Cliente
        return !!formData.telefono; // Richiede almeno il telefono
      case 2: // Prodotti
        return formData.prodotti.length > 0; // Richiede almeno un prodotto
      case 3: // Dettagli e pagamento
        return true; // Nessuna validazione specifica
      default:
        return true;
    }
  };
  
  // Navigazione al passaggio successivo
  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(Math.min(step + 1, totalSteps));
    } else {
      // Mostra messaggi di errore in base allo step
      if (step === 1 && !formData.telefono) {
        alert('Inserisci un numero di telefono');
      } else if (step === 2 && formData.prodotti.length === 0) {
        alert('Aggiungi almeno un prodotto all\'ordine');
      }
    }
  };
  
  // Navigazione al passaggio precedente
  const prevStep = () => {
    setStep(Math.max(step - 1, 1));
  };
  
  // Salvataggio ordine
  const handleSalvaOrdine = () => {
    // Crea oggetto ordine
    const nuovoOrdine = {
      ...formData,
      stato: 'nuovo',
      dataOrdine: new Date(),
      subtotale: calcolaSubtotale(),
      totale: calcolaTotale()
    };
    
    // Invia l'ordine
    onSave(nuovoOrdine);
  };

  // Rendering condizionale in base allo step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">1. Informazioni Cliente</h3>
            
            {/* Ricerca cliente */}
            <div className="mb-4 relative">
              <label className="block text-sm text-gray-600 mb-1">Cliente</label>
              <div className="relative">
                <input
                  type="text"
                  value={ricercaCliente}
                  onChange={(e) => {
                    setRicercaCliente(e.target.value);
                    setClientiVisibili(true);
                  }}
                  onFocus={() => setClientiVisibili(true)}
                  placeholder="Cerca cliente per nome o telefono..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              
              {/* Cliente selezionato */}
              {formData.cliente && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <User className="text-red-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">{formData.cliente.nome}</h4>
                      {formData.cliente.telefono && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Phone size={14} className="mr-1" />
                          <span>{formData.cliente.telefono}</span>
                        </div>
                      )}
                      {formData.cliente.indirizzo && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Home size={14} className="mr-1" />
                          <span>{formData.cliente.indirizzo}</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="ml-auto p-1 rounded-full hover:bg-gray-200"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          cliente: null,
                          telefono: '',
                          indirizzo: ''
                        }));
                      }}
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Dropdown clienti */}
              {clientiVisibili && ricercaCliente && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                  {caricamento ? (
                    <div className="p-3 text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700 mx-auto"></div>
                      <p className="text-gray-500 text-sm mt-1">Caricamento...</p>
                    </div>
                  ) : clientiFiltrati.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">Nessun cliente trovato</div>
                  ) : (
                    clientiFiltrati.slice(0, 5).map(cliente => (
                      <div 
                        key={cliente._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectCliente(cliente)}
                      >
                        <div className="font-medium">{cliente.nome}</div>
                        <div className="text-xs text-gray-500">{cliente.telefono}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* Telefono */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Telefono*</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Es. 333-1234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            {/* Indirizzo */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Indirizzo</label>
              <input
                type="text"
                name="indirizzo"
                value={formData.indirizzo}
                onChange={handleInputChange}
                placeholder="Es. Via Roma 123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            {/* Tipo ordine */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Tipo ordine*</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`p-3 rounded-lg flex items-center justify-center cursor-pointer border ${
                    formData.tipo === 'consegna' 
                      ? 'bg-red-100 border-red-500 text-red-700' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectTipoOrdine('consegna')}
                >
                  <Home className="mr-2" size={18} />
                  <span>Consegna a domicilio</span>
                </button>
                
                <button
                  type="button"
                  className={`p-3 rounded-lg flex items-center justify-center cursor-pointer border ${
                    formData.tipo === 'asporto' 
                      ? 'bg-red-100 border-red-500 text-red-700' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectTipoOrdine('asporto')}
                >
                  <Home className="mr-2" size={18} />
                  <span>Asporto</span>
                </button>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">2. Prodotti</h3>
            
            {/* Ricerca prodotti */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={ricercaProdotto}
                  onChange={(e) => setRicercaProdotto(e.target.value)}
                  placeholder="Cerca prodotto..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
            
            {/* Filtro categorie */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categorie.map(categoria => (
                <button
                  key={categoria}
                  className={`px-4 py-1 rounded-full text-sm ${
                    categoriaAttiva === categoria 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setCategoriaAttiva(categoria)}
                >
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Lista prodotti */}
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto p-1">
              {caricamento ? (
                <div className="col-span-2 flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
                </div>
              ) : prodottiFiltrati.length === 0 ? (
                <div className="col-span-2 text-center text-gray-500 py-4">
                  Nessun prodotto trovato
                </div>
              ) : (
                prodottiFiltrati.map(prodotto => (
                  <div 
                    key={prodotto._id}
                    className="bg-gray-50 rounded-lg p-3 flex justify-between items-center hover:bg-gray-100"
                  >
                    <div>
                      <div className="font-medium">{prodotto.nome}</div>
                      <div className="text-sm text-gray-600">
                        {formatPrezzo(prodotto.prezzo)}
                        {prodotto.inPromozione && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                            Promo
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="p-1 bg-red-100 rounded-full hover:bg-red-200"
                      onClick={() => handleAddProdotto(prodotto)}
                    >
                      <Plus size={16} className="text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Prodotti selezionati */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Prodotti selezionati ({formData.prodotti.length})</h4>
              
              {formData.prodotti.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  Nessun prodotto aggiunto
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.prodotti.map((prodotto, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{prodotto.nome}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrezzo(prodotto.prezzo)} x 
                          <input
                            type="number"
                            value={prodotto.quantita}
                            onChange={(e) => handleUpdateQuantita(index, parseInt(e.target.value))}
                            min="1"
                            className="w-10 mx-1 px-1 py-0 text-center border border-gray-300 rounded"
                          />
                          = {formatPrezzo(prodotto.prezzo * prodotto.quantita)}
                        </div>
                      </div>
                      <button
                        className="p-1 rounded-full hover:bg-gray-200"
                        onClick={() => handleRemoveProdotto(index)}
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">3. Dettagli Pagamento</h3>
            
            {/* Metodo di pagamento */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Metodo di pagamento</label>
              <select
                name="metodoPagamento"
                value={formData.metodoPagamento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="contanti">Contanti alla consegna</option>
                <option value="carta">Carta di credito</option>
                <option value="paypal">PayPal</option>
                <option value="satispay">Satispay</option>
                <option value="pos">POS alla consegna</option>
              </select>
            </div>
            
            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Note</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Note aggiuntive..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
              ></textarea>
            </div>
            
            {/* Riepilogo totali */}
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotale:</span>
                <span className="font-medium">{formatPrezzo(calcolaSubtotale())}</span>
              </div>
              
              {formData.tipo === 'consegna' && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Costo consegna:</span>
                  <div className="w-28">
                    <input
                      type="number"
                      name="costoConsegna"
                      value={formData.costoConsegna}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Sconto:</span>
                <div className="w-28">
                  <input
                    type="number"
                    name="sconto"
                    value={formData.sconto}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center font-bold mt-3 pt-2 border-t border-gray-200">
                <span>Totale:</span>
                <span className="text-lg text-red-600">{formatPrezzo(calcolaTotale())}</span>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">4. Riepilogo Ordine</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Informazioni Cliente</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{formData.cliente ? formData.cliente.nome : 'Cliente senza nome'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefono</p>
                  <p className="font-medium">{formData.telefono}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Indirizzo</p>
                  <p className="font-medium">{formData.indirizzo || 'Non specificato'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo ordine</p>
                  <p className="font-medium capitalize">{formData.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pagamento</p>
                  <p className="font-medium capitalize">{formData.metodoPagamento}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Prodotti</h4>
              <div className="space-y-2">
                {formData.prodotti.map((prodotto, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                    <div className="flex items-start">
                      <span className="text-sm bg-red-100 text-red-800 px-1.5 py-0.5 rounded mr-2">
                        {prodotto.quantita}x
                      </span>
                      <span>{prodotto.nome}</span>
                    </div>
                    <span className="font-medium">{formatPrezzo(prodotto.prezzo * prodotto.quantita)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotale:</span>
                  <span>{formatPrezzo(calcolaSubtotale())}</span>
                </div>
                
                {formData.costoConsegna > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Costo consegna:</span>
                    <span>{formatPrezzo(formData.costoConsegna)}</span>
                  </div>
                )}
                
                {formData.sconto > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Sconto:</span>
                    <span>-{formatPrezzo(formData.sconto)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center font-bold mt-2 pt-2 border-t border-gray-200">
                  <span>Totale:</span>
                  <span className="text-lg text-red-600">{formatPrezzo(calcolaTotale())}</span>
                </div>
              </div>
            </div>
            
            {formData.note && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Note</h4>
                <p className="text-gray-600">{formData.note}</p>
              </div>
            )}
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Check className="mx-auto text-green-500 mb-2" size={32} />
              <p className="text-green-700 font-medium">Ordine pronto per essere salvato</p>
              <p className="text-green-600 text-sm">Controlla i dati e conferma</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Nuovo Ordine</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
        
        {/* Indicator steps */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${i + 1 < step ? 'bg-green-500 text-white' : 
                    i + 1 === step ? 'bg-red-500 text-white' : 
                    'bg-gray-200 text-gray-500'}
                `}>
                  {i + 1 < step ? <Check size={16} /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-full h-1 ${i + 1 < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {renderStep()}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button 
            className={`px-4 py-2 rounded-lg ${
              step === 1 ? 'invisible' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={prevStep}
            disabled={step === 1}
          >
            <ChevronLeft className="inline mr-1" size={16} />
            Indietro
          </button>
          
          {step < totalSteps ? (
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={nextStep}
            >
              Avanti
              <ChevronRight className="inline ml-1" size={16} />
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={handleSalvaOrdine}
            >
              Conferma Ordine
              <Check className="inline ml-1" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdiniWizard;