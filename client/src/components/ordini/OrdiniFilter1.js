import React, { useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { it } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { Filter, RefreshCw, Calendar, X } from 'lucide-react';

// Registra la localizzazione italiana
registerLocale('it', it);

const OrdiniFilter = ({ filtri, setFiltri, onRefresh, caricamento }) => {
  const [filtriAperti, setFiltriAperti] = useState(false);
  
  // Handler per il cambio di stato
  const handleChangeStato = (e) => {
    setFiltri({ ...filtri, stato: e.target.value });
  };
  
  // Handler per il cambio di tipo
  const handleChangeTipo = (e) => {
    setFiltri({ ...filtri, tipo: e.target.value });
  };
  
  // Handler per il cambio di cliente
  const handleChangeCliente = (e) => {
    setFiltri({ ...filtri, cliente: e.target.value });
  };
  
  // Handler per il cambio di data inizio
  const handleChangeDataInizio = (date) => {
    setFiltri({ ...filtri, dataInizio: date });
  };
  
  // Handler per il cambio di data fine
  const handleChangeDataFine = (date) => {
    setFiltri({ ...filtri, dataFine: date });
  };
  
  // Handler per reset filtri
  const handleResetFiltri = () => {
    setFiltri({
      stato: '',
      dataInizio: null,
      dataFine: null,
      cliente: '',
      tipo: ''
    });
  };
  
  // Controllo se ci sono filtri attivi
  const hasFiltriAttivi = () => {
    return filtri.stato || filtri.dataInizio || filtri.dataFine || filtri.cliente || filtri.tipo;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
            onClick={() => setFiltriAperti(!filtriAperti)}
          >
            <Filter size={18} />
            <span className="font-medium">Filtri</span>
            {hasFiltriAttivi() && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                Attivi
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {hasFiltriAttivi() && (
            <button 
              className="text-gray-500 hover:text-red-600 transition-colors text-sm flex items-center"
              onClick={handleResetFiltri}
            >
              <X size={14} className="mr-1" />
              Azzera filtri
            </button>
          )}
          <button 
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            onClick={onRefresh}
          >
            <RefreshCw size={18} className={`text-gray-600 ${caricamento ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {filtriAperti && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          {/* Filtro per stato */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Stato ordine</label>
            <select
              value={filtri.stato}
              onChange={handleChangeStato}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Tutti gli stati</option>
              <option value="nuovo">Nuovo</option>
              <option value="in preparazione">In preparazione</option>
              <option value="in consegna">In consegna</option>
              <option value="consegnato">Consegnato</option>
              <option value="annullato">Annullato</option>
            </select>
          </div>
          
          {/* Filtro per tipo */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo ordine</label>
            <select
              value={filtri.tipo}
              onChange={handleChangeTipo}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Tutti i tipi</option>
              <option value="asporto">Asporto</option>
              <option value="consegna">Consegna</option>
              <option value="ritiro">Ritiro</option>
              <option value="tavolo">Tavolo</option>
            </select>
          </div>
          
          {/* Filtro per cliente */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cliente</label>
            <input
              type="text"
              value={filtri.cliente}
              onChange={handleChangeCliente}
              placeholder="Nome cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Filtro per data inizio */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Da data</label>
            <div className="relative">
              <DatePicker
                selected={filtri.dataInizio}
                onChange={handleChangeDataInizio}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleziona data..."
                locale="it"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
          
          {/* Filtro per data fine */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">A data</label>
            <div className="relative">
              <DatePicker
                selected={filtri.dataFine}
                onChange={handleChangeDataFine}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleziona data..."
                locale="it"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdiniFilter;