import React, { useState, useEffect } from 'react';
import { X, User, Search, Plus, Phone } from 'lucide-react';
import { getClienti, createCliente } from '../../services/clientiService';

const NuovoOrdineCliente = ({ ordine, onUpdate, onClose, onNext }) => {
  // Stato per memorizzare i clienti trovati nella ricerca
  const [clienti, setClienti] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effetto per caricare i clienti all'avvio
  useEffect(() => {
    const fetchClienti = async () => {
      try {
        setIsLoading(true);
        const clientiData = await getClienti();
        console.log('Clienti caricati:', clientiData);

        // Assicurati di impostare lo stato con un array
        setClienti(Array.isArray(clientiData) ? clientiData : []);
        setError(null);
      } catch (error) {
        console.error('Errore nel caricamento dei clienti', error);
        setError('Impossibile caricare i clienti. Riprova più tardi.');
        setClienti([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClienti();
  }, []);

  return (
    <div>
      {/* Indicatore di caricamento */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 inline-block"></div>
          <p className="text-gray-500 mt-2">Caricamento clienti...</p>
        </div>
      )}

      {/* Messaggio di errore */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Contenuto normale del componente */}
      {!isLoading && !error && (
        <div>
          {/* Qui inserisci il contenuto normale del componente */}
          <ul>
            {clienti.map((cliente) => (
              <li key={cliente.id}>{cliente.nome}</li>
            ))}
          </ul>
          {/* Aggiungi qui gli altri elementi del componente come form, bottoni, ecc. */}
        </div>
      )}
    </div>
  );
};

export default NuovoOrdineCliente;