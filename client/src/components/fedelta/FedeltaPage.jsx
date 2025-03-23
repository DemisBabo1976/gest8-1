import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, Star, Settings, Edit, Trash2, Plus, ArrowLeft, RefreshCw,
  Users, Tag, Gift, Calendar, ChevronRight, ChevronLeft, Clock, AlertCircle,
  Check, DollarSign, Save, X, PhoneCall, Monitor, MessageSquare, Mail
} from 'lucide-react';
import { 
  getProgrammaFedelta, 
  updateProgrammaFedelta,
  addCampagna,
  updateCampagna,
  deleteCampagna,
  updateRegoleBadge
} from '../../services/fedeltaService';

/**
 * Componente principale per la gestione del programma fedeltà
 */
const FedeltaPage = () => {
  // Stati per i dati
  const [programma, setProgramma] = useState(null);
  const [stats, setStats] = useState({
    clientiTotali: 0,
    clientiConPunti: 0,
    badgeVip: 0,
    badgeOro: 0,
    badgeArgento: 0,
    badgeBronzo: 0
  });
  const [caricamento, setCaricamento] = useState(false);
  const [tabAttiva, setTabAttiva] = useState('generale');
  const [modalAperta, setModalAperta] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [campagnaSelezionata, setCampagnaSelezionata] = useState(null);
  
  // Stato per le form di modifica
  const [formProgramma, setFormProgramma] = useState({
    nome: '',
    descrizione: '',
    attivo: true,
    regolePunti: {
      euroPerPunto: 10,
      puntiExtra: true,
      puntiCompleanno: 20,
      puntiRegistrazione: 10
    },
    promozioneAttuale: {
      nome: '',
      descrizione: '',
      attiva: false,
      dataInizio: '',
      dataFine: ''
    }
  });
  
  // Stato per form nuova campagna
  const [formCampagna, setFormCampagna] = useState({
    nome: '',
    tipo: 'whatsapp',
    descrizione: '',
    dataInizio: '',
    dataFine: '',
    attiva: true,
    contattiRaggiunti: 0,
    obiettivo: 100,
    messaggioPromo: ''
  });
  
  // Stato per modifica regole badge
  const [regoleBadge, setRegoleBadge] = useState([]);
  
  const navigate = useNavigate();
  
  // Caricamento dati iniziali
  useEffect(() => {
    fetchProgrammaFedelta();
  }, []);
  
  /**
   * Recupera i dati del programma fedeltà dal backend
   */
  const fetchProgrammaFedelta = async () => {
    try {
      setCaricamento(true);
      const response = await getProgrammaFedelta();
      
      if (response.success) {
        setProgramma(response.data);
        setStats(response.stats);
        
        // Imposta i valori nei form
        setFormProgramma({
          nome: response.data.nome,
          descrizione: response.data.descrizione,
          attivo: response.data.attivo,
          regolePunti: {
            euroPerPunto: response.data.regolePunti.euroPerPunto,
            puntiExtra: response.data.regolePunti.puntiExtra,
            puntiCompleanno: response.data.regolePunti.puntiCompleanno,
            puntiRegistrazione: response.data.regolePunti.puntiRegistrazione
          },
          promozioneAttuale: {
            nome: response.data.promozioneAttuale?.nome || '',
            descrizione: response.data.promozioneAttuale?.descrizione || '',
            attiva: response.data.promozioneAttuale?.attiva || false,
            dataInizio: response.data.promozioneAttuale?.dataInizio 
              ? new Date(response.data.promozioneAttuale.dataInizio).toISOString().split('T')[0] 
              : '',
            dataFine: response.data.promozioneAttuale?.dataFine 
              ? new Date(response.data.promozioneAttuale.dataFine).toISOString().split('T')[0] 
              : ''
          }
        });
        
        setRegoleBadge(response.data.regoleBadge || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento del programma fedeltà:', error);
    } finally {
      setCaricamento(false);
    }
  };
  
  /**
   * Gestisce il cambio dei valori nei form generali
   */
  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    
    if (section === 'regolePunti') {
      setFormProgramma(prev => ({
        ...prev,
        regolePunti: {
          ...prev.regolePunti,
          [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        }
      }));
    } else if (section === 'promozione') {
      setFormProgramma(prev => ({
        ...prev,
        promozioneAttuale: {
          ...prev.promozioneAttuale,
          [name]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormProgramma(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  /**
   * Gestisce il cambio dei valori nel form delle campagne
   */
  const handleCampagnaChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormCampagna(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };
  
  /**
   * Gestisce il cambio dei valori nelle regole badge
   */
  const handleBadgeChange = (index, field, value) => {
    const updatedRegole = [...regoleBadge];
    updatedRegole[index][field] = field === 'puntiNecessari' || field === 'scontoAssociato' 
      ? parseFloat(value) || 0 
      : value;
    
    setRegoleBadge(updatedRegole);
  };
  
  /**
   * Salva le modifiche generali al programma fedeltà
   */
  const handleSalvaProgramma = async () => {
    try {
      setCaricamento(true);
      
      // Prepara i dati da inviare
      const dataToUpdate = {
        nome: formProgramma.nome,
        descrizione: formProgramma.descrizione,
        attivo: formProgramma.attivo,
        regolePunti: formProgramma.regolePunti,
        promozioneAttuale: {
          ...formProgramma.promozioneAttuale,
          dataInizio: formProgramma.promozioneAttuale.dataInizio 
            ? new Date(formProgramma.promozioneAttuale.dataInizio) 
            : null,
          dataFine: formProgramma.promozioneAttuale.dataFine 
            ? new Date(formProgramma.promozioneAttuale.dataFine) 
            : null
        }
      };
      
      const response = await updateProgrammaFedelta(dataToUpdate);
      
      if (response.success) {
        setProgramma(response.data);
        alert('Programma fedeltà aggiornato con successo!');
      }
    } catch (error) {
      console.error('Errore durante il salvataggio del programma:', error);
      alert('Si è verificato un errore durante il salvataggio. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };
  
  /**
   * Salva le nuove regole dei badge
   */
  const handleSalvaRegoleBadge = async () => {
    try {
      setCaricamento(true);
      
      const response = await updateRegoleBadge(regoleBadge);
      
      if (response.success) {
        setProgramma(response.data);
        alert('Regole badge aggiornate con successo!');
      }
    } catch (error) {
      console.error('Errore durante il salvataggio delle regole badge:', error);
      alert('Si è verificato un errore durante il salvataggio. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };
  
  /**
   * Apre il modal per aggiungere una nuova campagna
   */
  const handleOpenAddCampagna = () => {
    setFormCampagna({
      nome: '',
      tipo: 'whatsapp',
      descrizione: '',
      dataInizio: new Date().toISOString().split('T')[0],
      dataFine: '',
      attiva: true,
      contattiRaggiunti: 0,
      obiettivo: 100,
      messaggioPromo: ''
    });
    
    setModalTipo('campagna');
    setCampagnaSelezionata(null);
    setModalAperta(true);
  };
  
  /**
   * Apre il modal per modificare una campagna esistente
   */
  const handleOpenEditCampagna = (campagna) => {
    setFormCampagna({
      nome: campagna.nome,
      tipo: campagna.tipo,
      descrizione: campagna.descrizione,
      dataInizio: campagna.dataInizio 
        ? new Date(campagna.dataInizio).toISOString().split('T')[0] 
        : '',
      dataFine: campagna.dataFine 
        ? new Date(campagna.dataFine).toISOString().split('T')[0] 
        : '',
      attiva: campagna.attiva,
      contattiRaggiunti: campagna.contattiRaggiunti,
      obiettivo: campagna.obiettivo,
      messaggioPromo: campagna.messaggioPromo || ''
    });
    
    setModalTipo('campagna');
    setCampagnaSelezionata(campagna);
    setModalAperta(true);
  };
  
  /**
   * Salva una nuova campagna o aggiorna una esistente
   */
  const handleSalvaCampagna = async () => {
    try {
      setCaricamento(true);
      
      // Prepara i dati
      const campaignData = {
        ...formCampagna,
        dataInizio: formCampagna.dataInizio ? new Date(formCampagna.dataInizio) : null,
        dataFine: formCampagna.dataFine ? new Date(formCampagna.dataFine) : null
      };
      
      let response;
      
      if (campagnaSelezionata) {
        // Aggiorna campagna esistente
        response = await updateCampagna(campagnaSelezionata._id, campaignData);
      } else {
        // Crea nuova campagna
        response = await addCampagna(campaignData);
      }
      
      if (response.success) {
        setProgramma(response.data);
        setModalAperta(false);
        alert(campagnaSelezionata 
          ? 'Campagna aggiornata con successo!' 
          : 'Nuova campagna creata con successo!');
      }
    } catch (error) {
      console.error('Errore durante il salvataggio della campagna:', error);
      alert('Si è verificato un errore durante il salvataggio. Riprova più tardi.');
    } finally {
      setCaricamento(false);
    }
  };
  
  /**
   * Elimina una campagna
   */
  const handleDeleteCampagna = async (campagnaId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa campagna?')) {
      try {
        setCaricamento(true);
        const response = await deleteCampagna(campagnaId);
        
        if (response.success) {
          setProgramma(response.data);
          alert('Campagna eliminata con successo!');
        }
      } catch (error) {
        console.error('Errore durante l\'eliminazione della campagna:', error);
        alert('Si è verificato un errore durante l\'eliminazione. Riprova più tardi.');
      } finally {
        setCaricamento(false);
      }
    }
  };
  
/**
   * Funzione per ottenere il colore in base al tipo di campagna
   */
  const getTipoCampagnaColor = (tipo) => {
    switch (tipo) {
      case 'whatsapp': return 'bg-green-100 text-green-700';
      case 'social': return 'bg-blue-100 text-blue-700';
      case 'webapp': return 'bg-amber-100 text-amber-700';
      case 'email': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  /**
   * Funzione per ottenere l'icona in base al tipo di campagna
   */
  const getTipoCampagnaIcon = (tipo) => {
    switch (tipo) {
      case 'whatsapp': return <PhoneCall size={16} />;
      case 'social': return <Users size={16} />;
      case 'webapp': return <Monitor size={16} />;
      case 'email': return <Mail size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  /**
   * Funzione per formattare la data
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  /**
   * Funzione per ottenere lo stile del badge
   */
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'bronzo': return 'bg-amber-100 text-amber-800';
      case 'argento': return 'bg-gray-200 text-gray-800';
      case 'oro': return 'bg-yellow-100 text-yellow-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcola la percentuale di completamento per la campagna
  const getPercentualeCompletamento = (campagna) => {
    if (!campagna.obiettivo || campagna.obiettivo === 0) return 100;
    return Math.min(Math.round((campagna.contattiRaggiunti / campagna.obiettivo) * 100), 100);
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
            <Award className="text-orange-500 mr-2" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Programma Fedeltà</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="bg-white rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            onClick={fetchProgrammaFedelta}
          >
            <RefreshCw className={`text-orange-600 ${caricamento ? 'animate-spin' : ''}`} size={18} />
            <span className="text-gray-700 text-sm">Aggiorna</span>
          </button>
        </div>
      </header>

      {caricamento && !programma ? (
        <div className="bg-white rounded-xl shadow-lg p-8 flex justify-center items-center">
          <RefreshCw size={24} className="animate-spin text-orange-500 mr-2" />
          <span className="text-gray-500">Caricamento dati programma fedeltà...</span>
        </div>
      ) : !programma ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-2">Nessun programma fedeltà trovato.</p>
          <button 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            onClick={fetchProgrammaFedelta}
          >
            Riprova
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Schede Informative */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scheda Punti */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Punti Totali</h2>
                <Star className="text-amber-500" size={20} />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {programma.puntiTotali?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">
                {stats.clientiConPunti} clienti con punti su {stats.clientiTotali} totali
              </div>
            </div>
            
            {/* Scheda Badge */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Badge Clienti</h2>
                <Award className="text-orange-500" size={20} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-amber-100 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-amber-800">{stats.badgeVip}</div>
                  <div className="text-xs text-amber-700">VIP</div>
                </div>
                <div className="bg-yellow-100 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-yellow-700">{stats.badgeOro}</div>
                  <div className="text-xs text-yellow-700">Oro</div>
                </div>
                <div className="bg-gray-200 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-gray-800">{stats.badgeArgento}</div>
                  <div className="text-xs text-gray-700">Argento</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-amber-700">{stats.badgeBronzo}</div>
                  <div className="text-xs text-amber-700">Bronzo</div>
                </div>
              </div>
            </div>
            
            {/* Scheda Promozione Attuale */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Promozione Attuale</h2>
                <Gift className="text-orange-500" size={20} />
              </div>
              {programma.promozioneAttuale?.attiva ? (
                <>
                  <div className="text-lg font-medium text-gray-800 mb-1">
                    {programma.promozioneAttuale.nome}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {programma.promozioneAttuale.descrizione}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      <Calendar size={12} className="inline mr-1" />
                      {formatDate(programma.promozioneAttuale.dataInizio)} - {formatDate(programma.promozioneAttuale.dataFine)}
                    </span>
                    <span className="text-green-600 font-medium flex items-center">
                      <Check size={12} className="mr-1" /> Attiva
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 py-2 text-center">
                  Nessuna promozione attiva
                </div>
              )}
            </div>
          </div>
          
          {/* Tab di Navigazione */}
          <div className="bg-white rounded-xl shadow-md p-1">
            <div className="flex divide-x divide-gray-200">
              <button 
                className={`flex-1 py-2 px-4 ${tabAttiva === 'generale' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'} rounded-lg transition-colors`}
                onClick={() => setTabAttiva('generale')}
              >
                Impostazioni Generali
              </button>
              <button 
                className={`flex-1 py-2 px-4 ${tabAttiva === 'campagne' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'} rounded-lg transition-colors`}
                onClick={() => setTabAttiva('campagne')}
              >
                Campagne Promozionali
              </button>
              <button 
                className={`flex-1 py-2 px-4 ${tabAttiva === 'regole' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'} rounded-lg transition-colors`}
                onClick={() => setTabAttiva('regole')}
              >
                Regole Badge
              </button>
            </div>
          </div>
		  
{/* Contenuto Tab */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Tab Impostazioni Generali */}
            {tabAttiva === 'generale' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Impostazioni Generali del Programma
                </h2>
                
                {/* Impostazioni base */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nome Programma</label>
                    <input
                      type="text"
                      name="nome"
                      value={formProgramma.nome}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Descrizione</label>
                    <textarea
                      name="descrizione"
                      value={formProgramma.descrizione}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="attivo"
                      name="attivo"
                      type="checkbox"
                      checked={formProgramma.attivo}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="attivo" className="ml-2 text-gray-700">
                      Programma fedeltà attivo
                    </label>
                  </div>
                </div>
                
                {/* Regole punti */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Regole Assegnazione Punti
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Euro per punto</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-700">
                          <DollarSign size={16} className="text-orange-500" />
                        </span>
                        <input
                          type="number"
                          name="euroPerPunto"
                          min="0.1"
                          step="0.1"
                          value={formProgramma.regolePunti.euroPerPunto}
                          onChange={(e) => handleInputChange(e, 'regolePunti')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        1 punto ogni {formProgramma.regolePunti.euroPerPunto} € di spesa
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Punti per registrazione</label>
                      <input
                        type="number"
                        name="puntiRegistrazione"
                        min="0"
                        value={formProgramma.regolePunti.puntiRegistrazione}
                        onChange={(e) => handleInputChange(e, 'regolePunti')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Punti compleanno</label>
                      <input
                        type="number"
                        name="puntiCompleanno"
                        min="0"
                        value={formProgramma.regolePunti.puntiCompleanno}
                        onChange={(e) => handleInputChange(e, 'regolePunti')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="puntiExtra"
                        name="puntiExtra"
                        type="checkbox"
                        checked={formProgramma.regolePunti.puntiExtra}
                        onChange={(e) => handleInputChange(e, 'regolePunti')}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="puntiExtra" className="ml-2 text-gray-700">
                        Abilita punti extra per promozioni
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Promozione attuale */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Promozione Attuale
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nome promozione</label>
                      <input
                        type="text"
                        name="nome"
                        value={formProgramma.promozioneAttuale.nome}
                        onChange={(e) => handleInputChange(e, 'promozione')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Descrizione</label>
                      <textarea
                        name="descrizione"
                        value={formProgramma.promozioneAttuale.descrizione}
                        onChange={(e) => handleInputChange(e, 'promozione')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Data inizio</label>
                        <input
                          type="date"
                          name="dataInizio"
                          value={formProgramma.promozioneAttuale.dataInizio}
                          onChange={(e) => handleInputChange(e, 'promozione')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Data fine</label>
                        <input
                          type="date"
                          name="dataFine"
                          value={formProgramma.promozioneAttuale.dataFine}
                          onChange={(e) => handleInputChange(e, 'promozione')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="promoAttiva"
                        name="attiva"
                        type="checkbox"
                        checked={formProgramma.promozioneAttuale.attiva}
                        onChange={(e) => handleInputChange(e, 'promozione')}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="promoAttiva" className="ml-2 text-gray-700">
                        Promozione attiva
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Bottone salva */}
                <div className="flex justify-end mt-6">
                  <button 
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                    onClick={handleSalvaProgramma}
                    disabled={caricamento}
                  >
                    {caricamento ? (
                      <RefreshCw className="animate-spin mr-2" size={18} />
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}
                    Salva Modifiche
                  </button>
                </div>
              </div>
            )}
            
            {/* Tab Campagne */}
            {tabAttiva === 'campagne' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Campagne Promozionali
                  </h2>
                  <button 
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                    onClick={handleOpenAddCampagna}
                  >
                    <Plus size={16} className="mr-1" />
                    Nuova Campagna
                  </button>
                </div>
                
                {programma.campagneAttive && programma.campagneAttive.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programma.campagneAttive.map(campagna => (
                      <div 
                        key={campagna._id} 
                        className={`border rounded-lg p-4 ${campagna.attiva ? 'border-green-200' : 'border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-800">{campagna.nome}</h3>
                              {campagna.attiva && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                  Attiva
                                </span>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center w-fit mt-1 ${getTipoCampagnaColor(campagna.tipo)}`}>
                              {getTipoCampagnaIcon(campagna.tipo)}
                              <span className="ml-1">{campagna.tipo.charAt(0).toUpperCase() + campagna.tipo.slice(1)}</span>
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button 
                              className="p-1 rounded hover:bg-gray-100"
                              onClick={() => handleOpenEditCampagna(campagna)}
                            >
                              <Edit size={14} className="text-amber-600" />
                            </button>
                            <button 
                              className="p-1 rounded hover:bg-gray-100"
                              onClick={() => handleDeleteCampagna(campagna._id)}
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {campagna.descrizione}
                        </p>
                        
                        {/* Progresso */}
                        {campagna.obiettivo > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progressione</span>
                              <span>{campagna.contattiRaggiunti} / {campagna.obiettivo}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-orange-500 h-2.5 rounded-full" 
                                style={{ width: `${getPercentualeCompletamento(campagna)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(campagna.dataInizio)} - {formatDate(campagna.dataFine)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 mb-4">Nessuna campagna promozionale attiva.</p>
                    <button 
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      onClick={handleOpenAddCampagna}
                    >
                      Crea la prima campagna
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Tab Regole Badge */}
            {tabAttiva === 'regole' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Regole Badge Cliente
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Badge</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Punti Necessari</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Sconto (%)</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Descrizione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regoleBadge.map((regola, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className={`text-xs px-2 py-1 rounded-full mr-2 ${getBadgeStyle(regola.badge)}`}>
                                {regola.badge.charAt(0).toUpperCase() + regola.badge.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              value={regola.puntiNecessari}
                              onChange={(e) => handleBadgeChange(index, 'puntiNecessari', e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={regola.scontoAssociato}
                              onChange={(e) => handleBadgeChange(index, 'scontoAssociato', e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <span className="ml-1">%</span>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={regola.descrizione || ''}
                              onChange={(e) => handleBadgeChange(index, 'descrizione', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                              placeholder="Descrizione badge..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                    onClick={handleSalvaRegoleBadge}
                    disabled={caricamento}
                  >
                    {caricamento ? (
                      <RefreshCw className="animate-spin mr-2" size={18} />
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}
                    Salva Regole Badge
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

{/* Modal Campagna */}
      {modalAperta && modalTipo === 'campagna' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {campagnaSelezionata ? 'Modifica Campagna' : 'Nuova Campagna'}
              </h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => setModalAperta(false)}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome Campagna*</label>
                <input
                  type="text"
                  name="nome"
                  value={formCampagna.nome}
                  onChange={handleCampagnaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
placeholder="Es. Promo Estate 2025"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo Campagna*</label>
                <select
                  name="tipo"
                  value={formCampagna.tipo}
                  onChange={handleCampagnaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="social">Social Media</option>
                  <option value="webapp">Web App</option>
                  <option value="email">Email</option>
                  <option value="altro">Altro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrizione</label>
                <textarea
                  name="descrizione"
                  value={formCampagna.descrizione}
                  onChange={handleCampagnaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
                  placeholder="Descrizione della campagna..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Data Inizio*</label>
                  <input
                    type="date"
                    name="dataInizio"
                    value={formCampagna.dataInizio}
                    onChange={handleCampagnaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Data Fine</label>
                  <input
                    type="date"
                    name="dataFine"
                    value={formCampagna.dataFine}
                    onChange={handleCampagnaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contatti Raggiunti</label>
                  <input
                    type="number"
                    name="contattiRaggiunti"
                    min="0"
                    value={formCampagna.contattiRaggiunti}
                    onChange={handleCampagnaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Obiettivo Contatti</label>
                  <input
                    type="number"
                    name="obiettivo"
                    min="0"
                    value={formCampagna.obiettivo}
                    onChange={handleCampagnaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Messaggio Promozionale</label>
                <textarea
                  name="messaggioPromo"
                  value={formCampagna.messaggioPromo}
                  onChange={handleCampagnaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
                  placeholder="Messaggio da inviare ai clienti..."
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input
                  id="campagnaAttiva"
                  name="attiva"
                  type="checkbox"
                  checked={formCampagna.attiva}
                  onChange={handleCampagnaChange}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="campagnaAttiva" className="ml-2 text-gray-700">
                  Campagna attiva
                </label>
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
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                onClick={handleSalvaCampagna}
                disabled={!formCampagna.nome || !formCampagna.dataInizio || caricamento}
              >
                {caricamento ? (
                  <RefreshCw className="animate-spin mx-auto" size={20} />
                ) : (
                  campagnaSelezionata ? 'Aggiorna Campagna' : 'Crea Campagna'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FedeltaPage;