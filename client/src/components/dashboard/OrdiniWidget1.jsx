import React, { useMemo } from 'react';
import { ArrowRight, Home, PhoneCall, User, Monitor, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrdiniWidget = ({ ordiniAttivi }) => {
  const navigate = useNavigate();

  // Calcola i conteggi per tipo di ordine
  const conteggi = useMemo(() => {
    if (!ordiniAttivi || !Array.isArray(ordiniAttivi)) {
      return {
        asporto: 0,
        consegna: 0,
        ritiro: 0,
        online: 0,
        totale: 0
      };
    }

    return ordiniAttivi.reduce((acc, ordine) => {
      const tipo = ordine.tipo?.toLowerCase() || '';
      
      // Incrementa il conteggio totale
      acc.totale += 1;
      
      // Incrementa il conteggio per tipo specifico
      if (tipo === 'asporto') {
        acc.asporto += 1;
      } else if (tipo === 'consegna' || tipo === 'domicilio') {
        acc.consegna += 1;
      } else if (tipo === 'ritiro') {
        acc.ritiro += 1;
      } else if (tipo === 'online') {
        acc.online += 1;
      }
      
      return acc;
    }, {
      asporto: 0,
      consegna: 0,
      ritiro: 0,
      online: 0,
      totale: 0
    });
  }, [ordiniAttivi]);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-700 font-medium">Ordini Attivi</h3>
        <button 
          className="text-red-600 hover:text-red-800 flex items-center text-sm"
          onClick={() => navigate('/ordini')}
        >
          Vedi Tutti
          <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Home className="text-orange-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{conteggi.asporto}</p>
          <p className="text-gray-500 text-xs">Asporto</p>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <PhoneCall className="text-blue-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{conteggi.consegna}</p>
          <p className="text-gray-500 text-xs">Consegne</p>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <User className="text-green-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{conteggi.ritiro}</p>
          <p className="text-gray-500 text-xs">Ritiri</p>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Monitor className="text-teal-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{conteggi.online}</p>
          <p className="text-gray-500 text-xs">Online</p>
        </div>
        
        <div className="text-center bg-red-200 rounded-lg p-1">
          <div className="flex justify-center mb-1">
            <CheckCircle className="text-red-600" size={20} />
          </div>
          <p className="text-xl font-bold text-red-700">{conteggi.totale}</p>
          <p className="text-red-600 text-xs">Totale</p>
        </div>
      </div>
    </div>
  );
};

export default OrdiniWidget;