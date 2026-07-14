/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Package, Plus, Trash2, Save, AlertTriangle, Download } from 'lucide-react';
import { HubApi } from '../api';
import { NotificationService } from '../lib/notifications';

const POWDER_TYPES = [
  "Satin Nerolac", "DIKEM Satin Black", "Asian Satin Black", "Matt Black",
  "Manu Grey", "Matt zink primer", "PP New Satin Black", "LD Black (jotun)"
];

const CHEMICALS = [
  "1100 P", "2104", "1213", "2103", "3202", "2804", "R 5000"
];

const CHEMICAL_LIMITS: Record<string, number> = {
  "1100 P": 75,
  "2104": 10,
  "1213": 40,
  "2103": 90,
  "3202": 5,
  "2804": 5,
  "R 5000": 10
};

const ENERGY_TYPES = [
  "BIG VOT 47 KG", "BIG LOT 47 KG", "SMALL 19 KG", "ELECTRICAL UNIT", "Diesel"
];

const OTHER_TYPES = [
  "Ventury Big", "Ventury Small", "Spray Bottle", "Diesel"
];

export default function PowderStock() {
  const [powderRows, setPowderRows] = useState(POWDER_TYPES.map(name => ({ 
    name, 
    fresh: '' as number | string, 
    recovery: '' as number | string,
    mfgDate: '' as string // New field
  })));
  const [chemicalRows, setChemicalRows] = useState(CHEMICALS.map(name => ({ name, qty: '' as number | string })));
  const [energyRows, setEnergyRows] = useState(ENERGY_TYPES.map(name => ({ name, fresh: '' as number | string, empty: '' as number | string, lineStock: '' as number | string })));
  const [otherRows, setOtherRows] = useState(OTHER_TYPES.map(name => ({ name, qty: '' as number | string })));
  const [status, setStatus] = useState('');

  const totalPowder = powderRows.reduce((a, b) => a + (Number(b.fresh) || 0) + (Number(b.recovery) || 0), 0);
  const totalChemical = chemicalRows.reduce((a, b) => a + (Number(b.qty) || 0), 0);

  const handleSave = async () => {
    const formattedPowder = powderRows.map(row => {
      const freshVal = Number(row.fresh) || 0;
      const recVal = Number(row.recovery) || 0;
      const total = freshVal + recVal;
      const nameLower = row.name.toLowerCase();
      const limit = (nameLower.includes("manu g") || nameLower.includes("ld black")) ? 60 : 400;
      const hasInteraction = row.fresh !== '' || row.recovery !== '';
      
      return {
        name: row.name,
        inStock: total,
        mfgDate: row.mfgDate, // Added mfgDate
        required: (hasInteraction && total < limit) ? limit - total : 0,
        status: (hasInteraction && total < limit) ? "LOW" : "OK"
      };
    });

    const formattedChemical = (chemicalRows || []).map(row => {
      const qty = Number(row.qty) || 0;
      const hasInteraction = row.qty !== '';
      const limit = CHEMICAL_LIMITS[row.name] || 50;
      return {
        name: row.name,
        inStock: qty,
        required: (hasInteraction && qty < limit) ? limit - qty : 0,
        status: (hasInteraction && qty < limit) ? "LOW" : "OK"
      };
    });

    const formattedEnergy = (energyRows || []).map(row => {
      const fresh = Number(row.fresh) || 0;
      const hasInteraction = row.fresh !== '';
      return {
        name: row.name,
        inStock: fresh,
        status: (hasInteraction && fresh < 10) ? "LOW" : "OK"
      };
    });

    const formattedOthers = (otherRows || []).map(row => {
      const qty = Number(row.qty) || 0;
      const hasInteraction = row.qty !== '';
      return {
        name: row.name,
        inStock: qty,
        status: (hasInteraction && qty < 5) ? "LOW" : "OK"
      };
    });

    // Trigger notification for low stock
    const lowItems = [
      ...formattedPowder.filter(p => p.status === "LOW").map(p => ({ name: p.name, type: 'Powder' })),
      ...formattedChemical.filter(c => c.status === "LOW").map(c => ({ name: c.name, type: 'Chemical' })),
      ...formattedEnergy.filter(e => e.status === "LOW").map(e => ({ name: e.name, type: 'Energy' })),
      ...formattedOthers.filter(o => o.status === "LOW").map(o => ({ name: o.name, type: 'Other' }))
    ];

    setStatus('Saving...');
    try {
      await HubApi.save({
        type: 'powderStock',
        date: new Date().toISOString().split('T')[0],
        totalPowder,
        totalChemical,
        powderRows: formattedPowder,
        chemicalRows: formattedChemical,
        energyRows: formattedEnergy,
        otherRows: formattedOthers,
        lowItems // Send processed low items to GAS
      });

      if (lowItems.length > 0) {
        NotificationService.alertLowStock(lowItems.map(i => `${i.name} (${i.type})`));
      }

      setStatus('Stock updated!');
    } catch (e: any) {
      console.error("Save failed:", e);
      const msg = e.message || 'Check Connection';
      setStatus('Error: ' + msg);
      alert('Error: ' + msg);
    }
  };

  const handleExport = () => {
    const headers = ["Category", "Item Name", "Fresh/Qty", "Recovery/Empty", "Line Stock", "Total", "Status"];
    const rows: any[][] = [];

    // Powder
    powderRows.forEach(r => {
      const total = (Number(r.fresh) || 0) + (Number(r.recovery) || 0);
      const limit = (r.name.toLowerCase().includes("manu g") || r.name.toLowerCase().includes("ld black")) ? 60 : 400;
      rows.push(["Powder", r.name, r.fresh, r.recovery, "", total, total < limit ? "LOW" : "OK"]);
    });

    // Chemicals
    chemicalRows.forEach(r => {
      const qty = Number(r.qty) || 0;
      const limit = CHEMICAL_LIMITS[r.name] || 50;
      rows.push(["Chemical", r.name, r.qty, "", "", qty, qty < limit ? "LOW" : "OK"]);
    });

    // Energy
    energyRows.forEach(r => {
      const fresh = Number(r.fresh) || 0;
      rows.push(["Energy", r.name, r.fresh, r.empty, r.lineStock, fresh, fresh < 10 ? "LOW" : "OK"]);
    });

    // Others
    otherRows.forEach(r => {
      const qty = Number(r.qty) || 0;
      rows.push(["Other", r.name, r.qty, "", "", qty, qty < 5 ? "LOW" : "OK"]);
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Stock_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
          <Package className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight">Powder Stock</h2>
          <p className="text-slate-600 text-xs md:text-sm font-semibold tracking-tight">Inventory management.</p>
        </div>
        <button 
          onClick={handleExport}
          className="ml-auto flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Download className="w-3 h-3" />
          Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Powder Section */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-black flex items-center gap-2 tracking-tight uppercase text-xs">
              <div className="w-2 h-2 rounded-full bg-orange-600" />
              Powder Stock
            </h3>
            <span className="text-[10px] bg-orange-600/10 text-orange-700 font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/20">{totalPowder} kg</span>
          </div>

          <div className="space-y-3">
            {powderRows.map((row, idx) => {
              const total = (Number(row.fresh) || 0) + (Number(row.recovery) || 0);
              const nameLower = row.name.toLowerCase();
              const limit = (nameLower.includes("manu g") || nameLower.includes("ld black")) ? 60 : 400;
              const isLow = total < limit;
              return (
                <div key={row.name} className={`p-4 rounded-2xl border transition-all ${isLow ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-black">{row.name}</span>
                    {isLow && <span className="text-[10px] text-orange-700 font-black uppercase">Low Stock (Limit: {limit}kg)</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" className="text-center font-black text-black bg-slate-50" value={row.fresh} onChange={e => {
                        const n = [...powderRows]; n[idx].fresh = e.target.value === '' ? '' : Number(e.target.value); setPowderRows(n);
                      }} placeholder="Fresh" />
                      <input type="number" className="text-center font-black text-black bg-slate-50" value={row.recovery} onChange={e => {
                        const n = [...powderRows]; n[idx].recovery = e.target.value === '' ? '' : Number(e.target.value); setPowderRows(n);
                      }} placeholder="Recovery" />
                    </div>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full text-center font-bold text-[10px] text-slate-600 bg-slate-50 border-slate-100 rounded-xl py-2" 
                        value={row.mfgDate} 
                        onChange={e => {
                          const n = [...powderRows]; n[idx].mfgDate = e.target.value; setPowderRows(n);
                        }}
                      />
                      <span className="absolute -top-2 left-3 bg-white px-2 text-[8px] font-black text-orange-600 uppercase tracking-widest border border-orange-100 rounded">Mfg Date</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          {/* Chemical Section */}
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-black text-black flex items-center gap-2 tracking-tight uppercase text-xs mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              Chemical Stock
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {chemicalRows.map((row, idx) => {
                const qty = Number(row.qty) || 0;
                const limit = CHEMICAL_LIMITS[row.name] || 50;
                const isLow = row.qty !== '' && qty < limit;
                return (
                  <div key={row.name} className={`p-3 border rounded-xl flex justify-between items-center transition-all ${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">{row.name}</span>
                      {isLow && <span className="text-[8px] text-red-600 font-black uppercase">Low: Min {limit}kg</span>}
                    </div>
                    <input type="number" className="w-20 text-right font-black text-black bg-transparent border-none p-0 focus:ring-0" value={row.qty} onChange={e => {
                      const n = [...chemicalRows]; n[idx].qty = e.target.value === '' ? '' : Number(e.target.value); setChemicalRows(n);
                    }} placeholder="0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Energy Consumables Section */}
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-black text-black flex items-center gap-2 tracking-tight uppercase text-xs mb-6">
              <div className="w-2 h-2 rounded-full bg-red-600" />
              Energy Consumables
            </h3>
            <div className="space-y-3">
              {energyRows.map((row, idx) => (
                <div key={row.name} className="p-4 bg-white border border-slate-100 rounded-xl">
                  <span className="text-xs font-black text-black block mb-3">{row.name}</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" className="text-center text-[10px] font-black bg-slate-50" placeholder="Fresh" value={row.fresh} onChange={e => {
                      const n = [...energyRows]; n[idx].fresh = e.target.value === '' ? '' : Number(e.target.value); setEnergyRows(n);
                    }} />
                    <input type="number" className="text-center text-[10px] font-black bg-slate-50" placeholder="Empty" value={row.empty} onChange={e => {
                      const n = [...energyRows]; n[idx].empty = e.target.value === '' ? '' : Number(e.target.value); setEnergyRows(n);
                    }} />
                    <input type="number" className="text-center text-[10px] font-black bg-slate-50" placeholder="Line" value={row.lineStock} onChange={e => {
                      const n = [...energyRows]; n[idx].lineStock = e.target.value === '' ? '' : Number(e.target.value); setEnergyRows(n);
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Others Section */}
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-black text-black flex items-center gap-2 tracking-tight uppercase text-xs mb-6">
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              Others
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {otherRows.map((row, idx) => (
                <div key={row.name} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-black">{row.name}</span>
                  <input type="number" className="w-16 text-right font-black text-black bg-transparent border-none p-0" value={row.qty} onChange={e => {
                    const n = [...otherRows]; n[idx].qty = e.target.value === '' ? '' : Number(e.target.value); setOtherRows(n);
                  }} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="w-full bg-black text-white rounded-3xl py-6 font-black tracking-widest uppercase text-xs shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all">
            Save All Registers
          </button>
          {status && <p className="text-center font-black text-emerald-600 text-[10px] uppercase">{status}</p>}
        </div>
      </div>
    </div>
  );
}
