import React, { useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import { it } from 'date-fns/locale';
import { format, subDays, startOfMonth } from 'date-fns';
import { X, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// Registra i componenti Chart.js
Chart.register(...registerables);

const StatisticheOrdini = ({ ordini, onClose }) => {
  // Periodo di analisi
  const [periodoInizio, setPeriodoInizio] = useState(startOfMonth(new Date()));
  const [periodoFine, setPeriodoFine] = useState(new Date());
  
  // Filtro ordini per periodo
  const ordiniFiltrati = ordini.filter(ordine => {
    const dataOrdine = new Date(ordine.dataOrdine);
    return dataOrdine >= periodoInizio && dataOrdine <= periodoFine;
  });
  
  // Calcolo incassi totali
  const calcolaIncassiTotali = () => {
    return ordiniFiltrati.reduce((total, ordine) => total + ordine.totale, 0);
  };
  
  // Calcolo ordini totali
  const calcolaOrdiniTotali = () => {
    return ordiniFiltrati.length;
  };
  
  // Calcolo valore medio ordine
  const calcolaValoreMedio = () => {
    if (ordiniFiltrati.length === 0) return 0;
    return calcolaIncassiTotali() / ordiniFiltrati.length;
  };
  
  // Statistiche per tipo ordine
  const statsTipoOrdine = () => {
    const tipi = {};
    ordiniFiltrati.forEach(ordine => {
      const tipo = ordine.tipo || 'N/D';
      if (!tipi[tipo]) {
        tipi[tipo] = { count: 0, totale: 0 };
      }
      tipi[tipo].count += 1;
      tipi[tipo].totale += ordine.totale;
    });
    
    return tipi;
  };
  
  // Statistiche per stato ordine
  const statsStatoOrdine = () => {
    const stati = {};
    ordiniFiltrati.forEach(ordine => {
      const stato = ordine.stato || 'N/D';
      if (!stati[stato]) {
        stati[stato] = 0;
      }
      stati[stato] += 1;
    });
    
    return stati;
  };
  
  // Statistiche giornaliere
  const statsGiornaliere = () => {
    const giorni = {};
    
    // Inizializza tutti i giorni nel periodo
    let currentDate = new Date(periodoInizio);
    while (currentDate <= periodoFine) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      giorni[dateKey] = { count: 0, totale: 0 };
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Popola i dati
    ordiniFiltrati.forEach(ordine => {
      const dateKey = format(new Date(ordine.dataOrdine), 'yyyy-MM-dd');
      if (giorni[dateKey]) {
        giorni[dateKey].count += 1;
        giorni[dateKey].totale += ordine.totale;
      }
    });
    
    return giorni;
  };
  
  // Formattazione prezzo
  const formatPrezzo = (prezzo) => {
    return `€ ${prezzo.toFixed(2)}`.replace('.', ',');
  };
  
  // Configurazione grafici
  
  // Grafico tipo ordine
  const tipiOrdine = statsTipoOrdine();
  const dataTipi = {
    labels: Object.keys(tipiOrdine),
    datasets: [
      {
        data: Object.values(tipiOrdine).map(t => t.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Grafico stato ordine
  const statiOrdine = statsStatoOrdine();
  const dataStati = {
    labels: Object.keys(statiOrdine),
    datasets: [
      {
        data: Object.values(statiOrdine),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Grafico andamento giornaliero
  const giorniStats = statsGiornaliere();
  const dataGiorni = {
    labels: Object.keys(giorniStats).map(date => format(new Date(date), 'dd/MM')),
    datasets: [
      {
        label: 'Incassi (€)',
        data: Object.values(giorniStats).map(g => g.totale),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Numero ordini',
        data: Object.values(giorniStats).map(g => g.count),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Opzioni grafico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  
  // Opzioni grafico andamento
  const optionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  
  // Esportazione dati in CSV
  const exportCSV = () => {
    // Intestazioni
    const headers = ['Data', 'Tipo', 'Stato', 'Cliente', 'Totale'];
    
    // Dati
    const rows = ordiniFiltrati.map(ordine => [
      format(new Date(ordine.dataOrdine), 'dd/MM/yyyy HH:mm'),
      ordine.tipo || 'N/D',
      ordine.stato || 'N/D',
      ordine.cliente?.nome || 'N/D',
      ordine.totale.toFixed(2)
    ]);
    
    // Unisci tutto in CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Crea file e scarica
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiche_ordini_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Statistiche Ordini</h2>
        <div className="flex items-center space-x-3">
          <button 
            className="bg-white rounded-lg px-3 py-2 shadow-md flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            onClick={exportCSV}
          >
            <Download className="text-red-600" size={18} />
            <span className="text-gray-700 text-sm">Esporta</span>
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Selettore periodo */}
      <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-lg">
        <h3 className="text-gray-700 font-medium">Periodo di analisi</h3>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <DatePicker
              selected={periodoInizio}
              onChange={setPeriodoInizio}
              selectsStart
              startDate={periodoInizio}
              endDate={periodoFine}
              dateFormat="dd/MM/yyyy"
              locale={it}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="relative">
            <DatePicker
              selected={periodoFine}
              onChange={setPeriodoFine}
              selectsEnd
              startDate={periodoInizio}
              endDate={periodoFine}
              minDate={periodoInizio}
              dateFormat="dd/MM/yyyy"
              locale={it}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              onClick={() => {
                setPeriodoInizio(subDays(new Date(), 7));
                setPeriodoFine(new Date());
              }}
            >
              Ultimi 7 giorni
            </button>
            <button 
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              onClick={() => {
                setPeriodoInizio(subDays(new Date(), 30));
                setPeriodoFine(new Date());
              }}
            >
              Ultimo mese
            </button>
          </div>
        </div>
      </div>
      
      {/* Card riepilogative */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-1">Incassi totali</p>
          <p className="text-2xl font-bold text-red-700">{formatPrezzo(calcolaIncassiTotali())}</p>
          <p className="text-sm text-gray-500">nel periodo selezionato</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-1">Ordini totali</p>
          <p className="text-2xl font-bold text-blue-700">{calcolaOrdiniTotali()}</p>
          <p className="text-sm text-gray-500">nel periodo selezionato</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm mb-1">Valore medio ordine</p>
          <p className="text-2xl font-bold text-green-700">{formatPrezzo(calcolaValoreMedio())}</p>
          <p className="text-sm text-gray-500">nel periodo selezionato</p>
        </div>
      </div>
      
      {/* Grafici */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-gray-700 font-medium mb-4 text-center">Ordini per Tipo</h3>
          <div className="h-60">
            <Pie data={dataTipi} options={options} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-gray-700 font-medium mb-4 text-center">Ordini per Stato</h3>
          <div className="h-60">
            <Pie data={dataStati} options={options} />
          </div>
        </div>
      </div>
      
      {/* Grafico andamento */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-gray-700 font-medium mb-4 text-center">Andamento Giornaliero</h3>
        <div className="h-80">
          <Line data={dataGiorni} options={optionsLine} />
        </div>
      </div>
      
      {/* Tabella riepilogativa */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <h3 className="text-gray-700 font-medium mb-4">Riepilogo per tipo ordine</h3>
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-gray-600">Tipo</th>
              <th className="px-4 py-2 text-right text-gray-600">Numero ordini</th>
              <th className="px-4 py-2 text-right text-gray-600">Incasso totale</th>
              <th className="px-4 py-2 text-right text-gray-600">Valore medio</th>
              <th className="px-4 py-2 text-right text-gray-600">% sul totale</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tipiOrdine).map(([tipo, stats]) => (
              <tr key={tipo} className="border-b border-gray-100">
                <td className="px-4 py-2 font-medium">{tipo}</td>
                <td className="px-4 py-2 text-right">{stats.count}</td>
                <td className="px-4 py-2 text-right">{formatPrezzo(stats.totale)}</td>
                <td className="px-4 py-2 text-right">{formatPrezzo(stats.totale / stats.count)}</td>
                <td className="px-4 py-2 text-right">
                  {((stats.totale / calcolaIncassiTotali()) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatisticheOrdini;