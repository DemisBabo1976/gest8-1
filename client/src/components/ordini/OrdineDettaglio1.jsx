import React, { useState } from 'react';
import { 
  X, ChevronLeft, Phone, Calendar, Clock, Home, User, Package,
  CreditCard, Truck, FileText, Edit, Trash2, Printer, CheckCircle,
  AlertTriangle, RefreshCw, DollarSign, ShoppingCart, Tag
} from 'lucide-react';
import { updateOrdine } from '../../services/ordiniService';

const OrdineDettaglio = ({ ordine, onClose, onDelete, onRefresh }) => {
  const [caricamento, setCaricamento] = useState(false);
  const [modificaStato, setModificaStato] = useState(false);
  const [nuovoStato, setNuovoStato] = useState(ordine.stato);

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleString('it-IT', options);
  };

  // Funzione per il colore del badge stato
  const getStatoColor = (stato) => {
    switch (stato) {
      case 'Nuovo':
        return 'bg-blue-100 text-blue-800';
      case 'In preparazione':
        return 'bg-amber-100 text-amber-800';
      case 'Pronto':
        return 'bg-green-100 text-green-800';
      case 'Consegnato':
        return 'bg-teal-100 text-teal-800';
      case 'Annullato':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funzione per il colore del badge tipo ordine
  const getTipoOrdineColor = (tipo) => {
    switch (tipo) {
      case 'Asporto':
        return 'bg-orange-100 text-orange-800';
      case 'Tavolo':
        return 'bg-indigo-100 text-indigo-800';
      case 'Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Online':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Icona per il tipo di ordine
  const getTipoOrdineIcon = (tipo) => {
    switch (tipo) {
      case 'Asporto':
        return <Package size={18} />;
      case 'Tavolo':
        return <User size={18} />;
      case 'Delivery':
        return <Truck size={18} />;
      case 'Online':
        return <CreditCard size={18} />;
      default:
        return <ShoppingCart size={18} />;
    }
  };

  // Funzione per cambiare stato
  const handleCambiaStato = async () => {
    try {
      setCaricamento(true);
      const result = await updateOrdine(ordine._id, { stato: nuovoStato });
      
      if (result.success) {
        // Aggiorna localmente
        ordine.stato = nuovoStato;
        setModificaStato(false);
        
        // Aggiorna la lista principale
        onRefresh();
      } else {
        throw new Error(result.message || 'Errore nell\'aggiornamento dello stato');
      }
    } catch (error) {
      console.error('Errore nel cambio di stato:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  // Funzione per stampare l'ordine
  const handleStampaOrdine = () => {
    // Implementazione della funzione di stampa
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
              onClick={onClose}
            >
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              Dettaglio Ordine: {ordine.numeroOrdine}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={handleStampaOrdine}
            >
              <Printer size={20} className="text-gray-500" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={onClose}
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Contenuto */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonna 1: Informazioni ordine */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">Informazioni Ordine</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stato:</span>
                    {modificaStato ? (
                      <div className="flex items-center">
                        <select
                          value={nuovoStato}
                          onChange={(e) => setNuovoStato(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg mr-2"
                        >
                          <option value="Nuovo">Nuovo</option>
                          <option value="In preparazione">In preparazione</option>
                          <option value="Pronto">Pronto</option>
                          <option value="Consegnato">Consegnato</option>
                          <option value="Annullato">Annullato</option>
                        </select>
                        <button 
                          className="p-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                          onClick={handleCambiaStato}
                          disabled={caricamento}
                        >
                          {caricamento ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatoColor(ordine.stato)}`}>
                          {ordine.stato}
                        </span>
                        <button 
                          className="ml-2 p-1 rounded-full hover:bg-gray-200"
                          onClick={() => setModificaStato(true)}
                        >
                          <Edit size={14} className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tipo:</span>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getTipoOrdineColor(ordine.tipoOrdine)}`}>
                      {getTipoOrdineIcon(ordine.tipoOrdine)}
                      <span className="ml-1">{ordine.tipoOrdine}</span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
<span className="text-gray-600">Data ordine:</span>
                    <span className="text-gray-800">{formatDate(ordine.dataOrdine)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consegna:</span>
                    <span className="text-gray-800">{formatDate(ordine.orarioConsegna)}</span>
                  </div>
                  
                  {ordine.tipoOrdine === 'Tavolo' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tavolo:</span>
                      <span className="text-gray-800">N° {ordine.tavolo}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagamento:</span>
                    <span className="text-gray-800">{ordine.metodoPagamento}</span>
                  </div>
                </div>
              </div>
              
              {/* Cliente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">Cliente</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="text-gray-800 font-medium">
                      {ordine.cliente?.nome || ordine.datiCliente?.nome || 'N/D'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefono:</span>
                    <span className="text-gray-800">
                      {ordine.cliente?.telefono || ordine.datiCliente?.telefono || 'N/D'}
                    </span>
                  </div>
                  
                  {ordine.cliente?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-800">{ordine.cliente.email}</span>
                    </div>
                  )}
                  
                  {(ordine.cliente?.badge || ordine.datiCliente?.badge) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Badge:</span>
                      <span className="text-gray-800 capitalize">
                        {ordine.cliente?.badge || ordine.datiCliente?.badge}
                      </span>
                    </div>
                  )}
                  
                  {(ordine.cliente?.punti !== undefined || ordine.datiCliente?.punti !== undefined) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Punti:</span>
                      <span className="text-gray-800">
                        {ordine.cliente?.punti || ordine.datiCliente?.punti || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Indirizzo (solo per delivery) */}
              {ordine.tipoOrdine === 'Delivery' && ordine.indirizzo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">Indirizzo Consegna</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Via:</span>
                      <span className="text-gray-800">{ordine.indirizzo.via}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Civico:</span>
                      <span className="text-gray-800">{ordine.indirizzo.civico}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Città:</span>
                      <span className="text-gray-800">{ordine.indirizzo.citta}</span>
                    </div>
                    
                    {ordine.indirizzo.cap && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">CAP:</span>
                        <span className="text-gray-800">{ordine.indirizzo.cap}</span>
                      </div>
                    )}
                    
                    {ordine.indirizzo.note && (
                      <div className="mt-2">
                        <span className="text-gray-600 block mb-1">Note:</span>
                        <p className="text-gray-800 text-sm bg-white p-2 rounded border border-gray-200">
                          {ordine.indirizzo.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Colonna 2: Prodotti */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">Prodotti Ordinati</h3>
                
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Prodotto</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Quantità</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Prezzo</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Totale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordine.prodotti && ordine.prodotti.length > 0 ? (
                        ordine.prodotti.map((prodotto, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-medium text-gray-800">{prodotto.nome}</span>
                                {prodotto.inPromozione && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                    Promo
                                  </span>
                                )}
                                {prodotto.nota && (
                                  <p className="text-xs text-gray-500 mt-1">Nota: {prodotto.nota}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-medium text-gray-800">{prodotto.quantita}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {prodotto.inPromozione ? (
                                <div className="text-red-600 text-sm">
                                  <span className="line-through text-gray-400 mr-1">
                                    €{prodotto.prezzo.toFixed(2)}
                                  </span>
                                  €{prodotto.prezzoPromo.toFixed(2)}
                                </div>
                              ) : (
                                <span className="text-gray-800">€{prodotto.prezzo.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-gray-800">
                                €{((prodotto.inPromozione ? prodotto.prezzoPromo : prodotto.prezzo) * prodotto.quantita).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                            Nessun prodotto trovato
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Riepilogo totali */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Colonna sinistra: Note */}
                  <div>
                    {ordine.note && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Note Ordine</h4>
                        <p className="text-gray-800 bg-white p-3 rounded border border-gray-200 text-sm">
                          {ordine.note}
                        </p>
                      </div>
                    )}
                    
                    {ordine.puntiGuadagnati > 0 && (
                      <div className="mt-4 flex items-center">
                        <Tag className="text-green-600 mr-2" size={18} />
                        <span className="text-green-600 font-medium">
                          +{ordine.puntiGuadagnati} punti fedeltà guadagnati
                        </span>
                      </div>
                    )}
                    
                    {ordine.puntiUtilizzati > 0 && (
                      <div className="mt-2 flex items-center">
                        <Tag className="text-amber-600 mr-2" size={18} />
                        <span className="text-amber-600 font-medium">
                          {ordine.puntiUtilizzati} punti fedeltà utilizzati
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Colonna destra: Totali */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Riepilogo Pagamento</h4>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotale:</span>
                        <span className="font-medium">
                          €{(ordine.totale + (ordine.sconto || 0)).toFixed(2)}
                        </span>
                      </div>
                      
                      {ordine.sconto > 0 && (
                        <div className="flex justify-between mb-2 text-red-600">
                          <span>Sconto:</span>
                          <span>- €{ordine.sconto.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2 mt-2">
                        <span>Totale:</span>
                        <span className="text-red-600">€{ordine.totale.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                        <span className="text-gray-600">Metodo di pagamento:</span>
                        <span className="font-medium text-gray-800 flex items-center">
                          {ordine.metodoPagamento === 'Contanti' && <DollarSign size={16} className="mr-1 text-green-600" />}
                          {ordine.metodoPagamento === 'Carta' && <CreditCard size={16} className="mr-1 text-blue-600" />}
                          {ordine.metodoPagamento === 'Buoni pasto' && <FileText size={16} className="mr-1 text-amber-600" />}
                          {ordine.metodoPagamento === 'Online' && <ShoppingCart size={16} className="mr-1 text-purple-600" />}
                          {ordine.metodoPagamento}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Azioni */}
              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={handleStampaOrdine}
                >
                  <Printer size={18} className="mr-2" />
                  Stampa
                </button>
                <button 
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
                  onClick={() => {
                    // Implementare la modifica dell'ordine
                    alert('Funzionalità di modifica da implementare');
                  }}
                >
                  <Edit size={18} className="mr-2" />
                  Modifica
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  onClick={() => onDelete(ordine._id)}
                >
                  <Trash2 size={18} className="mr-2" />
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdineDettaglio;