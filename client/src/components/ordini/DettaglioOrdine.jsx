import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, User, Phone, Clock, Calendar, Truck, 
  Home, DollarSign, FileText, CheckCircle, X, 
  Edit, Trash2, AlertCircle, ArrowLeft, Save
} from 'lucide-react';

const DettaglioOrdine = ({ ordine, onClose, onSave, onDelete, isNew = false }) => {
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteTelefono: '',
    data: new Date().toISOString().split('T')[0],
    orario: '19:00',
    tipo: 'asporto',
    indirizzo: '',
    articoli: [],
    note: '',
    stato: 'confermato'
  });
  
  const [nuovoArticolo, setNuovoArticolo] = useState({
    nome: '',
    quantita: 1,
    prezzo: 0
  });
  
  const [errors, setErrors] = useState({});
  
  // Popola il form con i dati dell'ordine esistente
  useEffect(() => {
    if (ordine && !isNew) {
      setFormData(ordine);
    }
  }, [ordine, isNew]);
  
  // Funzione per aggiornare i campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Rimuovi eventuali errori per questo campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Funzione per aggiornare i campi del nuovo articolo
  const handleArticoloChange = (e) => {
    const { name, value } = e.target;
    setNuovoArticolo({
      ...nuovoArticolo,
      [name]: name === 'quantita' || name === 'prezzo' ? parseFloat(value) : value
    });
  };
  
  // Funzione per aggiungere un nuovo articolo
  const aggiungiArticolo = () => {
    if (!nuovoArticolo.nome) {
      setErrors({
        ...errors,
        nuovoArticolo: 'Nome articolo obbligatorio'
      });
      return;
    }
    
    const nuoviArticoli = [
      ...formData.articoli,
      { ...nuovoArticolo }
    ];
    
    setFormData({
      ...formData,
      articoli: nuoviArticoli
    });
    
    // Reset del form nuovo articolo
    setNuovoArticolo({
      nome: '',
      quantita: 1,
      prezzo: 0
    });
    
    // Rimuovi eventuali errori
    if (errors.nuovoArticolo) {
      setErrors({
        ...errors,
        nuovoArticolo: null
      });
    }
  };
  
  // Funzione per rimuovere un articolo
  const rimuoviArticolo = (index) => {
    const nuoviArticoli = [...formData.articoli];
    nuoviArticoli.splice(index, 1);
    
    setFormData({
      ...formData,
      articoli: nuoviArticoli
    });
  };
  
  // Calcola il totale dell'ordine
  const calcolaTotale = () => {
    return formData.articoli.reduce((total, item) => total + (item.prezzo * item.quantita), 0).toFixed(2);
  };
  
  // Funzione per salvare l'ordine
  const salvaOrdine = () => {
    // Validazione
    const newErrors = {};
    
    if (!formData.clienteNome) newErrors.clienteNome = 'Nome cliente obbligatorio';
    if (!formData.clienteTelefono) newErrors.clienteTelefono = 'Telefono obbligatorio';
    if (formData.tipo === 'consegna' && !formData.indirizzo) newErrors.indirizzo = 'Indirizzo obbligatorio per la consegna';
    if (formData.articoli.length === 0) newErrors.articoli = 'Aggiungi almeno un articolo';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Aggiorna il totale prima di salvare
    const ordineCompleto = {
      ...formData,
      totale: parseFloat(calcolaTotale())
    };
    
    // Chiama la funzione onSave del componente genitore
    onSave(ordineCompleto);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isNew ? 'Nuovo Ordine' : `Ordine ${ordine?.id || ''}`}
            </h2>
            <div className="flex space-x-2">
              <button 
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center hover:bg-green-200 transition-colors"
                onClick={salvaOrdine}
              >
                <Save size={18} className="mr-2" />
                Salva
              </button>
              <button 
                className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {!isNew && (
            <div className="flex px-4 pb-3 space-x-3">
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium flex items-center
                ${formData.stato === 'confermato' ? 'bg-blue-100 text-blue-700' : ''}
                ${formData.stato === 'in preparazione' ? 'bg-orange-100 text-orange-700' : ''}
                ${formData.stato === 'completato' ? 'bg-green-100 text-green-700' : ''}
                ${formData.stato === 'annullato' ? 'bg-red-100 text-red-700' : ''}
              `}>
                <span>Stato: {formData.stato}</span>
              </div>
              
              <select
                name="stato"
                value={formData.stato}
                onChange={handleChange}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                <option value="confermato">Confermato</option>
                <option value="in preparazione">In Preparazione</option>
                <option value="completato">Completato</option>
                <option value="annullato">Annullato</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-6">
          {/* Sezione cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <User className="text-blue-500 mr-2" size={18} />
              Dati Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome Cliente*</label>
                <input 
                  type="text" 
                  name="clienteNome"
                  value={formData.clienteNome}
                  onChange={handleChange}
                  className={`w-full border ${errors.clienteNome ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                  placeholder="Nome e Cognome"
                />
                {errors.clienteNome && (
                  <p className="text-red-500 text-xs mt-1">{errors.clienteNome}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefono*</label>
                <input 
                  type="tel" 
                  name="clienteTelefono"
                  value={formData.clienteTelefono}
                  onChange={handleChange}
                  className={`w-full border ${errors.clienteTelefono ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                  placeholder="Numero di telefono"
                />
                {errors.clienteTelefono && (
                  <p className="text-red-500 text-xs mt-1">{errors.clienteTelefono}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sezione data e orario */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="text-blue-500 mr-2" size={18} />
              Data e Orario
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Data*</label>
                <input 
                  type="date" 
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Orario*</label>
                <select 
                  name="orario"
                  value={formData.orario}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="18:00">18:00</option>
                  <option value="18:10">18:10</option>
                  <option value="18:20">18:20</option>
                  <option value="18:30">18:30</option>
                  <option value="18:40">18:40</option>
                  <option value="18:50">18:50</option>
                  <option value="19:00">19:00</option>
                  <option value="19:10">19:10</option>
                  <option value="19:20">19:20</option>
                  <option value="19:30">19:30</option>
                  <option value="19:40">19:40</option>
                  <option value="19:50">19:50</option>
                  <option value="20:00">20:00</option>
                  <option value="20:10">20:10</option>
                  <option value="20:20">20:20</option>
                  <option value="20:30">20:30</option>
                  <option value="20:40">20:40</option>
                  <option value="20:50">20:50</option>
                  <option value="21:00">21:00</option>
                  <option value="21:10">21:10</option>
                  <option value="21:20">21:20</option>
                  <option value="21:30">21:30</option>
                  <option value="21:40">21:40</option>
                  <option value="21:50">21:50</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Sezione tipo ordine */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <ShoppingBag className="text-blue-500 mr-2" size={18} />
              Tipo Ordine
            </h3>
            
            <div className="flex flex-wrap gap-3 mb-3">
              <label className={`
                flex items-center px-4 py-2 rounded-lg cursor-pointer
                ${formData.tipo === 'asporto' ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white border border-gray-300'}
              `}>
                <input 
                  type="radio" 
                  name="tipo" 
                  value="asporto"
                  checked={formData.tipo === 'asporto'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Home className={formData.tipo === 'asporto' ? 'text-blue-600' : 'text-gray-500'} size={18} />
                <span className={`ml-2 ${formData.tipo === 'asporto' ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  Asporto
                </span>
              </label>
              
              <label className={`
                flex items-center px-4 py-2 rounded-lg cursor-pointer
                ${formData.tipo === 'consegna' ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white border border-gray-300'}
              `}>
                <input 
                  type="radio" 
                  name="tipo" 
                  value="consegna"
                  checked={formData.tipo === 'consegna'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Truck className={formData.tipo === 'consegna' ? 'text-blue-600' : 'text-gray-500'} size={18} />
                <span className={`ml-2 ${formData.tipo === 'consegna' ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  Consegna
                </span>
              </label>
              
              <label className={`
                flex items-center px-4 py-2 rounded-lg cursor-pointer
                ${formData.tipo === 'ritiro' ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white border border-gray-300'}
              `}>
                <input 
                  type="radio" 
                  name="tipo" 
                  value="ritiro"
                  checked={formData.tipo === 'ritiro'}
                  onChange={handleChange}
                  className="hidden"
                />
                <User className={formData.tipo === 'ritiro' ? 'text-blue-600' : 'text-gray-500'} size={18} />
                <span className={`ml-2 ${formData.tipo === 'ritiro' ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  Ritiro in Loco
                </span>
              </label>
            </div>
            
            {formData.tipo === 'consegna' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Indirizzo di Consegna*</label>
                <input 
                  type="text" 
                  name="indirizzo"
                  value={formData.indirizzo || ''}
                  onChange={handleChange}
                  className={`w-full border ${errors.indirizzo ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                  placeholder="Via, numero civico, città"
                />
                {errors.indirizzo && (
                  <p className="text-red-500 text-xs mt-1">{errors.indirizzo}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Sezione articoli */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <FileText className="text-blue-500 mr-2" size={18} />
              Articoli Ordinati
            </h3>
            
            {errors.articoli && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg flex items-center">
                <AlertCircle size={16} className="mr-2" />
                <p className="text-sm">{errors.articoli}</p>
              </div>
            )}
            
            <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Articolo</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Quantità</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prezzo</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Totale</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.articoli.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-gray-500 text-sm">
                        Nessun articolo aggiunto
                      </td>
                    </tr>
                  ) : (
                    formData.articoli.map((articolo, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2">{articolo.nome}</td>
                        <td className="px-4 py-2 text-center">{articolo.quantita}</td>
                        <td className="px-4 py-2 text-right">€ {articolo.prezzo.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          € {(articolo.quantita * articolo.prezzo).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => rimuoviArticolo(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {formData.articoli.length > 0 && (
                    <tr className="bg-gray-100 font-medium">
                      <td colSpan="3" className="px-4 py-2 text-right">Totale Ordine:</td>
                      <td className="px-4 py-2 text-right text-green-700 font-bold">
                        € {calcolaTotale()}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Form per aggiungere un nuovo articolo */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Aggiungi Articolo</h4>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <input 
                    type="text"
                    name="nome"
                    value={nuovoArticolo.nome}
                    onChange={handleArticoloChange}
                    placeholder="Nome articolo"
                    className={`w-full border ${errors.nuovoArticolo ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 text-sm`}
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    type="number"
                    name="quantita"
                    value={nuovoArticolo.quantita}
                    onChange={handleArticoloChange}
                    min="1"
                    step="1"
                    placeholder="Qtà"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <span className="bg-gray-100 px-2 py-2 text-gray-500 text-sm">€</span>
                    <input 
                      type="number"
                      name="prezzo"
                      value={nuovoArticolo.prezzo}
                      onChange={handleArticoloChange}
                      min="0"
                      step="0.50"
                      placeholder="Prezzo"
                      className="flex-1 p-2 text-sm"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 text-sm transition-colors"
                    onClick={aggiungiArticolo}
                  >
                    Aggiungi
                  </button>
                </div>
              </div>
              {errors.nuovoArticolo && (
                <p className="text-red-500 text-xs mt-1">{errors.nuovoArticolo}</p>
              )}
            </div>
          </div>
          
          {/* Sezione note */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <FileText className="text-blue-500 mr-2" size={18} />
              Note Aggiuntive
            </h3>
            
            <textarea
              name="note"
              value={formData.note || ''}
              onChange={handleChange}
              placeholder="Aggiungi eventuali note, richieste speciali, allergie, ecc."
              className="w-full border border-gray-300 rounded-lg p-2 min-h-20"
            ></textarea>
          </div>
          
          {/* Azioni finali */}
          <div className="flex justify-between">
            <button 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              <ArrowLeft size={18} className="mr-2" />
              Annulla
            </button>
            
            {!isNew && (
              <button 
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center hover:bg-red-200 transition-colors"
                onClick={() => {
                  if (window.confirm('Sei sicuro di voler eliminare questo ordine?')) {
                    onDelete(ordine.id);
                  }
                }}
              >
                <Trash2 size={18} className="mr-2" />
                Elimina Ordine
              </button>
            )}
            
            <button 
              className="bg-green-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
              onClick={salvaOrdine}
            >
              <Save size={18} className="mr-2" />
              {isNew ? 'Crea Ordine' : 'Salva Modifiche'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DettaglioOrdine;