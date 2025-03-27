import React from 'react';
import { Home, PhoneCall, User, Monitor, CheckCircle, ShoppingCart, ArrowRight } from 'lucide-react';

const OrdiniWidget = ({ metriche = {}, onClick }) => {
  // Valori predefiniti per evitare errori quando metriche è undefined
  const {
    ordiniAsporto = 0,
    ordiniConsegna = 0,
    ordiniRitiro = 0,
    ordiniOnline = 0,
    ordiniOggi = 0
  } = metriche || {};

  return (
    <div 
      className="bg-red-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer md:col-span-2"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <ShoppingCart className="text-red-500" />
          <h3 className="text-gray-700 font-medium ml-2">Gestione Ordini</h3>
        </div>
        <ArrowRight size={16} className="text-gray-400" />
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Home className="text-orange-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{ordiniAsporto}</p>
          <p className="text-gray-500 text-xs">Asporto</p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <PhoneCall className="text-blue-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{ordiniConsegna}</p>
          <p className="text-gray-500 text-xs">Consegne</p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <User className="text-green-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{ordiniRitiro}</p>
          <p className="text-gray-500 text-xs">Ritiri</p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Monitor className="text-teal-500" size={20} />
          </div>
          <p className="text-xl font-bold text-gray-800">{ordiniOnline}</p>
          <p className="text-gray-500 text-xs">Online</p>
        </div>
        <div className="text-center bg-red-200 rounded-lg p-1">
          <div className="flex justify-center mb-1">
            <CheckCircle className="text-red-600" size={20} />
          </div>
          <p className="text-xl font-bold text-red-700">{ordiniOggi}</p>
          <p className="text-red-600 text-xs">Totale</p>
        </div>
      </div>
    </div>
  );
};

export default OrdiniWidget;