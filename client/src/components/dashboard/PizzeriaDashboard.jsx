import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Pizza, Clock, ShoppingCart, Award, Home, PhoneCall, User, Monitor, CheckCircle, BarChart2, PieChart, Package, Wallet, Settings, FileText, Eye, EyeOff, CreditCard, Tag, ArrowRight, Users, ChefHat, DollarSign } from 'lucide-react';
import OrdiniWidget from './OrdiniWidget'; // Importa il widget degli ordini per la dashboard

const PizzeriaDashboard = () => {
  const navigate = useNavigate();
  
  // Stati per la gestione dei dati
  const [metriche, setMetriche] = useState({
    ordiniOggi: 42,
    ordiniAsporto: 18,
    ordiniConsegna: 14,
    ordiniRitiro: 6,
    ordiniOnline: 4,
    ordiniInPreparazione: 5,
    ordiniInArrivo: 3,
    ordiniCompletati: 34,
    incassoContanti: 620,
    incassoCarte: 480,
    incassoDigitale: 90,
    incassoBuoniPasto: 60,
    incassoTotale: 1250,
    clientiConsegne: 14,
    clientiFidelizzati: 156,
    clientiRaccoltaPunti: 260,
    badgeVip: 28,
    badgeOro: 56,
    badgeArgento: 74,
    badgeBronzo: 102,
    campagnaWhatsapp: 38,
    campagnaSocial: 12,
    campagnaWebApp: 16,
    prodottiNascosti: 8,
    prodottiPromozione: 5,
    piuVenduta: "Diavola",
    puntiTotali: 3450,
    promoAttiva: "2x1 il Martedì"
  });
  
  // Dati per i widget avanzati
  const [dashboardData, setDashboardData] = useState({
    statistiche: {
      clientiTotali: 0,
      prodottiAttivi: 0,
      ordiniOggi: 0,
      incassoOggi: 0
    },
    clientiRecenti: [],
    prodottiPopolari: [],
    ordiniAttivi: []
  });
  
  // Stato per l'ultimo aggiornamento
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState(new Date());
    // Stato per indicare se l'aggiornamento è in corso
  const [aggiornamentoInCorso, setAggiornamentoInCorso] = useState(false);
  
  // Stato per toggle visibilità voci cassa
  const [visibilitaCassa, setVisibilitaCassa] = useState({
    contanti: true,
    carta: true,
    digitale: true,
    buoniPasto: true,
    totale: true
  });
  
  // Funzione per ottenere i dati aggiornati dal server
  const fetchDatiAggiornati = useCallback(async () => {
    setAggiornamentoInCorso(true);

    try {
      const response = await fetch('http://localhost:5000/api/dashboard');
      const data = await response.json();

      // Aggiornamento delle metriche con i dati dal backend
      setMetriche(data);

      // Aggiornamento dei dati strutturati per i nuovi widget
      if (data.statistiche) {
        setDashboardData({
          statistiche: data.statistiche,
          clientiRecenti: data.clientiRecenti || [],
          prodottiPopolari: data.prodottiPopolari || [],
          ordiniAttivi: data.ordiniAttivi || []
        });
      }

      // Aggiornamento del timestamp
      setUltimoAggiornamento(new Date());
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dei dati:', error);
    } finally {
      setAggiornamentoInCorso(false);
    }
  }, []);

  // Effetto per aggiornamento automatico periodico
  useEffect(() => {
    fetchDatiAggiornati();
    const intervalId = setInterval(fetchDatiAggiornati, 30000);
    return () => clearInterval(intervalId);
  }, [fetchDatiAggiornati]);

  // Toggle visibilità voci cassa
  const toggleVisibilitaCassa = (voce) => {
    setVisibilitaCassa({
      ...visibilitaCassa,
      [voce]: !visibilitaCassa[voce]
    });
  };
  // Funzione per la navigazione verso altre pagine
  const navigaVerso = (pagina) => {
    console.log(`Navigazione verso: ${pagina}`);

    switch (pagina.toLowerCase()) {
      case 'clienti':
        navigate('/clienti');
        break;
      case 'gestione menù':
        navigate('/menu');
        break;
      case 'programma fedeltà':
        navigate('/fedelta');
        break;
      case 'gestione ordini':
        navigate('/ordini');
        break;  
      default:
        alert(`Hai cliccato sul widget: ${pagina}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 min-h-screen p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Pizza className="text-red-500" size={36} />
          <h1 className="text-2xl font-bold text-red-700">FORNETTERIA</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className={`bg-white rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-gray-100 transition-colors ${aggiornamentoInCorso ? 'opacity-50' : ''}`}
            onClick={fetchDatiAggiornati}
            disabled={aggiornamentoInCorso}
          >
            <RefreshCw className={`text-green-500 ${aggiornamentoInCorso ? 'animate-spin' : ''}`} size={18} />
            <span className="text-gray-700 text-sm">Aggiorna dati</span>
          </button>
          <div className="bg-white rounded-lg px-4 py-2 shadow-md flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <Clock className="text-orange-500" size={18} />
              <span className="text-gray-700 font-medium">
                {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className="text-gray-500 text-xs">
              Ultimo agg: {ultimoAggiornamento.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 {/* Widget Gestione Ordini */}
<div 
  className="bg-red-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer md:col-span-2"
  onClick={() => navigaVerso('Gestione Ordini')}
>
  <div className="flex justify-between items-center mb-3">
    <div className="flex items-center">
      <ShoppingCart className="text-red-500" />
      <h3 className="text-gray-700 font-medium ml-2">Ordini</h3>
    </div>
    <ArrowRight size={16} className="text-gray-400" />
  </div>
  
  {/* Contenuto del widget */}
  <div className="mt-4 grid grid-cols-5 gap-2">
    <div className="text-center">
      <div className="flex justify-center mb-1">
        <Home className="text-orange-500" size={20} />
      </div>
      <p className="text-xl font-bold text-gray-800">{metriche.ordiniAsporto}</p>
      <p className="text-gray-500 text-xs">Asporto</p>
    </div>
    <div className="text-center">
      <div className="flex justify-center mb-1">
        <PhoneCall className="text-blue-500" size={20} />
      </div>
      <p className="text-xl font-bold text-gray-800">{metriche.ordiniConsegna}</p>
      <p className="text-gray-500 text-xs">Consegne</p>
    </div>
    <div className="text-center">
      <div className="flex justify-center mb-1">
        <User className="text-green-500" size={20} />
      </div>
      <p className="text-xl font-bold text-gray-800">{metriche.ordiniRitiro}</p>
      <p className="text-gray-500 text-xs">Ritiri</p>
    </div>
    <div className="text-center">
      <div className="flex justify-center mb-1">
        <Monitor className="text-teal-500" size={20} />
      </div>
      <p className="text-xl font-bold text-gray-800">{metriche.ordiniOnline}</p>
      <p className="text-gray-500 text-xs">Online</p>
    </div>
    <div className="text-center bg-red-200 rounded-lg p-1">
      <div className="flex justify-center mb-1">
        <CheckCircle className="text-red-600" size={20} />
      </div>
      <p className="text-xl font-bold text-red-700">{metriche.ordiniOggi}</p>
      <p className="text-red-600 text-xs">Totale</p>
    </div>
  </div>
</div>    
	 
	 
        {/* Widget Programma Fedeltà */}
        <div 
          className="bg-orange-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer md:col-span-2"
          onClick={() => navigaVerso('Programma Fedeltà')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Award className="text-orange-500" />
              <h3 className="text-gray-700 font-medium ml-2">Programma Fedeltà</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Punti Totali</span>
                <span className="text-orange-600 font-bold text-xl">{metriche.puntiTotali}</span>
              </div>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <span className="text-gray-600 font-medium">Badge Clienti</span>
              <div className="grid grid-cols-4 gap-1 mt-1">
                <div className="bg-amber-200 rounded p-1 text-center">
                  <span className="text-xs font-bold text-amber-700">{metriche.badgeVip}</span>
                  <p className="text-amber-800 text-xs">VIP</p>
                </div>
                <div className="bg-yellow-100 rounded p-1 text-center">
                  <span className="text-xs font-bold text-yellow-700">{metriche.badgeOro}</span>
                  <p className="text-yellow-800 text-xs">Oro</p>
                </div>
                <div className="bg-gray-200 rounded p-1 text-center">
                  <span className="text-xs font-bold text-gray-700">{metriche.badgeArgento}</span>
                  <p className="text-gray-800 text-xs">Arg</p>
                </div>
                <div className="bg-amber-100 rounded p-1 text-center">
                  <span className="text-xs font-bold text-amber-700">{metriche.badgeBronzo}</span>
                  <p className="text-amber-800 text-xs">Bro</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 mb-1">Campagne attive:</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 bg-green-100 rounded-lg">
              <PhoneCall className="text-green-600 mb-1" size={16} />
              <span className="text-green-700 text-xs font-medium">WhatsApp</span>
              <span className="text-green-800 text-xs">{metriche.campagnaWhatsapp} msg</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600 mb-1" size={16} />
              <span className="text-blue-700 text-xs font-medium">Social</span>
              <span className="text-blue-800 text-xs">{metriche.campagnaSocial} post</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-amber-100 rounded-lg">
              <Monitor className="text-amber-600 mb-1" size={16} />
              <span className="text-amber-700 text-xs font-medium">WebApp</span>
              <span className="text-amber-800 text-xs">{metriche.campagnaWebApp} notifiche</span>
            </div>
          </div>
        </div>
        
        {/* Widget Cucina */}
        <div 
          className="bg-yellow-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer md:col-span-2"
          onClick={() => navigaVerso('Cucina')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <ChefHat className="text-yellow-500" />
              <h3 className="text-gray-700 font-medium ml-2">Cucina</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-2">
            <div className="text-center bg-orange-100 rounded-lg p-2">
              <p className="text-xl font-bold text-orange-600">{metriche.ordiniOggi}</p>
              <p className="text-gray-600 text-xs">Totale giornata</p>
            </div>
            <div className="text-center bg-red-100 rounded-lg p-2">
              <p className="text-xl font-bold text-red-600">{metriche.ordiniInPreparazione}</p>
              <p className="text-gray-600 text-xs">In preparazione</p>
            </div>
            <div className="text-center bg-blue-100 rounded-lg p-2">
              <p className="text-xl font-bold text-blue-600">{metriche.ordiniInArrivo}</p>
              <p className="text-gray-600 text-xs">In arrivo</p>
            </div>
            <div className="text-center bg-green-100 rounded-lg p-2">
              <p className="text-xl font-bold text-green-600">{metriche.ordiniCompletati}</p>
              <p className="text-gray-600 text-xs">Completati</p>
            </div>
          </div>
        </div>
        {/* Widget Clienti */}
        <div 
          className="bg-teal-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer"
          onClick={() => navigaVerso('Clienti')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Users className="text-teal-500" />
              <h3 className="text-gray-700 font-medium ml-2">Clienti</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="text-center bg-teal-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-teal-600">{metriche.clientiFidelizzati}</p>
              <p className="text-gray-600">Clienti totali</p>
            </div>
            <div className="text-center bg-teal-200 p-2 rounded-lg">
              <div className="flex items-center justify-center">
                <PhoneCall className="text-teal-700 mr-2" size={16} />
                <p className="text-xl font-bold text-teal-700">{metriche.clientiConsegne}</p>
              </div>
              <p className="text-teal-800">Consegne oggi</p>
            </div>
          </div>
        </div>
        {/* Widget Menù */}
        <div 
          className="bg-rose-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer"
          onClick={() => navigaVerso('Gestione Menù')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <FileText className="text-rose-500" />
              <h3 className="text-gray-700 font-medium ml-2">Menù</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-center bg-gray-100 p-2 rounded-lg">
              <div className="flex items-center justify-center">
                <EyeOff className="text-gray-500 mr-1" size={16} />
                <p className="text-lg font-bold text-gray-700">{metriche.prodottiNascosti || 0}</p>
              </div>
              <p className="text-gray-600 text-xs">Nascosti</p>
            </div>
            <div className="text-center bg-rose-200 p-2 rounded-lg">
              <div className="flex items-center justify-center">
                <Tag className="text-rose-600 mr-1" size={16} />
                <p className="text-lg font-bold text-rose-700">{metriche.prodottiPromozione || 0}</p>
              </div>
              <p className="text-rose-600 text-xs">In promozione</p>
            </div>
          </div>
          <button 
            className="w-full mt-3 bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigaVerso('Impostazioni Web App');
            }}
          >
            <Monitor className="text-blue-600 mr-2" size={16} />
            <span className="font-medium text-sm">Impostazioni Web App Cliente</span>
          </button>
        </div>
        
        {/* Widget Cassa */}
        <div 
          className="bg-green-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer md:col-span-2"
          onClick={() => navigaVerso('Cassa')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Wallet className="text-green-500" />
              <h3 className="text-gray-700 font-medium ml-2">Cassa</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="space-y-2 mt-2">
            {visibilitaCassa.contanti && (
              <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="text-green-600 mr-1" size={16} />
                  <p className="text-gray-700">Contanti</p>
                </div>
                <div className="flex items-center">
                  <p className="font-bold text-green-700">€ {metriche.incassoContanti}</p>
                  <button 
                    className="ml-2 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibilitaCassa('contanti');
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {visibilitaCassa.carta && (
              <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="text-blue-600 mr-1" size={16} />
                  <p className="text-gray-700">Carte</p>
                </div>
                <div className="flex items-center">
                  <p className="font-bold text-blue-700">€ {metriche.incassoCarte}</p>
                  <button 
                    className="ml-2 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibilitaCassa('carta');
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            )}
            {visibilitaCassa.digitale && (
              <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                <div className="flex items-center">
                  <Monitor className="text-cyan-600 mr-1" size={16} />
                  <p className="text-gray-700">Pagamenti digitali</p>
                </div>
                <div className="flex items-center">
                  <p className="font-bold text-cyan-700">€ {metriche.incassoDigitale}</p>
                  <button 
                    className="ml-2 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibilitaCassa('digitale');
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {visibilitaCassa.buoniPasto && (
              <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                <div className="flex items-center">
                  <FileText className="text-amber-600 mr-1" size={16} />
                  <p className="text-gray-700">Buoni pasto</p>
                </div>
                <div className="flex items-center">
                  <p className="font-bold text-amber-700">€ {metriche.incassoBuoniPasto}</p>
                  <button 
                    className="ml-2 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibilitaCassa('buoniPasto');
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {visibilitaCassa.totale && (
              <div className="flex justify-between items-center bg-green-200 p-2 rounded-lg">
                <div className="flex items-center">
                  <Wallet className="text-green-700 mr-1" size={16} />
                  <p className="text-green-800 font-medium">Totale incasso</p>
                </div>
                <div className="flex items-center">
                  <p className="font-bold text-green-800">€ {metriche.incassoTotale}</p>
                  <button 
                    className="ml-2 text-gray-600 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibilitaCassa('totale');
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Widget Statistiche */}
        <div 
          className="bg-amber-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer"
          onClick={() => navigaVerso('Statistiche')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <BarChart2 className="text-amber-500" />
              <h3 className="text-gray-700 font-medium ml-2">Statistiche</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="h-32 flex flex-col items-center justify-center">
            <PieChart className="text-amber-500 mb-2" size={40} />
            <p className="text-gray-500">Vendite settimanali</p>
            <div className="flex mt-2 space-x-3">
              <div className="text-center text-xs">
                <p className="text-amber-700 font-bold">{metriche.piuVenduta}</p>
                <p className="text-gray-500">Più venduta</p>
              </div>
              <div className="text-center text-xs">
                <p className="text-amber-700 font-bold">Margherita</p>
                <p className="text-gray-500">Seconda</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Widget Magazzino */}
        <div 
          className="bg-cyan-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer"
          onClick={() => navigaVerso('Magazzino')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Package className="text-cyan-500" />
              <h3 className="text-gray-700 font-medium ml-2">Magazzino</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <p className="text-red-500 font-bold">3 prodotti</p>
              <p className="text-gray-600">in esaurimento</p>
            </div>
          </div>
        </div>  
        
        {/* Widget Impostazioni */}
        <div 
          className="bg-gray-100 rounded-xl p-4 shadow-md transition-all hover:shadow-lg hover:translate-y-1 cursor-pointer"
          onClick={() => navigaVerso('Impostazioni')}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Settings className="text-gray-500" />
              <h3 className="text-gray-700 font-medium ml-2">Impostazioni</h3>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <p className="text-gray-600">Configurazione Sistema</p>
              <p className="text-gray-400 text-sm">Utenti, Backup, Parametri</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzeriaDashboard;