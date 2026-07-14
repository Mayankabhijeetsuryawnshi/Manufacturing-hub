/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Factory, Search, Save, Download, FileJson, ChevronRight, RotateCcw, Camera, X, FileText } from 'lucide-react';
import { HubApi } from '../api';
import { Html5Qrcode } from 'html5-qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CUSTOMERS = [
  { id: 'sharda', name: 'Sahdra Motors' },
  { id: 'amtek', name: 'Amtek' },
  { id: 'amtek_auto', name: 'Amtek Auto Exports' },
  { id: 'dev', name: 'Devchhaya' },
  { id: 'tapovan', name: 'Tapovan' },
  { id: 'smt', name: 'S.D / SMT Auto' },
  { id: 'panse_unit_2', name: 'Panse Unit 2' },
  { id: 'panse_unit_3', name: 'Panse Unit 3' },
  { id: 'autoline_p2', name: 'Autoline P2' }
];

const PARTS_DATA: Record<string, [string, number][]> = {
  sharda: [
    ["Assy Mud Guard Mtg Pipe Lwr LH (23-44-260-0009) (1590N)", 33.30],
    ["Assy Mud Guard Mtg Pipe Lwr RH (23-44-260-0008) (00990N)", 16.90],
    ["Assy RR Mtg Pipe Upr LH (23-44-260-0018) (0030N)", 11.00],
    ["Assy RR Mtg Pipe Upr RH (23-44-260-0019) (0036N)", 11.00],
    ["Assy RR Mtg Pipe Lwr LH (23-44-260-0016) (00360N)", 21.20],
    ["Assy RR Mtg Pipe Lwr RH (23-44-260-0017) (00370N)", 16.80],
    ["Assy Bracket Snorkel Lwr Half (23-44-260-0022) (00150N)", 22.90],
    ["Frout Pipe Assy (23-44-260-0024) (00670N)", 18.60],
    ["Bracket Snorkel Lower Half (23-44-260-0020) (00020N)", 13.40],
    ["Assy Mudguard Pipe Lwr RH (23-44-260-0021) (01220N)", 13.40],
    ["ARM Assy LWR Cont LH (23-44-285-0001) (06660N)", 13.71],
    ["ARM Assy LWR Cont RH (23-44-285-0002) (06650N)", 13.71],
    ["ARM Sub LWR LH (23-44-205-0002) (07550N)", 12.10],
    ["ARM Sub LWR RH (23-44-205-0001) (07560N)", 12.10],
    ["Pipe Duct to Hose (23-44-260-0042)", 35.40],
    ["ARM ASSY Upper RR RH (23-44-289-0002)", 8.83],
    ["ARM ASSY Lower RR (23-44-289-0001)", 11.84],
    ["Assy Front Pipe B (49T) 6503AAB00540N", 170.28],
    ["Front Pipe A 6503AAB00040N (23-44-260-0001)", 166.13],
    ["Clamp Front Pipe W/O (6503CAB00020N)", 131.00],
    ["Front Pipe A (6503AAB00040N)", 170.28],
    ["Tail Pipe 25 TON (6503AAB00070N)", 193.48],
    ["Tail Pipe 40 TON (6503AAB00060N)", 149.56],
    ["Front Pipe Assy (6503AAB00670N)", 110.28],
    ["Assy Flex Pipe (6503AAB00640N)", 97.51],
    ["6503AA000670N - 011", 70.00],
    ["6501AA000560N - 003", 90.00],
  ],
  amtek: [
    ["Front Cover Welded Amtek", 14.50],
    ["Gear Lever Assy Amtek", 9.80],
  ],
  amtek_auto: [
    ["Brkt Rear Spring Upr Exports", 18.00],
    ["Brkt Front Cable Puller", 6.50],
  ],
  dev: [
    ["Tail Gate Bush Devchhaya", 2.20],
  ],
  tapovan: [
    ["Tapovan Spacer Washer 5mm", 1.10],
  ],
  smt: [
    ["Flange Weldment SMT", 5.20],
  ],
  panse_unit_2: [
    ["Panse Pivot Pin U2", 8.40],
  ],
  panse_unit_3: [
    ["Panse Pivot Pin U3", 8.90],
  ],
  autoline_p2: [
    ["Brake Pedal Assy. Welded (543829200108S)", 5.98],
    ["Brake Lever Welded (543829200111S)", 3.76],
    ["Assy Clutch pedal lever welded (543829100109S)", 4.0],
    ["BRACKET BATTERY TOP (0201AA302330N)", 2.5],
    ["LEVER ASSY CLUTCH PEDAL (553229100115S)", 3.83],
    ["BRACKET ASSY CLUTCH PEDAL MTG (553229500110S)", 20.69],
    ["LEVER ASSY BRAKE PEDAL (553229200111S)", 6.46],
    ["BRACKET ASSY BRAKE PEDAL MTG (553229500103S)", 20.76],
    ["SCUFF PLATE MTG BKT R (585869108210F)", 2.46],
    ["SCUFF PLATE MTG BKT L (585869108209F)", 2.46],
    ["BRACKET ASSY, CLUTCH PEDAL MTG (264229500103F)", 19.88],
    ["LEVER ASSY CLUTCH PEDAL (264229100167S)", 5.49],
    ["Assly Control Mtg Bracket Y1 Bus Brake (550729500252SFG)", 21.25],
    ["Assy. Brake Lever Complete (LHD) (550729200241S)", 6.11],
    ["BRAKE PEDAL ASSY (284529200109S)", 4.55],
    ["BRACKET ASSY BRAKE and CLUTCH CONTROL (284529100120S)", 21.98],
    ["BRACKET ASSY, CLUTCH PEDAL MTG (555029100103S)", 6.55],
    ["CLUTCH PEDAL ASSY (555029100102S)", 5.82],
    ["Assy Prc Cove (253401140101F)", 10.49],
    ["Assy. Bkt. Parking Brake Cable Supp (284542700107F)", 2.07],
    ["Engine Cross Member Rear (270531208210F)", 46.15],
    ["Engine Cross Member Rear (264731200101F)", 50.23],
    ["Bracket (253450407101S)", 3.67],
    ["ASSY EXTENSION PIECE FOR FRAME (219031100101F)", 30.38],
    ["Engine Cross Member Rear (282131200123F)", 50.23],
    ["ASSY EXTENSION PIECE FOR FRAME L (219031100102F)", 30.38],
    ["Assy Foot Ste (259286900125F)", 10.2],
    ["LEVER ASSY. BRAKE PEDAL (550729200116S)", 5.11],
    ["BRACKET ASSY BRAKE PEDAL MTG (550729500116S)", 19.64],
    ["Lever Clutch Assy. (550729100203S)", 4.15],
    ["CLUTCH PEDAL ASSY WITH LEVER (555429100202S)", 4.01],
    ["BRACKET ASSY CLUTCH PEDAL MTG (555429500102F)", 18.86],
    ["LEVER ASSY BRAKE PEDAL (555429200101S)", 3.9],
    ["ASSY CONTROL MTG BKT (CLUTCH) (553029500101S)", 27.81],
    ["Assly Control Mtg Bracket Y1 Bus Brake (550529500119SFG)", 17.81]
  ]
};

export default function ProductionLog() {
  const [customer, setCustomer] = useState('');
  const [search, setSearch] = useState('');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Day');
  const [supervisor, setSupervisor] = useState('');
  const [challanNo, setChallanNo] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [supervisors] = useState<string[]>(JSON.parse(localStorage.getItem('HUB_SUPERVISORS') || '["Admin", "Supervisor 1", "Supervisor 2"]'));

  // Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [simulatedBarcode, setSimulatedBarcode] = useState('');
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (customer && PARTS_DATA[customer]) {
      setRows(PARTS_DATA[customer].map(([name, rate]) => ({
        name,
        rate,
        qty: 0,
        amount: 0,
        remark: ''
      })));
    } else {
      setRows([]);
    }
  }, [customer]);

  const updateQty = (index: number, val: number) => {
    const newRows = [...rows];
    newRows[index].qty = val;
    newRows[index].amount = val * newRows[index].rate;
    setRows(newRows);
  };

  const updateRemark = (index: number, val: string) => {
    const newRows = [...rows];
    newRows[index].remark = val;
    setRows(newRows);
  };

  const resetForm = () => {
    setRows(rows.map(r => ({ ...r, qty: 0, amount: 0, remark: '' })));
    setChallanNo('');
    setStatus('Form Cleared');
    setTimeout(() => setStatus(''), 2000);
  };

  const totalQty = rows.reduce((sum, r) => sum + r.qty, 0);
  const totalAmt = rows.reduce((sum, r) => sum + r.amount, 0);

  const filteredRows = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  // Barcode Lookup Function
  const handleBarcodeScanned = (barcode: string) => {
    if (!customer) {
      alert("⚠️ Please select a Customer first so we can scan relevant parts!");
      return;
    }

    const cleanBarcode = barcode.trim().toUpperCase();
    console.log("Scanned Barcode Text:", cleanBarcode);

    // Look for part name containing the barcode text
    const foundIndex = rows.findIndex(r => r.name.toUpperCase().includes(cleanBarcode));
    if (foundIndex !== -1) {
      // Highlight row and focus quantity addition
      setSearch(rows[foundIndex].name);
      const updatedRows = [...rows];
      updatedRows[foundIndex].qty = (updatedRows[foundIndex].qty || 0) + 1;
      updatedRows[foundIndex].amount = updatedRows[foundIndex].qty * updatedRows[foundIndex].rate;
      updatedRows[foundIndex].remark = "Scanned via QR/Barcode";
      setRows(updatedRows);
      
      setStatus(`Barcode Scanned: ${cleanBarcode} matched! Quantity incremented.`);
      setTimeout(() => setStatus(''), 4000);
      handleStopScanner();
    } else {
      alert(`⚠️ No part matches barcode identifier: "${barcode}" under selected customer.`);
    }
  };

  // Start Camera QR/Barcode Scanner
  const handleStartScanner = async () => {
    if (!customer) {
      alert("⚠️ Please select a Customer first!");
      return;
    }
    setShowScanner(true);
    setScannerError('');
    
    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode("scanner-view");
        qrRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 280, height: 180 } },
          (decodedText) => {
            handleBarcodeScanned(decodedText);
          },
          (err) => {
            // Keep scanning, silent errors are normal
          }
        );
      } catch (e: any) {
        console.warn("Scanner initialization error:", e);
        setScannerError("Camera permission blocked or unavailable in this environment. Use simulator fallback below.");
      }
    }, 300);
  };

  // Stop Camera Scanner
  const handleStopScanner = async () => {
    if (qrRef.current && qrRef.current.isScanning) {
      try {
        await qrRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    qrRef.current = null;
    setShowScanner(false);
  };

  const handleSave = async () => {
    const activeParts = rows.filter(r => r.qty > 0);
    if (activeParts.length === 0) {
      alert("Please enter quantities first.");
      return;
    }
    
    setStatus('Saving...');
    try {
      const customerName = CUSTOMERS.find(c => c.id === customer)?.name || customer;

      await HubApi.save({
        type: 'productionLog',
        customer: customerName,
        challanNo,
        date: productionDate,
        shift,
        supervisor,
        totalQty,
        totalAmt,
        parts: activeParts
      });

      setStatus('Successfully Recorded!');
      setRows(rows.map(r => ({ ...r, qty: 0, amount: 0, remark: '' })));
      setChallanNo('');
      setTimeout(() => setStatus(''), 3000);
    } catch (e: any) {
      console.error(e);
      const msg = e.message || 'Check Connection';
      setStatus('Error: ' + msg);
      alert('Error: ' + msg);
    }
  };

  // Excel CSV Export
  const handleExport = () => {
    const activeParts = rows.filter(r => r.qty > 0);
    const customerName = CUSTOMERS.find(c => c.id === customer)?.name || customer;

    if (activeParts.length === 0) {
      if (!customer) {
        alert("Please select a customer first.");
        return;
      }
      const masterData = PARTS_DATA[customer];
      const headers = ["Part Name", "Rate"];
      const csvContent = [headers, ...masterData].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${customerName}_Master_Material_List.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const headers = ["Date", "Shift", "Supervisor", "Customer", "Challan No", "Part Name", "Qty", "Rate", "Amount", "Remark"];
    const rows_data = activeParts.map(p => [
      productionDate,
      shift,
      supervisor,
      customerName,
      challanNo,
      p.name,
      p.qty,
      p.rate,
      p.amount,
      p.remark
    ]);

    const csvContent = [headers, ...rows_data].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Production_Report_${challanNo || 'NoChallan'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Report Generation using jsPDF & autoTable
  const handleExportPdf = () => {
    const activeParts = rows.filter(r => r.qty > 0);
    if (activeParts.length === 0) {
      alert("Please add at least one logged item to generate a production PDF report!");
      return;
    }

    const customerName = CUSTOMERS.find(c => c.id === customer)?.name || customer;

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("UNIFIED MANUFACTURING HUB", 14, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Official Production Material Movement Receipt", 14, 27);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);
    
    // Info Grid
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "bold");
    doc.text("Log Details:", 14, 52);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`Customer: ${customerName}`, 14, 59);
    doc.text(`Challan No: ${challanNo || 'N/A'}`, 14, 65);
    doc.text(`Date: ${productionDate}`, 110, 59);
    doc.text(`Shift: ${shift} | Supervisor: ${supervisor || 'N/A'}`, 110, 65);
    
    // Table
    const tableHeaders = [["Part Name", "Qty", "Rate (₹)", "Amount (₹)", "Remark"]];
    const tableBody = activeParts.map(p => [
      p.name,
      p.qty.toString(),
      `₹${p.rate.toFixed(2)}`,
      `₹${p.amount.toLocaleString()}`,
      p.remark || '-'
    ]);

    autoTable(doc, {
      startY: 72,
      head: tableHeaders,
      body: tableBody,
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });

    // Summary Summary box
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, finalY, 182, 22, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.text(`Total Logged Quantity: ${totalQty} units`, 18, finalY + 9);
    doc.text(`Total Challan Value: INR ${totalAmt.toLocaleString()}`, 18, finalY + 16);
    
    // Signatures
    const sigY = finalY + 45;
    doc.line(14, sigY, 70, sigY);
    doc.text("Supervisor Signature", 14, sigY + 6);
    
    doc.line(140, sigY, 196, sigY);
    doc.text("Authorized Inspector", 140, sigY + 6);

    doc.save(`Production_Report_${challanNo || 'NoChallan'}_${productionDate}.pdf`);
  };

  const handleExportJson = () => {
    const activeParts = rows.filter(r => r.qty > 0);
    const data = {
      type: 'productionLog',
      customer: CUSTOMERS.find(c => c.id === customer)?.name || customer,
      challanNo,
      date: productionDate,
      shift,
      supervisor,
      totalQty,
      totalAmt,
      parts: activeParts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Production_Data_${new Date().getTime()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Factory className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black tracking-tight">Material Movement</h2>
          <p className="text-slate-600 font-semibold">Record incoming production items and calculate totals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-3xl md:col-span-1 bg-white border border-slate-200">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest text-center">Challan No</label>
              <input 
                type="text" 
                className="w-full text-black font-bold text-sm bg-white border border-slate-200 rounded-xl" 
                placeholder="Enter Challan #"
                value={challanNo} 
                onChange={(e) => setChallanNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest text-center">Date</label>
              <input 
                type="date" 
                className="w-full text-black font-bold text-sm bg-white border border-slate-200 rounded-xl" 
                value={productionDate} 
                onChange={(e) => setProductionDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest text-center">Shift</label>
                <select 
                  className="w-full text-black font-bold text-sm bg-white border border-slate-200 rounded-xl" 
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                >
                  <option>Day</option>
                  <option>Night</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest text-center">Sup.</label>
                <select 
                  className="w-full text-black font-bold text-sm bg-white border border-slate-200 rounded-xl" 
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                >
                  <option value="">Choose</option>
                  {supervisors.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl md:col-span-3 bg-white border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Customer</label>
              <select 
                className="w-full text-black font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white" 
                value={customer} 
                onChange={(e) => setCustomer(e.target.value)}
              >
                <option value="">Select Customer</option>
                {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Search Part</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full pl-10 text-black font-bold border border-slate-200 rounded-xl" 
                  placeholder="Filter rows..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleStartScanner}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer h-[38px]"
              >
                <Camera className="w-4 h-4" />
                Scan Item
              </button>
            </div>
          </div>

          {/* Camera Scanning View Overlay */}
          {showScanner && (
            <div className="mb-6 p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl relative">
              <button 
                type="button" 
                onClick={handleStopScanner}
                className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 rounded-full hover:bg-slate-100 z-10"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
              <h4 className="text-xs font-black text-black uppercase tracking-widest mb-3 text-center">Place Barcode/QR inside box</h4>
              <div id="scanner-view" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black aspect-video"></div>
              {scannerError && <p className="text-[10px] text-red-500 font-bold text-center mt-2">{scannerError}</p>}
              
              {/* Simulator fallback */}
              <div className="mt-4 border-t border-slate-200 pt-3 flex flex-col items-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Simulate Barcode Input</p>
                <div className="flex gap-2 w-full max-w-xs">
                  <input 
                    type="text" 
                    placeholder="e.g. 543829200108S or 23-44-260-0009" 
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-black focus:outline-none"
                    value={simulatedBarcode}
                    onChange={e => setSimulatedBarcode(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => handleBarcodeScanned(simulatedBarcode)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-2xl bg-white">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Part Name</th>
                  <th className="px-4 py-3 w-24">Qty</th>
                  <th className="px-4 py-3 w-24 text-right">Rate</th>
                  <th className="px-4 py-3 w-32 text-right">Amount</th>
                  <th className="px-4 py-3 w-32">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-black text-xs">{row.name}</td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          className="w-full text-center py-1 font-bold text-black border-slate-300 rounded-lg" 
                          value={row.qty || ''} 
                          onChange={(e) => updateQty(rows.indexOf(row), Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono font-bold text-xs">₹{row.rate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-black text-black">
                        ₹{row.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          className="w-full py-1 text-xs border-slate-200 placeholder:text-slate-300 italic rounded-lg" 
                          placeholder="..."
                          value={row.remark}
                          onChange={(e) => updateRemark(rows.indexOf(row), e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-bold italic">
                      {customer ? "No parts matching search." : "Select a customer to load parts."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <div key={row.name} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-bold text-black leading-tight">{row.name}</p>
                    <p className="text-[10px] font-black text-slate-400 whitespace-nowrap font-mono">₹{row.rate}/unit</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Enter Quantity</label>
                      <input 
                        type="number" 
                        className="w-full text-base font-black text-emerald-600 bg-emerald-50 border-emerald-100 rounded-xl px-3 py-2"
                        placeholder="0"
                        value={row.qty || ''} 
                        onChange={(e) => updateQty(rows.indexOf(row), Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Amount</label>
                      <div className="w-full text-base font-black text-black bg-slate-50 border-slate-100 rounded-xl px-3 py-2 flex items-center font-mono">
                        ₹{row.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      className="w-full py-2 text-xs border-slate-100 rounded-xl placeholder:text-slate-300 italic px-3 bg-slate-50/50" 
                      placeholder="Add a remark..."
                      value={row.remark}
                      onChange={(e) => updateRemark(rows.indexOf(row), e.target.value)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 font-bold italic border border-dashed border-slate-200 rounded-2xl">
                {customer ? "No match found." : "Select a customer to start."}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-10 rounded-[2.5rem] border-emerald-500/20 bg-emerald-50/30 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-emerald-700 uppercase mb-8 tracking-[0.2em] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Live Movement Summary
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Qty</span>
                  <p className="text-4xl font-black text-black tracking-tighter">{totalQty}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Value</span>
                  <p className="text-4xl font-black text-black tracking-tighter font-mono">₹{totalAmt.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button 
                onClick={handleSave}
                className="flex-[3] bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-5 font-black shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs cursor-pointer"
              >
                <Save className="w-5 h-5" />
                Submit Material Movement
              </button>
              <button 
                onClick={resetForm}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-2xl px-6 font-bold flex items-center justify-center transition-all shadow-sm cursor-pointer"
                title="Clear All Fields"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            {status && <p className="text-[10px] text-center mt-4 font-black text-emerald-600 uppercase tracking-[0.15em] bg-white/50 py-2 rounded-full border border-emerald-100">{status}</p>}
          </div>

          <div className="glass-card p-10 rounded-[2.5rem] bg-white border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em]">Data Export & Sharing</h3>
              <div className="grid grid-cols-3 gap-3 flex-1">
                <button 
                  onClick={handleExport}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group shadow-sm cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600 group-hover:scale-105 transition-transform">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-black text-black">Excel</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">CSV</span>
                  </div>
                </button>
                <button 
                  onClick={handleExportPdf}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all group shadow-sm cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-red-600/10 text-red-600 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-black text-black">Receipt</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PDF</span>
                  </div>
                </button>
                <button 
                  onClick={handleExportJson}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group shadow-sm cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-orange-600/10 text-orange-600 group-hover:scale-105 transition-transform">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-black text-black">JSON</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Raw</span>
                  </div>
                </button>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-6 text-center bg-slate-50 py-2 rounded-xl border border-slate-100 italic">
              Records are automatically synced to relational database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
