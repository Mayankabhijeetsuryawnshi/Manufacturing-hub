/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BarChart3, Clock, Users, Save, FileText } from 'lucide-react';
import { HubApi } from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const TIMES = ["8-9", "9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8"];
const SHORTFALL_TIMES = ["11-12", "5-6", "3-4"];

export default function DailyProductionReport() {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Day');
  const [line1, setLine1] = useState(TIMES.map(time => ({ time, part: '', target: 0, actual: 0, rs: '', rej: 0 })));
  const [line2, setLine2] = useState(TIMES.map(time => ({ time, part: '', target: 0, actual: 0, rs: '', rej: 0 })));
  const [line3, setLine3] = useState([{ time: '9-10', part: '', qty: 0 }, { time: '1-2', part: '', qty: 0 }]);
  const [line4, setLine4] = useState([{ time: '9-10', part: '', qty: 0 }, { time: '1-2', part: '', qty: 0 }]);
  const [shortfalls, setShortfalls] = useState(SHORTFALL_TIMES.map(time => ({ time, reason: '' })));
  const [powderFilterTime, setPowderFilterTime] = useState('');
  const [powderFilterValue, setPowderFilterValue] = useState('');
  const [teaBreakRemarks, setTeaBreakRemarks] = useState('');
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [supervisors] = useState<string[]>(JSON.parse(localStorage.getItem('HUB_SUPERVISORS') || '["Admin", "Supervisor 1", "Supervisor 2"]'));
  const [manpower, setManpower] = useState('');
  const [status, setStatus] = useState('');

  const handleSave = async () => {
    setStatus('Submitting...');
    try {
      const normalizeLine = (lineData: any[]) => lineData.map(item => ({
        part: item.part || "N/A",
        qty: item.actual !== undefined ? item.actual : (item.qty || 0)
      }));

      await HubApi.save({
        type: 'dailyReport',
        date: reportDate,
        shift,
        supervisor,
        manpower,
        line1: normalizeLine(line1),
        line2: normalizeLine(line2),
        line3: normalizeLine(line3),
        line4: normalizeLine(line4),
        shortfalls,
        powderFilter: { time: powderFilterTime, value: powderFilterValue },
        teaBreakRemarks,
        generalRemarks
      });
      setStatus('Success!');
    } catch (e: any) {
      console.error("Save failed:", e);
      const msg = e.message || 'Check Connection';
      setStatus('Error: ' + msg);
      alert('Error: ' + msg);
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    
    // Colored Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 42, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("DAILY PRODUCTION SHIFT REPORT", 14, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Date: ${reportDate} | Shift: ${shift} | Supervisor: ${supervisor || 'N/A'}`, 14, 26);
    doc.text(`Manpower Strength: ${manpower || 'N/A'} operators`, 14, 32);
    doc.text("Doc ID: GIPL/PRD/09 | Revision: 00", 14, 38);

    let currentY = 50;

    // Line 1 & Line 2 Active Entries
    const activeLine1 = line1.filter(item => item.part);
    const activeLine2 = line2.filter(item => item.part);

    const body: any[] = [];
    activeLine1.forEach(item => {
      body.push(["Line 1", item.time, item.part, item.target.toString(), item.actual.toString(), item.rs || "-", item.rej.toString()]);
    });
    activeLine2.forEach(item => {
      body.push(["Line 2", item.time, item.part, item.target.toString(), item.actual.toString(), item.rs || "-", item.rej.toString()]);
    });

    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Line 1 & Line 2 Production Output", 14, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      head: [["Line", "Time Slot", "Part Details", "Target", "Actual", "RS", "Rej"]],
      body: body.length > 0 ? body : [["Line 1 / 2", "N/A", "No material entries added to lines.", "-", "-", "-", "-"]],
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Line 3 & 4 (Conveyor) entries
    const activeLine3 = line3.filter(item => item.part);
    const activeLine4 = line4.filter(item => item.part);
    const subBody: any[] = [];
    activeLine3.forEach(item => {
      subBody.push(["Line 3", item.time, item.part, item.qty.toString()]);
    });
    activeLine4.forEach(item => {
      subBody.push(["Line 4", item.time, item.part, item.qty.toString()]);
    });

    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Line 3 & Line 4 (Conveyor) Output", 14, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      head: [["Line", "Time Slot", "Part Details", "Qty"]],
      body: subBody.length > 0 ? subBody : [["Line 3 / 4", "N/A", "No conveyor entries added.", "-"]],
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Parameters, Shortfalls, Remarks
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Process Parameters & Remarks", 14, currentY);
    
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    
    doc.text(`• Powder Filter: ${powderFilterTime || "N/A"} (Time) -> ${powderFilterValue || "N/A"} (Value)`, 14, currentY + 6);
    doc.text(`• Tea Break Remarks: ${teaBreakRemarks || "No comments"}`, 14, currentY + 12);
    doc.text(`• General Comments: ${generalRemarks || "No comments"}`, 14, currentY + 18);

    // Shortfalls
    const shortfallTexts = shortfalls.filter(s => s.reason).map(s => `${s.time}: ${s.reason}`).join(" | ");
    doc.text(`• Hourly Shortfalls: ${shortfallTexts || "None logged"}`, 14, currentY + 24);

    // Signature Area
    const sigY = currentY + 45;
    if (sigY < 280) {
      doc.line(14, sigY, 70, sigY);
      doc.text("Shift Supervisor Signature", 14, sigY + 6);
      
      doc.line(140, sigY, 196, sigY);
      doc.text("Authorized Executive", 140, sigY + 6);
    }

    doc.save(`Daily_Production_Report_${reportDate}_Shift-${shift}.pdf`);
  };

  const renderTable = (data: any[], setData: any, title: string, isDetailed: boolean) => (
    <div className="glass-card rounded-[2rem] overflow-hidden border-slate-200 shadow-sm bg-white mb-8">
      <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-black text-black uppercase tracking-widest text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b border-slate-200">
              <th className="px-6 py-4 w-24">Time</th>
              <th className="px-6 py-4">Part Name/No</th>
              {isDetailed ? (
                <>
                  <th className="px-6 py-4 w-24 text-center">Target</th>
                  <th className="px-6 py-4 w-24 text-center">Actual</th>
                  <th className="px-6 py-4 w-20 text-center">RS</th>
                  <th className="px-6 py-4 w-20 text-center text-orange-700">Rej</th>
                </>
              ) : (
                <th className="px-6 py-4 w-32 text-center">Qty</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-3 font-black text-slate-400 group-hover:text-black">{row.time}</td>
                <td className="px-6 py-2">
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-none px-0 py-0 text-black font-black focus:ring-0 placeholder:text-slate-300"
                    placeholder="Enter part..."
                    value={row.part}
                    onChange={e => {
                      const n = [...data]; n[idx].part = e.target.value; setData(n);
                    }}
                  />
                </td>
                {isDetailed ? (
                  <>
                    <td className="px-6 py-2">
                      <input type="number" className="w-full text-center py-1 bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-blue-500 font-black text-black" value={row.target} onChange={e => { const n = [...data]; n[idx].target = Number(e.target.value); setData(n); }} />
                    </td>
                    <td className="px-6 py-2">
                      <input type="number" className="w-full text-center py-1 bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-blue-500 font-black text-blue-600" value={row.actual} onChange={e => { const n = [...data]; n[idx].actual = Number(e.target.value); setData(n); }} />
                    </td>
                    <td className="px-6 py-2">
                      <input type="text" className="w-full text-center py-1 bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-blue-500 uppercase font-black text-slate-400 text-[10px]" placeholder="--" value={row.rs} onChange={e => { const n = [...data]; n[idx].rs = e.target.value; setData(n); }} />
                    </td>
                    <td className="px-6 py-2 text-center">
                      <input type="number" className="w-20 text-center py-1 bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-orange-500 text-orange-700 font-black" value={row.rej} onChange={e => { const n = [...data]; n[idx].rej = Number(e.target.value); setData(n); }} />
                    </td>
                  </>
                ) : (
                  <td className="px-6 py-2 text-center">
                    <input type="number" className="w-24 text-center py-1 bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-blue-500 font-black text-black" value={row.qty} onChange={e => { const n = [...data]; n[idx].qty = Number(e.target.value); setData(n); }} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 md:mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight">Production Report</h2>
            <p className="text-slate-600 text-xs md:text-sm font-semibold tracking-tight">Multi-line tracking analysis.</p>
          </div>
        </div>
        <div className="text-left md:text-right w-full md:w-auto">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Doc No: GIPL/PRD/09</p>
          <p className="text-[10px] text-slate-300 font-black uppercase">Rev: 00 | 01.12.2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
        <div className="glass-card p-5 rounded-2xl border-slate-200">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Date</label>
          <input type="date" className="w-full text-sm font-black bg-white border-slate-300 rounded-xl" value={reportDate} onChange={e => setReportDate(e.target.value)} />
        </div>
        <div className="glass-card p-5 rounded-2xl border-slate-200">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Shift</label>
          <select className="w-full text-sm font-black bg-white border-slate-300 rounded-xl" value={shift} onChange={e => setShift(e.target.value)}>
            <option>Day</option>
            <option>Night</option>
          </select>
        </div>
        <div className="glass-card p-5 rounded-2xl border-slate-200">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Supervisor</label>
          <select 
            className="w-full text-sm font-black bg-white border-slate-300 rounded-xl" 
            value={supervisor} 
            onChange={e => setSupervisor(e.target.value)}
          >
            <option value="">Select Supervisor</option>
            {supervisors.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div className="glass-card p-5 rounded-2xl border-slate-200">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Manpower</label>
          <input 
            type="number" 
            className="w-full text-sm font-black bg-white border-slate-300 rounded-xl" 
            placeholder="Total" 
            value={manpower}
            onChange={e => setManpower(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {renderTable(line1, setLine1, "Line No - 1", true)}
        {renderTable(line2, setLine2, "Line No - 2", true)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {renderTable(line3, setLine3, "Line No - 3", false)}
        {renderTable(line4, setLine4, "Line No - 4 (Conveyor)", false)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
         <div className="glass-card p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
            <h3 className="font-black text-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-600" />
              Time vs Shortfall Reason
            </h3>
            <div className="space-y-4">
               {shortfalls.map((s, idx) => (
                  <div key={idx} className="flex gap-4 items-center border-b border-slate-50 pb-4">
                     <span className="w-20 text-xs font-black text-slate-400">{s.time}</span>
                     <input type="text" className="flex-1 bg-slate-50 border-none text-sm font-bold text-black rounded-xl" placeholder="Reason..." value={s.reason} onChange={e => { const n = [...shortfalls]; n[idx].reason = e.target.value; setShortfalls(n); }} />
                  </div>
               ))}
            </div>
         </div>
         <div className="glass-card p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Powder Filter Time</label>
                  <input type="text" className="w-full text-sm font-black bg-slate-50 border-none rounded-xl" placeholder="10:30 AM" value={powderFilterTime} onChange={e => setPowderFilterTime(e.target.value)} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Powder Filter Value</label>
                  <input type="text" className="w-full text-sm font-black bg-slate-50 border-none rounded-xl" placeholder="Value" value={powderFilterValue} onChange={e => setPowderFilterValue(e.target.value)} />
               </div>
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tea Break Remarks</label>
               <input type="text" className="w-full text-sm font-black bg-slate-50 border-none rounded-xl" placeholder="..." value={teaBreakRemarks} onChange={e => setTeaBreakRemarks(e.target.value)} />
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">General Remarks</label>
               <textarea rows={2} className="w-full text-sm font-black bg-slate-50 border-none rounded-xl" placeholder="Additional notes..." value={generalRemarks} onChange={e => setGeneralRemarks(e.target.value)} />
            </div>
         </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 items-center">
        {status && <span className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest">{status}</span>}
        <div className="flex w-full sm:w-auto gap-3">
          <button 
            onClick={handleExportPdf}
            className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-4 rounded-[2rem] font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200 transition-all text-xs"
          >
            <FileText className="w-4 h-4" />
            PDF Report
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-[2rem] font-black transition-all hover:scale-105 shadow-2xl shadow-blue-600/30 uppercase tracking-widest text-[10px] md:text-xs cursor-pointer"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
