import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, Tag } from 'lucide-react';
import { getProdotti } from '../../services/menuService';

const ProductSelect = ({ onSelectProdotto }) => {
  const [prodotti, setProdotti] = useState([]);
  const [categorieAttive, setCategorieAttive] = useState(['pizza']);
  const [caricamento, setCaricamento] = useState(false);
  const [ricerca, setRicerca] = useState('');
  
  // Caricamento prodotti
  useEffect(() => {
    const fetchProdotti = async () => {
      try {
        setCaricamento(true);
        const data = await getProdotti();
        // Filtra solo i prodotti attivi
        setProdotti(data.filter(p => p.attivo));
      } catch (error) {
        console.error('Errore nel caricamento dei prodotti:', error);
      } finally {
        setCaricamento(false);
      }
    };
    
    fetchProdotti();
  }, []);
  
  // Gestione categorie
  const toggleCategoria = (categoria) => {
    if (categorieAttive.includes(categoria)) {
      setCategorieAttive(prev => prev.filter(c => c !== categoria));
    } else {
      setCategorieAttive(prev => [...prev, categoria]);
    }
  };
  
  // Lista categorie uniche
  const categorie = [...new Set(prodotti.map(p => p.categoria))];
  
  // Filtro prodotti
  const prodottiFiltrati = prodotti.filter(prodotto => {
    const matchCategoria = categorieAttive.includes(prodotto.categoria);
    const matchRicerca = prodotto.nome.toLowerCase().includes(ricerca.toLowerCase());
    return matchCategoria && matchRicerca;
  });
  
  // Formattazione prezzo
  const formatPrezzo = (prezzo) => {
    return `€ ${prezzo.toFixed(2)}`.replace('.', ',');
  };
  
  // Traduzione nome categoria
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

  return (
    <div>
      {/* Barra di ricerca */}
      <div className="relative mb-3">
        <input
          type="text"
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
          placeholder="Cerca prodotto..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>
      
      {/* Filtro categorie */}
      <div className="flex flex-wrap gap-2 mb-3">
        {categorie.map(categoria => (
          <button
            key={categoria}
            className={`px-3 py-1 text-sm rounded-full border ${
              categorieAttive.includes(categoria) 
                ? 'bg-red-100 text-red-700 border-red-300' 
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => toggleCategoria(categoria)}
          >
            {getCategoriaLabel(categoria)}
          </button>
        ))}
      </div>
      
      {/* Lista prodotti */}
      {caricamento ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <RefreshCw size={24} className="animate-spin text-red-500 mx-auto mb-2" />
          <p className="text-gray-500">Caricamento prodotti...</p>
        </div>
      ) : prodottiFiltrati.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">Nessun prodotto corrisponde ai criteri di ricerca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {prodottiFiltrati.map(prodotto => (
            <div 
              key={prodotto._id} 
              className="flex justify-between items-center bg-gray-50 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectProdotto(prodotto)}
            >
              <div>
                <div className="font-medium">{prodotto.nome}</div>
                <div className="text-sm text-gray-600">{formatPrezzo(prodotto.prezzo)}</div>
              </div>
              <div className="flex items-center">
                {prodotto.inPromozione && (
                  <span className="mr-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full flex items-center">
                    <Tag size={10} className="mr-1" />
                    Promo
                  </span>
                )}
                <button className="p-1 bg-red-100 rounded-full hover:bg-red-200">
                  <Plus size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSelect;