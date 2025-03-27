import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Clock, Home, Truck, User, AlertCircle } from 'lucide-react';
import axios from 'axios';

const NuovoOrdineDettagli = ({ ordine, onUpdate, onClose, onPrev, onNext }) => {
  // Stato per gli slot orari disponibili
  const [slotOrari, setSlotOrari] = useState([]);
  
  // Stato per il caricamento e gli errori
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Stato per gli errori di validazione
  const [formErrors, setFormErrors] = useState({});
  
  // Effetto per caricare gli slot orari all'avvio e quando cambia la data
  useEffect(() => {
    fetchSlotOrari();
  }, [ordine.data]);
  
  // Funzione per recuperare gli slot orari dal server
  const fetchSlotOrari = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Normalmente faremo una chiamata all'API per recuperare gli slot orari
      // Ma per ora simuliamo con alcuni dati di esempio
      // const response = await axios.get(`/api/ordini/slots?data=${ordine.data}`);
      
      // Simulazione di risposta dal server
      const response = {
        data: {
          success: true,
          data: {
            slots: [
              { orario: '18:00', ordiniOccupati: 2, maxOrdini: 5, isCompleto: false },
              { orario: '18:10', ordiniOccupati: 4, maxOrdini: 5, isCompleto: false },
              { orario: '18:20', ordiniOccupati: 5, maxOrdini: 5, isCompleto: true },
              { orario: '18:30', ordiniOccupati: 3, maxOrdini: 5, isCompleto: false },
              { orario: '18:40', ordiniOccupati: 1, maxOrdini: 5, isCompleto: false },
              { orario: '18:50', ordiniOccupati: 0, maxOrdini: 5, isCompleto: false },
              { orario: '19:00', ordiniOccupati: 2, maxOrdini: 5, isCompleto: false },
              { orario: '19:10', ordiniOccupati: 3, maxOrdini: 5, isCompleto: false },
              { orario: '19:20', ordiniOccupati: 4, maxOrdini: 5, isCompleto: false },
              { orario: '19:30', ordiniOccupati: 5, maxOrdini: 5, isCompleto: true },
              { orario: '19:40', ordiniOccupati: 2, maxOrdini: 5, isCompleto: false },
              { orario: '19:50', ordiniOccupati: 1, maxOrdini: 5, isCompleto: false },
              { orario: '20:00', ordiniOccupati: 0, maxOrdini: 5, isCompleto: false }
            ],
            data: new Date(ordine.data),
            aperto: true
          }
        }
      };
      
      setTimeout(() => {
        setSlotOrari(response.data.data.slots);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Errore nel caricamento degli slot orari');
      console.error('Errore nel caricamento degli slot orari:', err);
      setIsLoading(false);
    }
  };
  
  // Funzione per selezionare un tipo di ordine
  const selezionaTipoOrdine = (tipo) => {
    onUpdate('tipo', tipo);
    
    // Reset dell'errore quando l'utente modifica il campo
    if (formErrors.tipo) {
      setFormErrors({
        ...formErrors,
        tipo: null
      });
    }
  };
  
  // Funzione per selezionare uno slot orario
  const selezionaSlotOrario = (orario) => {
    onUpdate('orario', orario);
    
    // Reset dell'errore quando l'utente modifica il campo
    if (formErrors.orario) {
      setFormErrors({
        ...formErrors,
        orario: null
      });
    }
  };
  
  // Funzione per passare allo step successivo
  const procediAvanti = () => {
    // Validazione dei campi
    const errors = {};
    
    if (!ordine.tipo) {
      errors.tipo = 'Seleziona un tipo di ordine';
    }
    
    if (ordine.tipo === 'consegna' && !ordine.indirizzo) {
      errors.indirizzo = 'L\'indirizzo è obbligatorio per la consegna';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    onNext();
  };
  
  // Funzione per cambiare la data dell'ordine
  const cambiaData = (delta) => {
    const data = new Date(ordine.data);
    data.setDate(data.getDate() + delta);
    onUpdate('data', data.toISOString().split('T')[0]);
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
          <h2 className="text-xl font-semibold">Nuovo Ordine - Dettagli</h2>
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
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div className="ml-2">
              <span className="text-sm font-medium">Dettagli</span>
            </div>
            <div className="absolute left-0 bottom-0 w-full h-1 bg-red-500"></div>
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
          {/* Colonna sinistra - Tipo ordine e Note */}
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Tipo Ordine</h3>
              
              {formErrors.tipo && (
                <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  <p className="text-sm">{formErrors.tipo}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3">
                <div 
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors flex flex-col items-center
                    ${ordine.tipo === 'asporto' ? 'border-2 border-red-500 bg-red-50' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => selezionaTipoOrdine('asporto')}
                >
                  <Home className={ordine.tipo === 'asporto' ? 'text-red-500' : 'text-gray-500'} size={24} />
                  <span className={`mt-2 font-medium ${ordine.tipo === 'asporto' ? 'text-red-500' : 'text-gray-700'}`}>
                    Asporto
                  </span>
                </div>
                
                <div 
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors flex flex-col items-center
                    ${ordine.tipo === 'consegna' ? 'border-2 border-red-500 bg-red-50' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => selezionaTipoOrdine('consegna')}
                >
                  <Truck className={ordine.tipo === 'consegna' ? 'text-red-500' : 'text-gray-500'} size={24} />
                  <span className={`mt-2 font-medium ${ordine.tipo === 'consegna' ? 'text-red-500' : 'text-gray-700'}`}>
                    Consegna
                  </span>
                </div>
                
                <div 
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors flex flex-col items-center
                    ${ordine.tipo === 'ritiro' ? 'border-2 border-red-500 bg-red-50' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => selezionaTipoOrdine('ritiro')}
                >
                  <User className={ordine.tipo === 'ritiro' ? 'text-red-500' : 'text-gray-500'} size={24} />
                  <span className={`mt-2 font-medium ${ordine.tipo === 'ritiro' ? 'text-red-500' : 'text-gray-700'}`}>
                    Ritiro
                  </span>
                </div>
              </div>
            </div>
            
            {ordine.tipo === 'consegna' && (
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-1">Indirizzo Consegna*</label>
                <input 
                  type="text"
                  value={ordine.indirizzo}
                  onChange={(e) => onUpdate('indirizzo', e.target.value)}
                  className={`w-full border ${formErrors.indirizzo ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                  placeholder="Via, numero civico, città"
                />
                {formErrors.indirizzo && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.indirizzo}</p>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Note Aggiuntive</h3>
              <textarea
                value={ordine.note}
                onChange={(e) => onUpdate('note', e.target.value)}
                placeholder="Inserisci eventuali note, richieste speciali, allergie, ecc."
                className="w-full border border-gray-300 rounded-lg p-2 min-h-32"
              ></textarea>
            </div>
          </div>
          
          {/* Colonna destra - Data e Orario */}
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Data Ordine</h3>
              
              <div className="flex items-center space-x-4 mb-3">
                <button 
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => cambiaData(-1)}
                >
                  ← Giorno precedente
                </button>
                
                <div className="relative flex-1">
                  <div className="relative">
                    <input 
                      type="date"
                      value={ordine.data}
                      onChange={(e) => onUpdate('data', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
                
                <button 
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => cambiaData(1)}
                >
                  Giorno successivo →
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Orario di Consegna/Ritiro</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                  <p className="text-gray-500 mt-3">Caricamento slot orari...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  {error}
                </div>
              ) : slotOrari.length === 0 ? (
                <div className="text-center py-8 bg-yellow-100 text-yellow-700 rounded-lg">
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <p>Nessuno slot orario disponibile per questa data</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
                  {slotOrari.map((slot, index) => (
                    <button
                      key={index}
                      className={`
                        p-3 border rounded-lg ${slot.isCompleto ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${ordine.orario === slot.orario ? 'border-2 border-red-500 bg-red-50' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => !slot.isCompleto && selezionaSlotOrario(slot.orario)}
                      disabled={slot.isCompleto}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Clock className={`${ordine.orario === slot.orario ? 'text-red-500' : 'text-gray-500'}`} size={16} />
                        <span className={`ml-1 font-medium ${ordine.orario === slot.orario ? 'text-red-500' : 'text-gray-700'}`}>
                          {slot.orario}
                        </span>
                      </div>
                      
                      <div className="text-xs text-center text-gray-500">
                        {slot.ordiniOccupati}/{slot.maxOrdini} ordini
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${slot.isCompleto ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${(slot.ordiniOccupati / slot.maxOrdini) * 100}%` }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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

export default NuovoOrdineDettagli;