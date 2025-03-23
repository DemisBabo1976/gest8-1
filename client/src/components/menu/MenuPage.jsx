import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Search, PlusCircle, ArrowLeft, Edit, Trash2, 
  Eye, EyeOff, Tag, Filter, RefreshCw, UploadCloud, X,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  DollarSign, Clock
} from 'lucide-react';
import { 
  getProdotti, 
  createProdotto, 
  updateProdotto, 
  deleteProdotto,
  toggleProdottoAttivo,
  toggleProdottoPromozione
} from '../../services/menuService';

const MenuPage = () => {
  // Stati per la gestione dei dati
  const [prodotti, setProdotti] = useState([]);
  const [prodottoSelezionato, setProdottoSelezionato] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const [itemPerPagina, setItemPerPagina] = useState(12);
  const [ordinamento, setOrdinamento] = useState({ campo: 'nome', direzione: 'asc' });
  const [caricamento, setCaricamento] = useState(false);
  const [modalAperto, setModalAperto] = useState(false);
  const [modalModifica, setModalModifica] = useState(false);
  const [anteprima, setAnteprima] = useState('');
  const [visualizzazione, setVisualizzazione] = useState('card'); // 'card' o 'lista'
  const [ingredienteInput, setIngredienteInput] = useState('');
  const [allergeneInput, setAllergeneInput] = useState(''); // Mantieni questa riga
  const [allergeniDropdownAperto, setAllergeniDropdownAperto] = useState(false);
  
  // Lista di allergeni predefiniti con icone e descrizioni
  const allergeniPredefiniti = [
    { id: 'glutine', nome: 'Glutine', icona: '🌾', descrizione: 'Cereali contenenti glutine e prodotti derivati' },
    { id: 'crostacei', nome: 'Crostacei', icona: '🦐', descrizione: 'Crostacei e prodotti a base di crostacei' },
    { id: 'uova', nome: 'Uova', icona: '🥚', descrizione: 'Uova e prodotti a base di uova' },
    { id: 'pesce', nome: 'Pesce', icona: '🐟', descrizione: 'Pesce e prodotti a base di pesce' },
    { id: 'arachidi', nome: 'Arachidi', icona: '🥜', descrizione: 'Arachidi e prodotti a base di arachidi' },
    { id: 'soia', nome: 'Soia', icona: '🫘', descrizione: 'Soia e prodotti a base di soia' },
    { id: 'latte', nome: 'Latte', icona: '🥛', descrizione: 'Latte e prodotti a base di latte' },
    { id: 'fruttaGuscio', nome: 'Frutta a guscio', icona: '🌰', descrizione: 'Frutta a guscio e prodotti derivati' },
    { id: 'sedano', nome: 'Sedano', icona: '🥬', descrizione: 'Sedano e prodotti a base di sedano' },
    { id: 'senape', nome: 'Senape', icona: '🟡', descrizione: 'Senape e prodotti a base di senape' },
    { id: 'sesamo', nome: 'Sesamo', icona: '◓', descrizione: 'Semi di sesamo e prodotti a base di semi di sesamo' },
    { id: 'solfiti', nome: 'Solfiti', icona: '🧪', descrizione: 'Anidride solforosa e solfiti' },
    { id: 'lupini', nome: 'Lupini', icona: '🟢', descrizione: 'Lupini e prodotti a base di lupini' },
    { id: 'molluschi', nome: 'Molluschi', icona: '🦑', descrizione: 'Molluschi e prodotti a base di molluschi' },
    { id: 'congelato', nome: 'Congelato', icona: '❄️', descrizione: 'Prodotto congelato o con ingredienti congelati' },
  ];
  const fileInputRef = useRef(null);
  
  // Stato per il nuovo prodotto o prodotto da modificare
  const prodottoVuoto = {
    nome: '',
    descrizione: '',
    categoria: 'pizza',
    prezzo: 0,
    ingredienti: [],
    allergeni: [],
    disponibile: true,
    attivo: true,
    inPromozione: false,
    prezzoPromozione: 0,
    tempoPreparazione: 15,
    vegano: false,
    vegetariano: false,
    glutenFree: false
  };
  
  const [nuovoProdotto, setNuovoProdotto] = useState({...prodottoVuoto});
 
  const handleToggleAllergene = (allergeneId) => {
    setNuovoProdotto(prev => {
      // Se l'allergene è già selezionato, rimuovilo
      if (prev.allergeni.includes(allergeneId)) {
        return {
          ...prev,
          allergeni: prev.allergeni.filter(id => id !== allergeneId)
        };
      } 
      // Altrimenti, aggiungilo
      else {
        return {
          ...prev,
          allergeni: [...prev.allergeni, allergeneId]
        };
      }
    });
  };
  
  const navigate = useNavigate();

  // Caricamento iniziale dei dati
  useEffect(() => {
    fetchProdotti();
  }, []);
  
  // Funzione per caricare i prodotti
  const fetchProdotti = async () => {
    try {
      setCaricamento(true);
      const data = await getProdotti();
      setProdotti(data);
    } catch (error) {
      console.error('Errore nel caricamento dei prodotti:', error);
      alert('Errore nel caricamento dei prodotti. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  // Gestione filtro
  const prodottiFiltrati = prodotti.filter(prodotto => {
    const matchNome = prodotto.nome.toLowerCase().includes(filtro.toLowerCase());
    const matchDescrizione = prodotto.descrizione.toLowerCase().includes(filtro.toLowerCase());
    const matchCategoria = filtroCategoria ? prodotto.categoria === filtroCategoria : true;
    
    return (matchNome || matchDescrizione) && matchCategoria;
  });
  
  // Gestione ordinamento
  const prodottiOrdinati = [...prodottiFiltrati].sort((a, b) => {
    if (ordinamento.campo === 'prezzo') {
      return ordinamento.direzione === 'asc' 
        ? a.prezzo - b.prezzo 
        : b.prezzo - a.prezzo;
    } else {
      const valA = a[ordinamento.campo].toLowerCase();
      const valB = b[ordinamento.campo].toLowerCase();
      
      if (valA < valB) return ordinamento.direzione === 'asc' ? -1 : 1;
      if (valA > valB) return ordinamento.direzione === 'asc' ? 1 : -1;
      return 0;
    }
  });

  // Gestione paginazione
  const indiceUltimoItem = paginaCorrente * itemPerPagina;
  const indicePrimoItem = indiceUltimoItem - itemPerPagina;
  const prodottiPaginati = prodottiOrdinati.slice(indicePrimoItem, indiceUltimoItem);
  const totalePagine = Math.ceil(prodottiOrdinati.length / itemPerPagina);
  
  // Funzione per cambiare l'ordinamento
  const ordinaProdotti = (campo) => {
    if (ordinamento.campo === campo) {
      setOrdinamento({
        campo,
        direzione: ordinamento.direzione === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setOrdinamento({ campo, direzione: 'asc' });
    }
  };
  
  // Gestione selezione prodotto
  const handleSelectProdotto = (prodotto) => {
    console.log("Allergeni del prodotto:", prodotto.allergeni); 
    setProdottoSelezionato(prodotto);
  };
  
  // Chiusura dettagli prodotto
  const handleCloseDettagli = () => {
    setProdottoSelezionato(null);
  };
  
  // Gestione caricamento immagine
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setNuovoProdotto(prev => ({
        ...prev,
        immagine: file
      }));
      
      // Imposta il file stesso come anteprima, non l'URL
      setAnteprima(file);
    }
  };
  
  // Gestione input form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setNuovoProdotto(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setNuovoProdotto(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setNuovoProdotto(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Aggiunta di un ingrediente
  const handleAddIngrediente = () => {
    if (ingredienteInput.trim()) {
      setNuovoProdotto(prev => ({
        ...prev,
        ingredienti: [...prev.ingredienti, ingredienteInput.trim()]
      }));
      setIngredienteInput('');
    }
  };
  
  // Rimozione di un ingrediente
  const handleRemoveIngrediente = (index) => {
    setNuovoProdotto(prev => ({
      ...prev,
      ingredienti: prev.ingredienti.filter((_, i) => i !== index)
    }));
  };
  
  // Aggiunta di un allergene (per retrocompatibilità)
  const handleAddAllergene = () => {
    if (allergeneInput.trim()) {
      setNuovoProdotto(prev => ({
        ...prev,
        allergeni: [...prev.allergeni, allergeneInput.trim()]
      }));
      setAllergeneInput('');
    }
  };
  
  // Rimozione di un allergene (per retrocompatibilità)
  const handleRemoveAllergene = (index) => {
    setNuovoProdotto(prev => ({
      ...prev,
      allergeni: prev.allergeni.filter((_, i) => i !== index)
    }));
  };
  
  // Apertura del modal per aggiungere un prodotto
  const handleOpenAddModal = () => {
    setNuovoProdotto({...prodottoVuoto});
    setAnteprima('');
    setModalAperto(true);
    setModalModifica(false);
  };
  
  // Apertura del modal per modificare un prodotto
const handleOpenEditModal = (prodotto) => {
  // Prepara il prodotto per la modifica
  let ingredientiParsati = [];
  let allergeniParsati = [];
  
  try {
    // Parsing degli ingredienti
    ingredientiParsati = parseAllergeni(prodotto.ingredienti);
    
    // Parsing degli allergeni
    allergeniParsati = parseAllergeni(prodotto.allergeni);
    
    console.log("Ingredienti parsati:", ingredientiParsati);
    console.log("Allergeni parsati:", allergeniParsati);
  } catch (error) {
    console.error("Errore nel parsing dei dati:", error);
  }
  
  const prodottoDaModificare = {
    ...prodotto,
    ingredienti: ingredientiParsati,
    allergeni: allergeniParsati
  };
  
  setNuovoProdotto(prodottoDaModificare);
  setAnteprima(prodotto.immagine || '');
  setModalAperto(true);
  setModalModifica(true);
};
  
  // Chiusura del modal
  const handleCloseModal = () => {
    setModalAperto(false);
    setAnteprima('');
  };
  
  // Salvataggio di un nuovo prodotto
  const handleSalvaProdotto = async () => {
  try {
    setCaricamento(true);
    
    // Crea una copia del prodotto per non modificare direttamente lo stato
    const prodottoDaSalvare = { ...nuovoProdotto };
    
    // Log per debugging
    console.log("Prodotto da salvare:", prodottoDaSalvare);
    console.log("Formato allergeni:", prodottoDaSalvare.allergeni);
    console.log("Formato ingredienti:", prodottoDaSalvare.ingredienti);
    
    if (modalModifica) {
      // Aggiornamento prodotto esistente
      const response = await updateProdotto(prodottoDaSalvare._id, prodottoDaSalvare);
      
      // Aggiorna la lista dei prodotti
      setProdotti(prodotti.map(p => 
        p._id === prodottoDaSalvare._id ? response.data : p
      ));
      
      // Se era il prodotto selezionato, aggiorna anche quello
      if (prodottoSelezionato && prodottoSelezionato._id === prodottoDaSalvare._id) {
        setProdottoSelezionato(response.data);
      }
    } else {
      // Creazione nuovo prodotto
      const response = await createProdotto(prodottoDaSalvare);
      
      // Aggiungi il nuovo prodotto alla lista
      setProdotti([...prodotti, response.data]);
    }
    
    // Chiudi il modal
    handleCloseModal();
  } catch (error) {
    console.error('Errore nel salvataggio del prodotto:', error);
    console.error('Dettagli errore:', error.response?.data || error.message || error);
    alert('Errore nel salvataggio del prodotto. Riprova più tardi.');
  } finally {
    setCaricamento(false);
  }
};
  
  // Eliminazione di un prodotto
  const handleDeleteProdotto = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      try {
        setCaricamento(true);
        await deleteProdotto(id);
        
        // Rimuovi il prodotto dalla lista
        setProdotti(prodotti.filter(p => p._id !== id));
        
        // Se era il prodotto selezionato, deselezionalo
        if (prodottoSelezionato && prodottoSelezionato._id === id) {
          setProdottoSelezionato(null);
        }
      } catch (error) {
        console.error('Errore nell\'eliminazione del prodotto:', error);
        alert('Errore nell\'eliminazione del prodotto. Riprova più tardi.');
      } finally {
        setCaricamento(false);
      }
    }
  };
  
  // Toggle dello stato attivo/inattivo di un prodotto
  const handleToggleAttivo = async (id, e) => {
    e.stopPropagation();
    try {
      setCaricamento(true);
      const response = await toggleProdottoAttivo(id);
      
      // Aggiorna la lista dei prodotti
      setProdotti(prodotti.map(p => 
        p._id === id ? response.data : p
      ));
      
      // Se era il prodotto selezionato, aggiorna anche quello
      if (prodottoSelezionato && prodottoSelezionato._id === id) {
        setProdottoSelezionato(response.data);
      }
    } catch (error) {
      console.error('Errore nella modifica dello stato del prodotto:', error);
      alert('Errore nella modifica dello stato del prodotto. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };
  
  // Toggle dello stato di promozione di un prodotto
  const handleTogglePromozione = async (id, e) => {
    e.stopPropagation();
    try {
      setCaricamento(true);
      const response = await toggleProdottoPromozione(id);
      
      // Aggiorna la lista dei prodotti
      setProdotti(prodotti.map(p => 
        p._id === id ? response.data : p
      ));
      
      // Se era il prodotto selezionato, aggiorna anche quello
      if (prodottoSelezionato && prodottoSelezionato._id === id) {
        setProdottoSelezionato(response.data);
      }
    } catch (error) {
      console.error('Errore nella modifica dello stato di promozione del prodotto:', error);
      alert('Errore nella modifica dello stato di promozione del prodotto. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };
  
  // Traduzione delle categorie per la visualizzazione
  const getCategoriaLabel = (categoria) => {
    const categorie = {
      'pizza': 'Pizza',
      'antipasto': 'Antipasto',
      'bevanda': 'Bevanda',
      'dolce': 'Dolce',
      'contorno': 'Contorno',
      'altro': 'Altro'
    };
    return categorie[categoria] || categoria;
  };
  
  // Formattazione prezzo in euro
  const formatPrezzo = (prezzo) => {
    return `€ ${prezzo.toFixed(2)}`.replace('.', ',');
  };

   // Funzione helper per parsare gli allergeni e altri array in stringhe JSON
const parseAllergeni = (data) => {
  let array = [];
  try {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      // Se è già un array, controlla se contiene una stringa JSON
      if (data.length > 0 && typeof data[0] === 'string') {
        // Caso speciale per ["[\"crostacei\",\"uova\"]"]
        if (data.length === 1 && data[0].includes('[') && data[0].includes(']')) {
          try {
            array = JSON.parse(data[0]);
          } catch {
            array = data;
          }
        } else {
          array = data;
        }
      } else {
        array = data;
      }
    } else if (typeof data === 'string') {
      try {
        array = JSON.parse(data);
      } catch {
        array = [data];
      }
    }
  } catch (error) {
    console.error("Errore nel parsing dell'array:", error);
    array = [];
  }
  
  console.log("Parsing risultato:", array);
  return array;
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
            <FileText className="text-rose-500 mr-2" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Gestione Menu</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="bg-rose-500 rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-rose-600 transition-colors text-white"
            onClick={handleOpenAddModal}
          >
            <PlusCircle size={18} />
            <span className="text-sm">Nuovo Prodotto</span>
          </button>
        </div>
      </header>

      {/* Filtri e Ricerca */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Cerca prodotto..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          {/* Toggle visualizzazione */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md transition-all ${visualizzazione === 'card' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-500 hover:bg-gray-200'}`}
              onClick={() => setVisualizzazione('card')}
            >
              <div className="flex items-center">
                <div className="grid grid-cols-2 gap-1 mr-1">
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                </div>
                <span className="text-xs font-medium">Cards</span>
              </div>
            </button>
            <button
              className={`px-3 py-1 rounded-md transition-all ${visualizzazione === 'lista' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-500 hover:bg-gray-200'}`}
              onClick={() => setVisualizzazione('lista')}
            >
              <div className="flex items-center">
                <div className="flex flex-col gap-1 mr-1">
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                </div>
                <span className="text-xs font-medium">Lista</span>
              </div>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="categoria" className="mr-2 text-gray-600">Categoria:</label>
              <select
                id="categoria"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="">Tutte</option>
                <option value="pizza">Pizza</option>
                <option value="antipasto">Antipasto</option>
                <option value="bevanda">Bevanda</option>
                <option value="dolce">Dolce</option>
                <option value="contorno">Contorno</option>
                <option value="altro">Altro</option>
              </select>
            </div>
            
            <button 
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              onClick={fetchProdotti}
            >
              <RefreshCw size={18} className={`text-gray-600 ${caricamento ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenitore principale */}
      <div className="flex gap-6">
        {/* Griglia prodotti */}
        <div className={`${prodottoSelezionato ? 'w-2/3' : 'w-full'}`}>
          {caricamento ? (
            <div className="bg-white rounded-xl shadow-lg p-8 flex justify-center items-center">
              <RefreshCw size={24} className="animate-spin text-rose-500 mr-2" />
              <span className="text-gray-500">Caricamento prodotti...</span>
            </div>
          ) : prodottiPaginati.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500 mb-4">Nessun prodotto trovato</p>
              <button 
                className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
                onClick={handleOpenAddModal}
              >
                Aggiungi il primo prodotto
              </button>
            </div>
          ) : (
            <div>
              {visualizzazione === 'card' ? (
                /* Visualizzazione a Card */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {prodottiPaginati.map(prodotto => (
                    <div 
                      key={prodotto._id} 
                      className={`bg-white rounded-xl shadow-md transition-all hover:shadow-lg cursor-pointer overflow-hidden ${!prodotto.attivo ? 'opacity-60' : ''} ${prodottoSelezionato?._id === prodotto._id ? 'ring-2 ring-rose-500' : ''}`}
                      onClick={() => handleSelectProdotto(prodotto)}
                    >
                      <div className="relative h-40 bg-gray-200">
                        {prodotto.immagine ? (
                          <img 
                            src={`http://localhost:5000${prodotto.immagine}`} 
                            alt={prodotto.nome} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-rose-50">
                            <FileText className="text-rose-300" size={48} />
                          </div>
                        )}
				
                        {/* Badge e tag */}
                        <div className="absolute top-2 right-2 flex flex-col space-y-1">
                          {!prodotto.attivo && (
                            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                              Nascosto
                            </span>
                          )}
                          {prodotto.inPromozione && (
                            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                              Promo
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-800 line-clamp-1">{prodotto.nome}</h3>
                          <span className="text-xs font-medium bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                            {getCategoriaLabel(prodotto.categoria)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 h-10 mb-2">
                          {prodotto.descrizione || 'Nessuna descrizione disponibile'}
                        </p>
                        
						{/* Visualizzazione ingredienti nella card */}
{prodotto.ingredienti && prodotto.ingredienti.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-1 mb-2">
    {(() => {
      const ingredientiArray = parseAllergeni(prodotto.ingredienti);
      return ingredientiArray.slice(0, 3).map((ingrediente, index) => (
        <span key={index} className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
          {ingrediente}
        </span>
      ));
    })()}
    {(() => {
      const ingredientiArray = parseAllergeni(prodotto.ingredienti);
      return ingredientiArray.length > 3 ? (
        <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
          +{ingredientiArray.length - 3}
        </span>
      ) : null;
    })()}
  </div>
)}
						
{/* Badge allergeni nella card */}
{prodotto.allergeni && prodotto.allergeni.length > 0 && (
  <div className="flex flex-wrap gap-1 my-1">
    {(() => {
      const allergeniArray = parseAllergeni(prodotto.allergeni);
      return allergeniArray.slice(0, 3).map(allergeneId => {
        const allergene = allergeniPredefiniti.find(a => a.id === allergeneId);
        return allergene ? (
          <span key={allergeneId} className="inline-flex items-center text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
            <span>{allergene.icona}</span>
          </span>
        ) : (
          <span key={allergeneId} className="inline-flex items-center text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
            {allergeneId}
          </span>
        );
      });
    })()}
                            {(() => {
                              const allergeniArray = parseAllergeni(prodotto.allergeni);
                              return allergeniArray.length > 3 ? (
                                <span className="inline-flex items-center text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                                  +{allergeniArray.length - 3}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-800">
                              {formatPrezzo(prodotto.prezzo)}
                            </p>
                            {prodotto.inPromozione && prodotto.prezzoPromozione && (
                              <p className="text-amber-600 text-sm">
                                Promo: {formatPrezzo(prodotto.prezzoPromozione)}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            <button 
                              className="p-1 rounded-full hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(prodotto);
                              }}
                            >
                              <Edit size={16} className="text-amber-600" />
                            </button>
                            <button 
                              className="p-1 rounded-full hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleAttivo(prodotto._id, e);
                              }}
                            >
                              {prodotto.attivo ? (
                                <EyeOff size={16} className="text-gray-600" />
                              ) : (
                                <Eye size={16} className="text-green-600" />
                              )}
                            </button>
                            <button 
                              className="p-1 rounded-full hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProdotto(prodotto._id);
                              }}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
			  
                /* Visualizzazione a Lista */
              
			/* Visualizzazione a Lista */
<div className="bg-white rounded-xl shadow-md overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Prodotto
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ingredienti
        </th>                        
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Categoria
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Prezzo
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Stato
        </th>
        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Azioni
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {prodottiPaginati.map(prodotto => (
        <tr 
          key={prodotto._id}
          className={`hover:bg-gray-50 cursor-pointer ${!prodotto.attivo ? 'opacity-60 bg-gray-50' : ''} ${prodottoSelezionato?._id === prodotto._id ? 'bg-rose-50' : ''}`}
          onClick={() => handleSelectProdotto(prodotto)}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                {prodotto.immagine ? (
                  <img 
                    src={`http://localhost:5000${prodotto.immagine}`} 
                    alt={prodotto.nome} 
                    className="h-10 w-10 object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center bg-rose-50">
                    <FileText className="text-rose-300" size={16} />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{prodotto.nome}</div>
                <div className="text-sm text-gray-500 line-clamp-1">
                  {prodotto.descrizione || 'Nessuna descrizione'}
                </div>
              </div>
            </div>
          </td>
          
          {/* Colonna ingredienti */}
          <td className="px-6 py-4">
            {prodotto.ingredienti && prodotto.ingredienti.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const ingredientiArray = parseAllergeni(prodotto.ingredienti);
                  return ingredientiArray.slice(0, 3).map((ingrediente, index) => (
                    <span key={index} className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
                      {ingrediente}
                    </span>
                  ));
                })()}
                {(() => {
                  const ingredientiArray = parseAllergeni(prodotto.ingredienti);
                  return ingredientiArray.length > 3 ? (
                    <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
                      +{ingredientiArray.length - 3}
                    </span>
                  ) : null;
                })()}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Nessun ingrediente</span>
            )}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">
              {getCategoriaLabel(prodotto.categoria)}
            </span>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 font-medium">{formatPrezzo(prodotto.prezzo)}</div>
            
            {/* Badge allergeni */}
            {prodotto.allergeni && prodotto.allergeni.length > 0 && (
              <div className="flex flex-wrap gap-1 my-1">
                {(() => {
                  const allergeniArray = parseAllergeni(prodotto.allergeni);
                  return allergeniArray.slice(0, 2).map(allergeneId => {
                    const allergene = allergeniPredefiniti.find(a => a.id === allergeneId);
                    return allergene ? (
                      <span key={allergeneId} className="inline-flex items-center text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                        <span>{allergene.icona}</span>
                      </span>
                    ) : (
                      <span key={allergeneId} className="inline-flex items-center text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                        {allergeneId}
                      </span>
                    );
                  });
                })()}
                {(() => {
                  const allergeniArray = parseAllergeni(prodotto.allergeni);
                  return allergeniArray.length > 2 ? (
                    <span className="inline-flex items-center text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                      +{allergeniArray.length - 2}
                    </span>
                  ) : null;
                })()}
              </div>
            )}

            {prodotto.inPromozione && prodotto.prezzoPromozione && (
              <div className="text-xs text-amber-600">
                Promo: {formatPrezzo(prodotto.prezzoPromozione)}
              </div>
            )}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-col space-y-1">
              {!prodotto.attivo && (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Nascosto
                </span>
              )}
              {prodotto.inPromozione && (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                  Promo
                </span>
              )}
              {prodotto.attivo && !prodotto.inPromozione && (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Attivo
                </span>
              )}
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end space-x-2">
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(prodotto);
                }}
              >
                <Edit size={16} className="text-amber-600" />
              </button>
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleAttivo(prodotto._id, e);
                }}
              >
                {prodotto.attivo ? (
                  <EyeOff size={16} className="text-gray-600" />
                ) : (
                  <Eye size={16} className="text-green-600" />
                )}
              </button>
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProdotto(prodotto._id);
                }}
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
)}

              
              {/* Paginazione */}
              <div className="flex justify-center items-center mt-6">
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
                      className={`w-8 h-8 rounded-lg border ${paginaCorrente === index + 1 ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-300 hover:bg-gray-100'}`}
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
            </div>
          )}
        </div>

        {/* Dettagli prodotto */}
        {prodottoSelezionato && (
          <div className="w-1/3 bg-white rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Dettagli Prodotto</h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={handleCloseDettagli}
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
            
            <div className="relative h-48 bg-gray-200 rounded-lg mb-4">
              {prodottoSelezionato.immagine ? (
                <img 
                  src={`http://localhost:5000${prodottoSelezionato.immagine}`} 
                  alt={prodottoSelezionato.nome} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-50 rounded-lg">
                  <FileText className="text-rose-300" size={64} />
                </div>
              )}
              
              {/* Badge per lo stato */}
              <div className="absolute top-2 right-2 flex space-x-2">
                {!prodottoSelezionato.attivo && (
                  <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    Nascosto
                  </span>
                )}
                {prodottoSelezionato.inPromozione && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                    Promo
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">{prodottoSelezionato.nome}</h3>
                <span className="text-sm font-medium bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                  {getCategoriaLabel(prodottoSelezionato.categoria)}
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                {prodottoSelezionato.descrizione || 'Nessuna descrizione disponibile'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <DollarSign size={16} className="mr-1" />
                  <span className="text-sm">Prezzo</span>
                </div>
                <p className="font-bold text-gray-800">{formatPrezzo(prodottoSelezionato.prezzo)}</p>
                {prodottoSelezionato.inPromozione && prodottoSelezionato.prezzoPromozione && (
                  <p className="text-amber-600 text-sm">
                    Promo: {formatPrezzo(prodottoSelezionato.prezzoPromozione)}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <Clock size={16} className="mr-1" />
                  <span className="text-sm">Tempo preparazione</span>
                </div>
                <p className="font-bold text-gray-800">{prodottoSelezionato.tempoPreparazione} min</p>
              </div>
            </div>
            
            {/* Ingredienti */}
<div className="mb-4">
  <h4 className="font-medium text-gray-700 mb-2">Ingredienti</h4>
  {prodottoSelezionato.ingredienti ? (
    <div className="flex flex-wrap gap-2">
      {parseAllergeni(prodottoSelezionato.ingredienti).map((ingrediente, index) => (
        <span key={index} className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
          {ingrediente}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">Nessun ingrediente specificato</p>
  )}
</div>

{/* Allergeni */}
<div className="mb-4">
  <h4 className="font-medium text-gray-700 mb-2">Allergeni</h4>
  {prodottoSelezionato.allergeni ? (
    <div className="flex flex-wrap gap-2">
      {parseAllergeni(prodottoSelezionato.allergeni).map(allergeneId => {
        const allergene = allergeniPredefiniti.find(a => a.id === allergeneId);
        return allergene ? (
          <span key={allergeneId} className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full flex items-center">
            <span className="mr-1">{allergene.icona}</span>
            <span>{allergene.nome}</span>
          </span>
        ) : (
          <span key={allergeneId} className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
            {allergeneId}
          </span>
        );
      })}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">Nessun allergene specificato</p>
  )}
</div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className={`p-2 rounded-lg text-center ${prodottoSelezionato.vegetariano ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                <p className="text-sm font-medium">Vegetariano</p>
                {prodottoSelezionato.vegetariano ? (
                  <CheckCircle size={16} className="mx-auto mt-1" />
                ) : (
                  <AlertCircle size={16} className="mx-auto mt-1" />
                )}
              </div>
              
              <div className={`p-2 rounded-lg text-center ${prodottoSelezionato.vegano ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                <p className="text-sm font-medium">Vegano</p>
                {prodottoSelezionato.vegano ? (
                  <CheckCircle size={16} className="mx-auto mt-1" />
                ) : (
                  <AlertCircle size={16} className="mx-auto mt-1" />
                )}
              </div>
              
              <div className={`p-2 rounded-lg text-center ${prodottoSelezionato.glutenFree ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                <p className="text-sm font-medium">Gluten Free</p>
                {prodottoSelezionato.glutenFree ? (
                  <CheckCircle size={16} className="mx-auto mt-1" />
                ) : (
                  <AlertCircle size={16} className="mx-auto mt-1" />
                )}
              </div>
            </div>
            
            <div className="flex justify-between space-x-2">
              <button 
                className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 flex items-center justify-center flex-1"
                onClick={() => handleOpenEditModal(prodottoSelezionato)}
              >
                <Edit size={16} className="mr-1" />
                <span>Modifica</span>
              </button>
              
              <button 
                className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 flex items-center justify-center flex-1"
                onClick={(e) => handleToggleAttivo(prodottoSelezionato._id, e)}
              >
                {prodottoSelezionato.attivo ? (
                  <>
                    <EyeOff size={16} className="mr-1" />
                    <span>Nascondi</span>
                  </>
                ) : (
                  <>
                    <Eye size={16} className="mr-1" />
                    <span>Mostra</span>
                  </>
                )}
              </button>
              
              <button 
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center flex-1"
                onClick={() => handleDeleteProdotto(prodottoSelezionato._id)}
              >
                <Trash2 size={16} className="mr-1" />
                <span>Elimina</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Aggiungi/Modifica prodotto */}
      {modalAperto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalModifica ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
              </h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={handleCloseModal}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prima colonna */}
              <div>
                {/* Immagine prodotto */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Immagine</label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {anteprima ? (
                      <div className="relative">
                        <img 
                          src={typeof anteprima === 'string' && anteprima.startsWith('http') 
                              ? anteprima 
                              : typeof anteprima === 'object' 
                                ? URL.createObjectURL(anteprima)
                                : anteprima}
                          alt="Anteprima" 
                          className="max-h-40 mx-auto rounded"
                        />
                        <button 
                          className="absolute top-0 right-0 p-1 bg-red-100 rounded-full hover:bg-red-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnteprima('');
                            setNuovoProdotto(prev => ({ ...prev, immagine: '' }));
                          }}
                        >
                          <X size={16} className="text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto text-gray-400 mb-2" size={40} />
                        <p className="text-gray-500">Clicca per caricare un'immagine</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
                
                {/* Nome prodotto */}
                <div className="mb-4">
                  <label htmlFor="nome" className="block text-sm text-gray-600 mb-1">Nome Prodotto*</label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={nuovoProdotto.nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Es. Pizza Margherita"
                    required
                  />
                </div>
                
                {/* Descrizione */}
                <div className="mb-4">
                  <label htmlFor="descrizione" className="block text-sm text-gray-600 mb-1">Descrizione</label>
                  <textarea
                    id="descrizione"
                    name="descrizione"
                    value={nuovoProdotto.descrizione}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 h-20 resize-none"
                    placeholder="Descrizione del prodotto..."
                  ></textarea>
                </div>
                
                {/* Categoria e prezzo */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="categoria" className="block text-sm text-gray-600 mb-1">Categoria*</label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={nuovoProdotto.categoria}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="pizza">Pizza</option>
                      <option value="antipasto">Antipasto</option>
                      <option value="bevanda">Bevanda</option>
                      <option value="dolce">Dolce</option>
                      <option value="contorno">Contorno</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prezzo" className="block text-sm text-gray-600 mb-1">Prezzo (€)*</label>
                    <input
                      id="prezzo"
                      name="prezzo"
                      type="number"
                      min="0"
                      step="0.1"
                      value={nuovoProdotto.prezzo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                {/* Promozione */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <input
                      id="inPromozione"
                      name="inPromozione"
                      type="checkbox"
                      checked={nuovoProdotto.inPromozione}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="inPromozione" className="ml-2 text-sm text-gray-600">Prodotto in promozione</label>
                  </div>
                  
                  {nuovoProdotto.inPromozione && (
                    <div>
                      <label htmlFor="prezzoPromozione" className="block text-sm text-gray-600 mb-1">Prezzo in promozione (€)</label>
                      <input
                        id="prezzoPromozione"
                        name="prezzoPromozione"
                        type="number"
                        min="0"
                        step="0.1"
                        value={nuovoProdotto.prezzoPromozione}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Seconda colonna */}
              <div>
                {/* Ingredienti */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Ingredienti</label>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={ingredienteInput}
                      onChange={(e) => setIngredienteInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Aggiungi ingrediente..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIngrediente()}
                    />
                    <button
                      className="px-3 py-2 bg-rose-500 text-white rounded-r-lg hover:bg-rose-600"
                      onClick={handleAddIngrediente}
                    >
                      Aggiungi
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nuovoProdotto.ingredienti.map((ingrediente, index) => (
                      <div key={index} className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center">
                        <span>{ingrediente}</span>
                        <button
                          className="ml-1 text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveIngrediente(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {nuovoProdotto.ingredienti.length === 0 && (
                      <p className="text-gray-400 text-sm">Nessun ingrediente aggiunto</p>
                    )}
                  </div>
                </div>
                
                {/* Allergeni - Dropdown multiplo */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Allergeni</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-left flex justify-between items-center"
                      onClick={() => setAllergeniDropdownAperto(!allergeniDropdownAperto)}
                    >
                      <span className="text-gray-600">
                        {nuovoProdotto.allergeni.length > 0 
                          ? `${nuovoProdotto.allergeni.length} allergeni selezionati` 
                          : 'Seleziona allergeni...'}
                      </span>
                      <svg className={`w-5 h-5 transition-transform ${allergeniDropdownAperto ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    {allergeniDropdownAperto && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {allergeniPredefiniti.map(allergene => (
                          <div 
                            key={allergene.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center
                              ${nuovoProdotto.allergeni.includes(allergene.id) ? 'bg-rose-50' : ''}`}
                            onClick={() => handleToggleAllergene(allergene.id)}
                          >
                            <div className="flex-shrink-0 mr-2 text-lg" aria-hidden="true">
                              {allergene.icona}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{allergene.nome}</div>
                              <div className="text-xs text-gray-500">{allergene.descrizione}</div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              {nuovoProdotto.allergeni.includes(allergene.id) && (
                                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Badge per allergeni selezionati */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {nuovoProdotto.allergeni.map(allergeneId => {
                      const allergene = allergeniPredefiniti.find(a => a.id === allergeneId);
                      return allergene ? (
                        <div key={allergeneId} className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full flex items-center">
                          <span className="mr-1">{allergene.icona}</span>
                          <span>{allergene.nome}</span>
                          <button
                            type="button"
                            className="ml-1 text-red-500 hover:text-red-700"
                            onClick={() => handleToggleAllergene(allergeneId)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : null;
                    })}
                    {nuovoProdotto.allergeni.length === 0 && (
                      <p className="text-gray-400 text-sm">Nessun allergene selezionato</p>
                    )}
                  </div>
                </div>
                
                {/* Tempo di preparazione */}
                <div className="mb-4">
                  <label htmlFor="tempoPreparazione" className="block text-sm text-gray-600 mb-1">Tempo di preparazione (minuti)</label>
                  <input
                    id="tempoPreparazione"
                    name="tempoPreparazione"
                    type="number"
                    min="1"
                    value={nuovoProdotto.tempoPreparazione}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="15"
                  />
                </div>
                
                {/* Opzioni alimentari */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Opzioni alimentari</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        id="vegetariano"
                        name="vegetariano"
                        type="checkbox"
                        checked={nuovoProdotto.vegetariano}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="vegetariano" className="ml-2 text-sm text-gray-600">Vegetariano</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="vegano"
                        name="vegano"
                        type="checkbox"
                        checked={nuovoProdotto.vegano}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="vegano" className="ml-2 text-sm text-gray-600">Vegano</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="glutenFree"
                        name="glutenFree"
                        type="checkbox"
                        checked={nuovoProdotto.glutenFree}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="glutenFree" className="ml-2 text-sm text-gray-600">Gluten Free</label>
                    </div>
                  </div>
                </div>
                
                {/* Disponibilità */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="disponibile"
                      name="disponibile"
                      type="checkbox"
                      checked={nuovoProdotto.disponibile}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="disponibile" className="ml-2 text-sm text-gray-600">Prodotto disponibile</label>
                  </div>
                </div>
                
                {/* Visibilità */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="attivo"
                      name="attivo"
                      type="checkbox"
                      checked={nuovoProdotto.attivo}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <label htmlFor="attivo" className="ml-2 text-sm text-gray-600">Prodotto visibile nel menu</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                onClick={handleCloseModal}
              >
                Annulla
              </button>
              <button 
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                onClick={handleSalvaProdotto}
                disabled={!nuovoProdotto.nome || !nuovoProdotto.prezzo}
              >
                {caricamento ? (
                  <RefreshCw size={20} className="animate-spin mx-auto" />
                ) : (
                  modalModifica ? 'Aggiorna Prodotto' : 'Salva Prodotto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;