import React from 'react';
import { RefreshCw, Edit, Trash2, Eye, ChevronDown, User, Home, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const OrdiniList = ({
  ordini,
  onSelectOrdine,
  onDeleteOrdine,
  onChangeStato,
  ordineSelezionato,
  caricamento,
  getStatoColor
}) => {
  // Funzione per formattare la data
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: it });
    } catch (error) {
      return 'Data non valida';
    }
  };
  
  // Funzione per formattare il prezzo
  const formatPrezzo = (prezzo) => {
    return `€ ${prezzo.toFixed(2)}`.replace('.', ',');
  };
  
  // Stati successivi possibili per ogni stato
  const getNextStati = (stato) => {
    switch (stato.toLowerCase()) {
      case 'nuovo':
        return ['in preparazione', 'annullato'];
      case 'in preparazione':
        return ['in consegna', 'annullato'];
      case 'in consegna':
        return ['consegnato', 'annullato'];
      default:
        return [];
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Data</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stato</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tipo</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Totale</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {caricamento ? (
            <tr>
              <td colSpan={6} className="text-center py-4">
                <div className="flex justify-center items-center">
                  <RefreshCw size={20} className="animate-spin text-red-500 mr-2" />
                  <span className="text-gray-500">Caricamento...</span>
                </div>
              </td>
            </tr>
          ) : ordini.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                Nessun ordine trovato
              </td>
            </tr>
          ) : (
            ordini.map(ordine => (
              <tr 
                key={ordine._id} 
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${ordineSelezionato?._id === ordine._id ? 'bg-red-50' : ''}`}
                onClick={() => onSelectOrdine(ordine)}
              >
                <td className="px-4 py-3 text-sm text-gray-800">
                  <div className="font-medium">{formatDate(ordine.dataOrdine)}</div>
                  <div className="text-xs text-gray-500">#{ordine._id?.substring(0, 8)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-2">
                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                        <User size={14} className="text-red-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {ordine.cliente?.nome || 'Cliente non specificato'}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Phone size={10} className="mr-1" />
                        <span>{ordine.telefono || 'N/D'}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="relative group">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatoColor(ordine.stato)}`}>
                      {ordine.stato}
                      {getNextStati(ordine.stato).length > 0 && (
                        <ChevronDown size={14} className="ml-1" />
                      )}
                    </span>
                    
                    {/* Dropdown per cambiare stato */}
                    {getNextStati(ordine.stato).length > 0 && (
                      <div className="absolute left-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {getNextStati(ordine.stato).map(stato => (
                            <button
                              key={stato}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChangeStato(ordine._id, stato);
                              }}
                            >
                              Passa a: {stato}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {ordine.tipo || 'N/D'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                  {formatPrezzo(ordine.totale)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      className="p-1 rounded-full hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrdine(ordine);
                      }}
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Funzionalità modifica
                      }}
                    >
                      <Edit size={16} className="text-amber-600" />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOrdine(ordine._id);
                      }}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdiniList;