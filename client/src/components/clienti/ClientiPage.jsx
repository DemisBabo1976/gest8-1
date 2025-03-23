import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, PlusCircle, ArrowLeft, Phone, Home, Tag, Award,
  Clock, Eye, Mail, FileText, Filter, Download, RefreshCw, MoreHorizontal,
  Edit, Trash2, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { 
  getClienti, 
  getCliente, 
  createCliente, 
  updateCliente, 
  deleteCliente
} from '../../services/clientiService';

const ClientiPage = () => {
  // Stati per la gestione dei dati
  const [clienti, setClienti] = useState([]);
  const [clienteSelezionato, setClienteSelezionato] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const [itemPerPagina, setItemPerPagina] = useState(10);
  const [ordinamento, setOrdinamento] = useState({ campo: 'nome', direzione: 'asc' });
  const [caricamento, setCaricamento] = useState(false);
  const [modalAperta, setModalAperta] = useState(false);
  const [modalModifica, setModalModifica] = useState(false);
  const [nuovoCliente, setNuovoCliente] = useState({
    nome: '',
    telefono: '',
    email: '',
    indirizzo: '',
    badge: 'bronzo',
    punti: 0,
    dataRegistrazione: '',
    ultimoOrdine: '',
    note: ''
  });

  const navigate = useNavigate();

  // Caricamento iniziale dei dati
  useEffect(() => {
    fetchClienti();
  }, []);

  // Funzione per recuperare tutti i clienti dal backend
  const fetchClienti = async () => {
    try {
      setCaricamento(true);
      const data = await getClienti();
      setClienti(data);
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
      alert('Errore nel recupero dei clienti. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  // Gestione filtro
  const clientiFiltrati = clienti.filter(cliente => 
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.telefono.includes(filtro) ||
    cliente.email.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.indirizzo.toLowerCase().includes(filtro.toLowerCase())
  );

  // Gestione ordinamento
  const clientiOrdinati = [...clientiFiltrati].sort((a, b) => {
    const campoA = a[ordinamento.campo];
    const campoB = b[ordinamento.campo];
    
    // Gestione speciale per date
    if (ordinamento.campo === 'ultimoOrdine' || ordinamento.campo === 'dataRegistrazione') {
      const dateA = campoA ? new Date(campoA) : new Date(0);
      const dateB = campoB ? new Date(campoB) : new Date(0);
      
      return ordinamento.direzione === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    }
    
    // Ordinamento numerico
    if (typeof campoA === 'number' && typeof campoB === 'number') {
      return ordinamento.direzione === 'asc' ? campoA - campoB : campoB - campoA;
    }
    
    // Ordinamento alfabetico
    const valA = String(campoA || '').toLowerCase();
    const valB = String(campoB || '').toLowerCase();
    
    if (valA < valB) return ordinamento.direzione === 'asc' ? -1 : 1;
    if (valA > valB) return ordinamento.direzione === 'asc' ? 1 : -1;
    return 0;
  });

  // Gestione paginazione
  const indiceUltimoItem = paginaCorrente * itemPerPagina;
  const indicePrimoItem = indiceUltimoItem - itemPerPagina;
  const clientiPaginati = clientiOrdinati.slice(indicePrimoItem, indiceUltimoItem);
  const totalePagine = Math.ceil(clientiOrdinati.length / itemPerPagina);

  // Gestione ordinamento
  const ordinaClienti = (campo) => {
    if (ordinamento.campo === campo) {
      setOrdinamento({
        campo,
        direzione: ordinamento.direzione === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setOrdinamento({ campo, direzione: 'asc' });
    }
  };

  // Funzioni per la gestione dei clienti
  const handleSelectCliente = (cliente) => {
    setClienteSelezionato(cliente);
  };

  const handleCloseDettagli = () => {
    setClienteSelezionato(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setNuovoCliente(prev => ({ 
        ...prev, 
        [name]: value === '' ? 0 : parseFloat(value) 
      }));
    } else {
      setNuovoCliente(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenAddModal = () => {
    // Reset del form per un nuovo cliente
    setNuovoCliente({
      nome: '',
      telefono: '',
      email: '',
      indirizzo: '',
      badge: 'bronzo',
      punti: 0,
      note: ''
    });
    setModalModifica(false);
    setModalAperta(true);
  };

  const handleOpenEditModal = (cliente) => {
    // Carica i dati del cliente nel form
    setNuovoCliente({
      ...cliente,
      // Assicurati che punti sia un numero
      punti: parseInt(cliente.punti, 10) || 0
    });
    setModalModifica(true);
    setModalAperta(true);
  };

  const handleAggiungiCliente = async () => {
    try {
      setCaricamento(true);
      
      if (modalModifica) {
        // Aggiornamento cliente esistente
        const result = await updateCliente(nuovoCliente._id, nuovoCliente);
        
        if (result.success) {
          // Aggiorna la lista locale dei clienti
          setClienti(clienti.map(cliente => 
            cliente._id === nuovoCliente._id ? result.data : cliente
          ));
          
          // Se è il cliente selezionato, aggiorna anche quello
          if (clienteSelezionato && clienteSelezionato._id === nuovoCliente._id) {
            setClienteSelezionato(result.data);
          }
          
          alert('Cliente aggiornato con successo!');
        }
      } else {
        // Creazione nuovo cliente
        const result = await createCliente(nuovoCliente);
        
        if (result.success) {
          // Aggiungi il nuovo cliente alla lista locale
          setClienti([...clienti, result.data]);
          alert('Cliente creato con successo!');
        }
      }
      
      // Chiudi il modal
      setModalAperta(false);
    } catch (error) {
      console.error('Errore durante il salvataggio del cliente:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };

  const handleCancellazione = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        setCaricamento(true);
        const result = await deleteCliente(id);
        
        if (result.success) {
          // Rimuovi il cliente dalla lista locale
          setClienti(clienti.filter(cliente => cliente._id !== id));
          
          // Se è il cliente selezionato, deselezionalo
          if (clienteSelezionato && clienteSelezionato._id === id) {
            setClienteSelezionato(null);
          }
          
          alert('Cliente eliminato con successo!');
        }
      } catch (error) {
        console.error('Errore durante l\'eliminazione del cliente:', error);
        alert('Si è verificato un errore. Riprova più tardi.');
      } finally {
        setCaricamento(false);
      }
    }
  };

  // Funzione per il colore del badge
  const getBadgeColor = (badge) => {
    switch (badge.toLowerCase()) {
      case 'bronzo': return 'bg-amber-100 text-amber-800';
      case 'argento': return 'bg-gray-200 text-gray-800';
      case 'oro': return 'bg-yellow-100 text-yellow-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Esportazione clienti in CSV
  const exportCSV = () => {
    // Intestazioni CSV
    const headers = ['Nome', 'Telefono', 'Email', 'Indirizzo', 'Badge', 'Punti', 'Data Registrazione', 'Ultimo Ordine', 'Note'];
    
    // Dati CSV
    const rows = clienti.map(cliente => [
      cliente.nome,
      cliente.telefono,
      cliente.email,
      cliente.indirizzo,
      cliente.badge,
      cliente.punti,
      formatDate(cliente.dataRegistrazione),
      formatDate(cliente.ultimoOrdine),
      cliente.note
    ]);
    
    // Concatena intestazioni e righe
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Crea un file CSV e scaricalo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `clienti_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 min-h-screen p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="text-gray-600" />
          </button>
          <div className="flex items-center">
            <Users className="text-teal-500 mr-2" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Gestione Clienti</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="bg-white rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            onClick={exportCSV}
          >
            <Download className="text-teal-600" size={18} />
            <span className="text-gray-700 text-sm">Esporta</span>
          </button>
          <button 
            className="bg-teal-500 rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-teal-600 transition-colors text-white"
            onClick={handleOpenAddModal}
          >
            <PlusCircle size={18} />
            <span className="text-sm">Nuovo Cliente</span>
          </button>
        </div>
      </header>

      {/* Contenitore principale */}
      <div className="flex gap-6">
        {/* Lista clienti */}
        <div className={`bg-white rounded-xl shadow-lg p-4 ${clienteSelezionato ? 'w-2/3' : 'w-full'}`}>
          {/* Barra di ricerca e filtri */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Cerca cliente..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100">
                <Filter size={18} className="text-gray-600" />
              </button>
              <button 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                onClick={fetchClienti}
              >
                <RefreshCw size={18} className={`text-gray-600 ${caricamento ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabella clienti */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer" onClick={() => ordinaClienti('nome')}>
                    Nome {ordinamento.campo === 'nome' && (ordinamento.direzione === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Telefono</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Badge</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer" onClick={() => ordinaClienti('punti')}>
                    Punti {ordinamento.campo === 'punti' && (ordinamento.direzione === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer" onClick={() => ordinaClienti('ultimoOrdine')}>
                    Ultimo Ordine {ordinamento.campo === 'ultimoOrdine' && (ordinamento.direzione === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {caricamento ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="flex justify-center items-center">
                        <RefreshCw size={20} className="animate-spin text-teal-500 mr-2" />
                        <span className="text-gray-500">Caricamento...</span>
                      </div>
                    </td>
                  </tr>
                ) : clientiPaginati.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      Nessun cliente trovato
                    </td>
                  </tr>
                ) : (
                  clientiPaginati.map(cliente => (
                    <tr 
                      key={cliente._id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${clienteSelezionato?._id === cliente._id ? 'bg-teal-50' : ''}`}
                      onClick={() => handleSelectCliente(cliente)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{cliente.nome}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cliente.telefono}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(cliente.badge)}`}>
                          {cliente.badge.charAt(0).toUpperCase() + cliente.badge.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cliente.punti}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(cliente.ultimoOrdine)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCliente(cliente);
                            }}
                          >
                            <Eye size={16} className="text-teal-600" />
                          </button>
                          <button 
                            className="p-1 rounded-full hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(cliente);
                            }}
                          >
                            <Edit size={16} className="text-amber-600" />
                          </button>
                          <button 
                            className="p-1 rounded-full hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancellazione(cliente._id);
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

          {/* Paginazione */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Mostrando {clientiFiltrati.length > 0 ? indicePrimoItem + 1 : 0} - {Math.min(indiceUltimoItem, clientiFiltrati.length)} di {clientiFiltrati.length} clienti
            </div>
            <div className="flex items-center space-x-1">
              <button 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                disabled={paginaCorrente === 1}
                onClick={() => setPaginaCorrente(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              {[...Array(totalePagine)].map((_, index) => (
                <button 
                  key={index}
                  className={`w-8 h-8 rounded-lg border ${paginaCorrente === index + 1 ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-300 hover:bg-gray-100'}`}
                  onClick={() => setPaginaCorrente(index + 1)}
                >
                  {index + 1}
                </button>
              )).slice(Math.max(0, paginaCorrente - 3), Math.min(totalePagine, paginaCorrente + 2))}
              <button 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                disabled={paginaCorrente === totalePagine}
                onClick={() => setPaginaCorrente(prev => Math.min(prev + 1, totalePagine))}
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Dettagli cliente */}
        {clienteSelezionato && (
          <div className="w-1/3 bg-white rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Dettagli Cliente</h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={handleCloseDettagli}
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-teal-600">
                  {clienteSelezionato.nome.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{clienteSelezionato.nome}</h3>
              <div className="mt-1 flex justify-center">
                <span className={`text-xs px-3 py-1 rounded-full ${getBadgeColor(clienteSelezionato.badge)}`}>
                  {clienteSelezionato.badge.charAt(0).toUpperCase() + clienteSelezionato.badge.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex">
                <div className="w-10 flex justify-center">
                  <Phone className="text-gray-500" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefono</p>
                  <p className="text-gray-800">{clienteSelezionato.telefono}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-10 flex justify-center">
                  <Mail className="text-gray-500" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">{clienteSelezionato.email || 'Non disponibile'}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-10 flex justify-center">
                  <Home className="text-gray-500" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Indirizzo</p>
                  <p className="text-gray-800">{clienteSelezionato.indirizzo || 'Non disponibile'}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-10 flex justify-center">
                  <Star className="text-amber-500" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Punti Fedeltà</p>
                  <p className="text-gray-800">{clienteSelezionato.punti || 0} punti</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-10 flex justify-center">
                  <Clock className="text-gray-500" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ultimo Ordine</p>
                  <p className="text-gray-800">{formatDate(clienteSelezionato.ultimoOrdine)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Data registrazione</span>
                <span className="font-medium">{formatDate(clienteSelezionato.dataRegistrazione)}</span>
              </div>
              {clienteSelezionato.ordiniTotali !== undefined && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Ordini totali</span>
                  <span className="font-bold">{clienteSelezionato.ordiniTotali}</span>
                </div>
              )}
              {clienteSelezionato.spesaTotale !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Spesa totale</span>
                  <span className="font-bold">€ {clienteSelezionato.spesaTotale}</span>
                </div>
              )}
            </div>
            
            {clienteSelezionato.note && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Note</p>
                <p className="text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-200 text-sm">
                  {clienteSelezionato.note}
                </p>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button className="px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 flex items-center space-x-1">
                <FileText size={16} />
                <span>Ordini</span>
              </button>
              <button 
                className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 flex items-center space-x-1"
                onClick={() => handleOpenEditModal(clienteSelezionato)}
              >
                <Edit size={16} />
                <span>Modifica</span>
              </button>
              <button 
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center space-x-1"
                onClick={() => handleCancellazione(clienteSelezionato._id)}
              >
                <Trash2 size={16} />
                <span>Elimina</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal per aggiungere/modificare cliente */}
      {modalAperta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalModifica ? 'Modifica Cliente' : 'Nuovo Cliente'}
              </h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => setModalAperta(false)}
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome Completo*</label>
                <input
                  type="text"
                  name="nome"
                  value={nuovoCliente.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Es. Mario Rossi"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefono*</label>
                <input
                  type="text"
                  name="telefono"
                  value={nuovoCliente.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Es. 333-1234567"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={nuovoCliente.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Es. mario.rossi@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Indirizzo</label>
                <input
type="text"
                  name="indirizzo"
                  value={nuovoCliente.indirizzo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Es. Via Roma 123"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Badge</label>
                <select
                  name="badge"
                  value={nuovoCliente.badge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="bronzo">Bronzo</option>
                  <option value="argento">Argento</option>
                  <option value="oro">Oro</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Punti fedeltà</label>
                <input
                  type="number"
                  name="punti"
                  value={nuovoCliente.punti}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Note</label>
                <textarea
                  name="note"
                  value={nuovoCliente.note}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-20 resize-none"
                  placeholder="Note aggiuntive..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                onClick={() => setModalAperta(false)}
              >
                Annulla
              </button>
              <button 
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                onClick={handleAggiungiCliente}
                disabled={!nuovoCliente.nome || !nuovoCliente.telefono}
              >
                {caricamento ? (
                  <RefreshCw className="animate-spin mx-auto" size={20} />
                ) : (
                  modalModifica ? 'Aggiorna Cliente' : 'Salva Cliente'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientiPage;