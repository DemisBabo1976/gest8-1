import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Componente per i widget card
 * Utilizzato per creare tutti i widget della dashboard
 * 
 * @param {string} titolo - Titolo del widget 
 * @param {React.ReactNode} icona - Icona Lucide React da mostrare
 * @param {string} colore - Classe CSS per il colore di sfondo
 * @param {Function} onClick - Funzione chiamata quando si clicca sul widget
 * @param {string} colSpan - Classe CSS per gestire la larghezza del widget
 * @param {React.ReactNode} children - Contenuto interno del widget
 */
const WidgetCard = ({ titolo, icona, colore, children, onClick, colSpan = "" }) => {
  return (
    <div 
      className={`${colore} rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer ${colSpan}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {icona}
          <h3 className="text-gray-700 font-medium ml-2">{titolo}</h3>
        </div>
        <ArrowRight size={16} className="text-gray-400" />
      </div>
      {children}
    </div>
  );
};

export default WidgetCard;