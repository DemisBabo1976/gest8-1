import React, { useState, useEffect } from 'react';
import { X, Package, Search, Plus, Minus, Trash2, Pizza } from 'lucide-react';
import axios from 'axios';

const NuovoOrdineProdotti = ({ ordine, onUpdate, onClose, onPrev, onNext }) => {
  // Stato per memorizzare i prodotti disponibili
  const [prodotti, setProdotti] = useState([]);
  
  // Stato per la ricerca
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stato per la categoria selezionata
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('tutte');
  
  // Stato per il caricamento e gli errori
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Effetto per caricare i prodotti all'avvio
  useEffect(() => {
    fetchProdotti();
  }, []);
  
  // Funzione per recuperare i prodotti dal server
  const fetchProdotti = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Normalmente faremo una chiamata all'API per recuperare i prodotti
      // Ma per ora simuliamo con alcuni dati di esempio
      // const response = await axios.get('/api/menu/prodotti?attivo=true');
      
      // Simulazione di risposta dal server
      const response = {
        data: {
          success: true,
          data: [
            { 
              _id: '1',
              nome: 'Margherita',
              categoria: 'Pizza',
              prezzo: 5.50,
              inPromozione: false,
              prezzoPromo: null,
              ingredienti: ['pomodoro', 'mozzarella', 'basilico']
            },
            { 
              _id: '2',
              nome: 'Diavola',
              categoria: 'Pizza',
              prezzo: 6.50,
              inPromozione: true,
              prezzoPromo: 5.50,
              ingredienti: ['pomodoro', 'mozzarella', 'salame piccante']
            },
            { 
              _id: '3',
              nome: 'Capricciosa',
              categoria: 'Pizza',
              prezzo: 8.50,
              inPromozione: false,
              prezzoPromo: null,
              ingredienti: ['pomodoro', 'mozzarella', 'prosciutto', 'funghi', 'carciofi', 'olive']
            },
            { 
              _id: '4',
              nome: 'Coca Cola 33cl',
              categoria: 'Bevande',
              prezzo: 2.50,
              inPromozione: false,
              prezzoPromo: null,
              ingredienti: []
            },
            { 
              _id: '5',
              nome: 'Acqua 1L',
              categoria: 'Bevande',
              prezzo: 1.50,
              inPromozione: false,
              prezzoPromo: null,
              ingredienti: []
            }
          ]
        }
      };
      
      setTimeout(() => {
        setProdotti(response.data.data);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Errore nel caricamento dei prodotti');
      console.error('Errore nel caricamento dei prodotti:', err);
      setIsLoading(false);
    }
  };
  
  // Funzione per filtrare i prodotti in base alla ricerca e alla categoria
  const prodottiFiltrati = () => {
    return prodotti.filter(prodotto => {
      // Filtra per categoria se non è 'tutte'
      if (categoriaSelezionata !== 'tutte' && prodotto.categoria !== categoriaSelezionata) {
        return false;
      }
      
      // Filtra per query di ricerca
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          prodotto.nome.toLowerCase().includes(searchLower) || 
          prodotto.ingredienti.some(i => i.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  };
  
  // Funzione per ottenere tutte le categorie uniche
  const getCategorie = () => {
    const categorie = new Set(['tutte', ...prodotti.map(p => p.categoria)]);
    return Array.from(categorie);
  };
  
  // Funzione per aggiungere un prodotto all'ordine
  const aggiungiProdotto = (prodotto) => {
    // Controlla se il prodotto è già presente nell'ordine
    const articoliAggiornati = [...ordine.articoli];
    const index = articoliAggiornati.findIndex(a => a.nome === prodotto.nome);
    
    if (index !== -1) {
      // Incrementa la quantità se già presente
      articoliAggiornati[index].quantita += 1;
    } else {
      // Aggiungi nuovo articolo
      articoliAggiornati.push({
        nome: prodotto.nome,
        quantita: 1,
        prezzo: prodotto.inPromozione ? prodotto.prezzoPromo : prodotto.prezzo
      });
    }
    
    onUpdate('articoli', articoliAggiornati);
  };
  
  // Funzione per rimuovere un prodotto dall'ordine
  const rimuoviProdotto = (index) => {
    const articoliAggiornati = [...ordine.articoli];
    articoliAggiornati.splice(index, 1);
    onUpdate('articoli', articoliAggiornati);
  };
  
  // Funzione per aggiornare la quantità di un prodotto
  const aggiornaQuantita = (index, delta) => {
    const articoliAggiornati = [...ordine.articoli];
    
    // Calcola la nuova quantità
    const nuovaQuantita = Math.max(1, articoliAggiornati[index].quantita + delta);
    
    // Aggiorna la quantità o rimuovi il prodotto se la quantità è 0
    if (nuovaQuantita === 0) {
      articoliAggiornati.splice(index, 1);
    } else {
      articoliAggiornati[index].quantita = nuovaQuantita;
    }
    
    onUpdate('articoli', articoliAggiornati);
  };
  
  // Funzione per calcolare il totale dell'ordine
  const calcolaTotale = () => {
    return ordine.articoli.reduce((total, item) => total + (item.prezzo * item.quantita), 0).toFixed(2);
  };
  
  // Funzione per passare allo step successivo
  const procediAvanti = () => {
    // Verifica che ci sia almeno un prodotto nell'ordine
    if (ordine.articoli.length === 0) {
      alert('Devi selezionare almeno un prodotto');
      return;
    }
    
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
          <h2 className="text-xl font-semibold">Nuovo Ordine - Prodotti</h2>
        </div>
      </div>
      
      <div className="p-4">
        {/* Header del wizard con i passi */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center w-1/4 relative">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
              <span className="text-sm">✓</span>
            </div>
            <div className="ml-2">
              <span className="text-sm font-medium">Cliente</span>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-1 bg-green-500"></div>
          </div>
          
          <div className="flex items-center w-1/4 relative">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              <Package size={18} />
            </div>
            <div className="ml-2">
              <span className="text-sm font-medium">Prodotti</span>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-1 bg-red-500"></div>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonna sinistra - Lista prodotti */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Seleziona Prodotti</h3>
            
            <div className="mb-4">
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca prodotti..."
                  className="w-full border border-gray-300 rounded-lg pl-10 py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            
            <div className="mb-4 flex flex-wrap gap-2">
              {getCategorie().map(categoria => (
                <button 
                  key={categoria}
                  className={`px-3 py-1 rounded-full text-sm ${
                    categoriaSelezionata === categoria
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setCategoriaSelezionata(categoria)}
                >
                  {categoria === 'tutte' ? 'Tutte le categorie' : categoria}
                </button>
              ))}
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                <p className="text-gray-500 mt-3">Caricamento prodotti...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : prodottiFiltrati().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nessun prodotto trovato
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
                {prodottiFiltrati().map(prodotto => (
                  <div 
                    key={prodotto._id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => aggiungiProdotto(prodotto)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{prodotto.nome}</div>
                        <div className="text-sm text-gray-500">
                          {prodotto.ingredienti.length > 0 
                            ? prodotto.ingredienti.join(', ')
                            : prodotto.categoria
                          }
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {prodotto.inPromozione ? (
                          <div className="text-right">
                            <div className="text-red-500 font-medium">€{prodotto.prezzoPromo.toFixed(2)}</div>
                            <div className="text-gray-400 text-xs line-through">€{prodotto.prezzo.toFixed(2)}</div>
                          </div>
                        ) : (
                          <div className="font-medium">€{prodotto.prezzo.toFixed(2)}</div>
                        )}
                        
                        <div className="ml-2 p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200">
                          <Plus size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Colonna destra - Riepilogo ordine */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Ordine Corrente</h3>
            
            <div className="border rounded-lg">
              <div className="p-3 bg-gray-50 border-b">
                <div className="font-medium">{ordine.clienteNome}</div>
                <div className="text-sm text-gray-500">{ordine.clienteTelefono}</div>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-gray-700 mb-2">Prodotti Selezionati</h4>
                
                {ordine.articoli.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nessun prodotto selezionato
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {ordine.articoli.map((articolo, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border-b">
                        <div className="flex-1">
                          <div className="font-medium">{articolo.nome}</div>
                          <div className="text-sm text-gray-500">€{articolo.prezzo.toFixed(2)}</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                            onClick={() => aggiornaQuantita(index, -1)}
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span className="w-8 text-center font-medium">{articolo.quantita}</span>
                          
                          <button 
                            className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                            onClick={() => aggiornaQuantita(index, 1)}
                          >
                            <Plus size={16} />
                          </button>
                          
                          <button 
                            className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200 ml-2"
                            onClick={() => rimuoviProdotto(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Totale</span>
                    <span className="text-lg">€{calcolaTotale()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pulsanti azioni */}
        <div className="mt-6 flex justify-between">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={onPrev}
          >
            Indietro
          </button>
          
          <button 
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={procediAvanti}
          >
            Continua
          </button>
        </div>
      </div>
    </>
  );
};

export default NuovoOrdineProdotti;