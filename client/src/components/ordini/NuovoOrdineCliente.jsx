import React, { useState, useEffect } from 'react';
import { X, User, Search, Plus, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { getClienti, createCliente } from '../../services/clientiService';

const NuovoOrdineCliente = ({ ordine, onUpdate, onClose, onNext }) => {
  // Stato per memorizzare i clienti trovati nella ricerca
  const [clienti, setClienti] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Stato per la ricerca cliente
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stato per il form di nuovo cliente
  const [nuovoCliente, setNuovoCliente] = useState({
    nome: '',
    telefono: '',
    email: '',
    indirizzo: ''
  });
  
  // Stato per mostrare/nascondere il form di nuovo cliente
  const [showNuovoClienteForm, setShowNuovoClienteForm] = useState(false);
  
  // Stato per indicare se c'è un cliente selezionato
  const [clienteSelezionato, setClienteSelezionato] = useState(null);
  
  // Stato per errori di validazione
  const [validationErrors, setValidationErrors] = useState({});

  // Effetto per caricare i clienti all'avvio o quando cambia la query
  useEffect(() => {
    // Solo se c'è una query di almeno 3 caratteri, facciamo la ricerca
    if (searchQuery.length >= 3) {
      fetchClienti();
    } else if (searchQuery.length === 0) {
      // Se la query è vuota, mostra i clienti recenti
      fetchClientiRecenti();
    }
  }, [searchQuery]);
  
  // Funzione per recuperare i clienti recenti
  const fetchClientiRecenti = async () => {
    try {
      setIsLoading(true);
      // In un'implementazione reale, recupereremmo i clienti recenti dal server
      // Per ora, utilizziamo clienti fittizi come fallback
      
      setTimeout(() => {
        const clientiFittizi = [
          { id: '1', nome: 'Mario Rossi', telefono: '333 1234567', email: 'mario@example.com' },
          { id: '2', nome: 'Giulia Bianchi', telefono: '339 9876543', email: 'giulia@example.com' },
          { id: '3', nome: 'Luca Verdi', telefono: '338 4567890', email: 'luca@example.com' }
        ];
        
        setClienti(clientiFittizi);
        setError(null);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error("Errore nel recupero dei clienti recenti:", error);
      setError("Impossibile caricare i clienti recenti. Riprova più tardi.");
      setIsLoading(false);
    }
  };

  // Funzione per recuperare i clienti in base alla ricerca
  const fetchClienti = async () => {
    try {
      setIsLoading(true);
      
      // In un'implementazione reale, avremmo:
      // const response = await getClienti({ search: searchQuery });
      // Ma per ora simulo una risposta
      
      setTimeout(() => {
        const clientiFiltrati = [
          { id: '1', nome: 'Mario Rossi', telefono: '333 1234567', email: 'mario@example.com' },
          { id: '2', nome: 'Maria Rossi', telefono: '339 9876543', email: 'maria@example.com' },
        ].filter(c => 
          c.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.telefono.includes(searchQuery)
        );
        
        setClienti(clientiFiltrati);
        setError(null);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('Errore nel caricamento dei clienti', error);
      setError('Impossibile caricare i clienti. Riprova più tardi.');
      setClienti([]);
      setIsLoading(false);
    }
  };
  
  // Funzione per selezionare un cliente esistente
  const selezionaCliente = (cliente) => {
    setClienteSelezionato(cliente);
    
    // Aggiorna i campi nell'ordine
    onUpdate('clienteNome', cliente.nome);
    onUpdate('clienteTelefono', cliente.telefono);
    
    // Se c'è un indirizzo e l'ordine è di tipo consegna, impostalo
    if (cliente.indirizzo && ordine.tipo === 'consegna') {
      onUpdate('indirizzo', cliente.indirizzo);
    }
  };
  
  // Funzione per aprire il form di nuovo cliente
  const apriFormNuovoCliente = () => {
    setShowNuovoClienteForm(true);
    setNuovoCliente({
      nome: searchQuery,
      telefono: '',
      email: '',
      indirizzo: ''
    });
  };
  
  // Funzione per aggiornare i campi del nuovo cliente
  const handleNuovoClienteChange = (e) => {
    const { name, value } = e.target;
    setNuovoCliente({
      ...nuovoCliente,
      [name]: value
    });
    
    // Rimuovi eventuali errori di validazione
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };
  
  // Funzione per salvare un nuovo cliente
  const salvaCliente = async () => {
    // Validazione
    const errors = {};
    
    if (!nuovoCliente.nome) errors.nome = 'Il nome è obbligatorio';
    if (!nuovoCliente.telefono) errors.telefono = 'Il telefono è obbligatorio';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In un'implementazione reale, avremmo:
      // const cliente = await createCliente(nuovoCliente);
      // Ma per ora simulo una risposta
      
      setTimeout(() => {
        const cliente = {
          id: Date.now().toString(),
          ...nuovoCliente
        };
        
        // Aggiorna la lista dei clienti
        setClienti([cliente, ...clienti]);
        
        // Seleziona il nuovo cliente
        selezionaCliente(cliente);
        
        // Nasconde il form
        setShowNuovoClienteForm(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Errore nella creazione del cliente:', error);
      setError('Impossibile creare il cliente. Riprova più tardi.');
      setIsLoading(false);
    }
  };
  
  // Funzione per procedere al passo successivo
  const procediAvanti = () => {
    // Validazione
    if (!ordine.clienteNome) {
      setError('Seleziona o crea un cliente per continuare');
      return;
    }
    
    if (!ordine.clienteTelefono) {
      setError('Il numero di telefono è obbligatorio');
      return;
    }
    
    // Passa al passo successivo
    onNext();
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <button 
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X size={20} className="text-gray-700" />
          </button>
          <h2 className="text-xl font-semibold">Nuovo Ordine - Cliente</h2>
        </div>
      </div>
      
      <div className="p-4">
        {/* Header del wizard con i passi */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center w-1/4 relative">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              <User size={18} />
            </div>
            <div className="ml-2">
              <span className="text-sm font-medium">Cliente</span>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-1 bg-red-500"></div>
          </div>
          
          <div className="flex items-center w-1/4 relative opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div className="ml-2">
              <span className="text-sm text-gray-500">Prodotti</span>
            </div>
          </div>
          
          <div className="flex items-center w-1/4 relative opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">
              3
            </div>
            <div className="ml-2">
              <span className="text-sm text-gray-500">Dettagli</span>
            </div>
          </div>
          
          <div className="flex items-center w-1/4 relative opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">
              4
            </div>
            <div className="ml-2">
              <span className="text-sm text-gray-500">Conferma</span>
            </div>
          </div>
        </div>
        
        {/* Messaggio di errore */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Form di ricerca cliente */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca cliente per nome o telefono..."
                className="w-full border border-gray-300 rounded-lg pl-10 py-3 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            <button 
              className="bg-red-500 text-white rounded-lg px-4 py-3 flex items-center hover:bg-red-600 transition-colors"
              onClick={apriFormNuovoCliente}
            >
              <Plus size={20} className="mr-2" />
              Nuovo Cliente
            </button>
          </div>
        </div>
        
        {/* Cliente selezionato */}
        {clienteSelezionato && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <h3 className="font-medium text-gray-700">Cliente Selezionato</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome Cliente</label>
                <input 
                  type="text"
                  value={ordine.clienteNome}
                  onChange={(e) => onUpdate('clienteNome', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefono</label>
                <input 
                  type="tel"
                  value={ordine.clienteTelefono}
                  onChange={(e) => onUpdate('clienteTelefono', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Email (opzionale)</label>
                <input 
                  type="email"
                  value={clienteSelezionato.email || ''}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Form nuovo cliente */}
        {showNuovoClienteForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Nuovo Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome Cliente*</label>
                <input 
                  type="text"
                  name="nome"
                  value={nuovoCliente.nome}
                  onChange={handleNuovoClienteChange}
                  className={`w-full border ${validationErrors.nome ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                  placeholder="Nome completo"
                />
                {validationErrors.nome && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.nome}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefono*</label>
                <input 
                  type="tel"
                  name="telefono"
                  value={nuovoCliente.telefono}
                  onChange={handleNuovoClienteChange}
                  className={`w-full border ${validationErrors.telefono ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                  placeholder="Numero di telefono"
                />
                {validationErrors.telefono && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.telefono}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email (opzionale)</label>
                <input 
                  type="email"
                  name="email"
                  value={nuovoCliente.email}
                  onChange={handleNuovoClienteChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Email"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Indirizzo (opzionale)</label>
                <input 
                  type="text"
                  name="indirizzo"
                  value={nuovoCliente.indirizzo}
                  onChange={handleNuovoClienteChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Via, numero civico, città"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setShowNuovoClienteForm(false)}
                disabled={isLoading}
              >
                Annulla
              </button>
              
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={salvaCliente}
                disabled={isLoading}
              >
                {isLoading ? 'Salvataggio...' : 'Salva Cliente'}
              </button>
            </div>
          </div>
        )}
        
        {/* Lista clienti */}
        {!showNuovoClienteForm && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">
              {searchQuery ? 'Risultati Ricerca' : 'Clienti Recenti'}
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Caricamento clienti...</p>
              </div>
            ) : clienti.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? (
                  <>
                    <p className="mb-2">Nessun cliente trovato per "{searchQuery}"</p>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={apriFormNuovoCliente}
                    >
                      Crea un nuovo cliente
                    </button>
                  </>
                ) : (
                  <p>Nessun cliente recente disponibile</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {clienti.map(cliente => (
                  <div 
                    key={cliente.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      clienteSelezionato?.id === cliente.id ? 'border-2 border-red-500 bg-red-50' : ''
                    }`}
                    onClick={() => selezionaCliente(cliente)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={14} className="mr-1" />
                          <span>{cliente.telefono}</span>
                        </div>
                      </div>
                      
                      <button 
                        className="p-1 rounded-full text-blue-500 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          selezionaCliente(cliente);
                        }}
                      >
                        <User size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Pulsanti azione */}
        <div className="flex justify-between mt-6">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Annulla
          </button>
          
          <button 
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={procediAvanti}
            disabled={!clienteSelezionato && !ordine.clienteNome}
          >
            Continua
          </button>
        </div>
      </div>
    </>
  );
};

export default NuovoOrdineCliente;