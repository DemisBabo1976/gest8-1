import React from 'react';
import { X, CheckCircle, User, Phone, Calendar, Clock, Home, Truck, FileText, ShoppingBag } from 'lucide-react';

const NuovoOrdineConferma = ({ ordine, onClose, onPrev, onSave, isLoading }) => {
  // Funzione per formattare la data
  const formattaData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Funzione per calcolare il totale dell'ordine
  const calcolaTotale = () => {
    return ordine.articoli.reduce((total, item) => total + (item.prezzo * item.quantita), 0).toFixed(2);
  };
  
  // Funzione per renderizzare l'icona del tipo di ordine
  const renderIconaTipoOrdine = () => {
    switch (ordine.tipo) {
      case 'asporto':
        return <Home className="text-red-500" size={20} />;
      case 'consegna':
        return <Truck className="text-red-500" size={20} />;
      case 'ritiro':
        return <User className="text-red-500" size={20} />;
      default:
        return null;
    }
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
          <h2 className="text-xl font-semibold">Nuovo Ordine - Conferma</h2>
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
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
              <span className="text-sm">✓</span>
            </div>
            <div className="ml-2">
              <span className="text-sm font-medium">Prodotti</span>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-1 bg-green-500"></div>
          </div>
          
          <div className="flex items-center w-1/4 relative">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
              <span className="text-sm">✓</span>
            </div>
            <div className="ml-2">
              <span className="text-sm font-medium">Dettagli</span>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-1 bg-green-500"></div>
          </div>
          
          <div className="flex items-center w-1/4 relative">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              <CheckCircle size={18} />
            </div>
            <div className="ml-2">
              <span className="text-sm font-medium">Conferma</span>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-1 bg-red-500"></div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center text-green-700">
            <CheckCircle className="mr-2 flex-shrink-0" size={20} />
            <span className="font-medium">Controlla i dettagli dell'ordine e conferma</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonna sinistra - Dettagli cliente e consegna */}
          <div>
            <div className="mb-6 bg-white border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <User className="text-red-500 mr-2" size={18} />
                Dati Cliente
              </h3>
              
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-500 w-24">Nome:</span>
                  <span className="font-medium flex-1">{ordine.clienteNome}</span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-500 w-24">Telefono:</span>
                  <span className="font-medium flex-1">{ordine.clienteTelefono}</span>
                </div>
                
                {ordine.indirizzo && (
                  <div className="flex">
                    <span className="text-gray-500 w-24">Indirizzo:</span>
                    <span className="font-medium flex-1">{ordine.indirizzo}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6 bg-white border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <Clock className="text-red-500 mr-2" size={18} />
                Data e Orario
              </h3>
              
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-500 w-24">Data:</span>
                  <span className="font-medium flex-1">{formattaData(ordine.data)}</span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-500 w-24">Orario:</span>
                  <span className="font-medium flex-1">{ordine.orario}</span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-500 w-24">Tipo:</span>
                  <span className="font-medium flex-1 flex items-center">
                    {renderIconaTipoOrdine()}
                    <span className="ml-1 capitalize">{ordine.tipo}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {ordine.note && (
              <div className="mb-6 bg-white border rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FileText className="text-red-500 mr-2" size={18} />
                  Note
                </h3>
                
                <p className="text-gray-700">{ordine.note}</p>
              </div>
            )}
          </div>
          
          {/* Colonna destra - Dettagli prodotti e totale */}
          <div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <ShoppingBag className="text-red-500 mr-2" size={18} />
                  Riepilogo Ordine
                </h3>
              </div>
              
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="text-center pb-2 text-xs font-medium text-gray-500 uppercase">Qtà</th>
                      <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase">Prezzo</th>
                      <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase">Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordine.articoli.map((articolo, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{articolo.nome}</td>
                        <td className="py-2 text-center">{articolo.quantita}</td>
                        <td className="py-2 text-right">€{articolo.prezzo.toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">€{(articolo.quantita * articolo.prezzo).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="pt-4 text-right font-medium">Totale:</td>
                      <td className="pt-4 text-right font-bold text-lg">€{calcolaTotale()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pulsanti azioni */}
        <div className="mt-6 flex justify-between">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={onPrev}
            disabled={isLoading}
          >
            Indietro
          </button>
          
          <button 
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            onClick={onSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Creazione in corso...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                <span>Conferma Ordine</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default NuovoOrdineConferma;