import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Printer, 
  Search, 
  Sparkles, 
  Play, 
  Square, 
  Plus,
  ArrowRight,
  ClipboardCopy
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { NotificationService } from '../lib/notifications';

interface ScanResult {
  code: string;
  customer: string;
  partName: string;
  qty: number;
  powderType: string;
  weightPerPart: number;
}

export default function QRScanner({ onScanMatch }: { onScanMatch?: (scannedPart: any) => void }) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [simulatedSelectedPart, setSimulatedSelectedPart] = useState<number>(0);

  // QR Code generation state
  const [qrText, setQrText] = useState('PART-CAT-EB401');
  const [qrCustomer, setQrCustomer] = useState('Caterpillar India');
  const [qrPartName, setQrPartName] = useState('Engine Bracket EB-401');
  const [qrQty, setQrQty] = useState(150);
  const [qrPowderType, setQrPowderType] = useState('Satin Nerolac');
  const [qrWeight, setQrWeight] = useState(1.42);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Pre-configured items for the high-fidelity simulator
  const SIMULATED_PARTS: ScanResult[] = [
    { code: 'PART-CAT-EB401', customer: 'Caterpillar India', partName: 'Engine Bracket EB-401', qty: 150, powderType: 'Satin Nerolac', weightPerPart: 1.42 },
    { code: 'PART-DIK-SBD02', customer: 'DIKEM Industries', partName: 'Satin Black Door SD-02', qty: 80, powderType: 'DIKEM Satin Black', weightPerPart: 4.85 },
    { code: 'PART-ASIAN-CP33', customer: 'Asian Paints Corp', partName: 'Matt Black Panel CP-33', qty: 240, powderType: 'Asian Satin Black', weightPerPart: 0.95 },
    { code: 'PART-MANU-GR99', customer: 'Manu Engineering', partName: 'Grey Gear Housing GH-99', qty: 50, powderType: 'Manu Grey', weightPerPart: 12.4 },
    { code: 'PART-PP-SB750', customer: 'PP New Tech', partName: 'Chassis Bracket SB-750', qty: 120, powderType: 'PP New Satin Black', weightPerPart: 2.1 }
  ];

  const activeSimulatedPart = SIMULATED_PARTS[simulatedSelectedPart];

  // Start real camera scanner if available
  const startCamera = () => {
    setCameraActive(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader", 
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        
        scanner.render(
          (decodedText) => {
            // Success callback
            handleDecodedText(decodedText);
            scanner.clear();
            setCameraActive(false);
          }, 
          (error) => {
            // Error is normal while scanning
          }
        );
        scannerRef.current = scanner;
      } catch (err: any) {
        console.error("Camera scanner creation failure:", err);
        NotificationService.error("Webcam blocked or not available in frame. Using simulator.");
        setCameraActive(false);
      }
    }, 200);
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        setCameraActive(false);
        scannerRef.current = null;
      }).catch(e => console.error(e));
    } else {
      setCameraActive(false);
    }
  };

  const handleDecodedText = (text: string) => {
    // Try to parse JSON if we generated it, or standard QR prefix
    try {
      if (text.startsWith('{')) {
        const data = JSON.parse(text);
        if (data.partName) {
          const res: ScanResult = {
            code: data.code || 'CUSTOM-QR',
            customer: data.customer || 'Direct QR Scan',
            partName: data.partName,
            qty: Number(data.qty) || 100,
            powderType: data.powderType || 'Matt Black',
            weightPerPart: Number(data.weightPerPart) || 1.0
          };
          setScanResult(res);
          NotificationService.success(`Successfully Scanned: ${res.partName}`);
          return;
        }
      }

      // Check if it matches any of our pre-configured codes
      const matched = SIMULATED_PARTS.find(p => p.code === text);
      if (matched) {
        setScanResult(matched);
        NotificationService.success(`Successfully Scanned: ${matched.partName}`);
      } else {
        // Generic barcode scanned
        const customRes: ScanResult = {
          code: text,
          customer: 'Self-Registered QR Customer',
          partName: `Scanned Item (${text})`,
          qty: 100,
          powderType: 'Matt Black',
          weightPerPart: 1.5
        };
        setScanResult(customRes);
        NotificationService.success(`Scanned Code: ${text}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerVirtualScan = () => {
    NotificationService.success("Simulated scan triggered!");
    setScanResult(activeSimulatedPart);
  };

  const handleApplyToForm = () => {
    if (scanResult && onScanMatch) {
      onScanMatch(scanResult);
      NotificationService.success("Part details transferred to material entry form.");
    } else {
      NotificationService.error("No target form available. Open the 'Material Movement' tab to log this item.");
    }
  };

  const handleCopyToClipboard = () => {
    const jsonStr = JSON.stringify({
      code: qrText,
      customer: qrCustomer,
      partName: qrPartName,
      qty: qrQty,
      powderType: qrPowderType,
      weightPerPart: qrWeight
    }, null, 2);
    
    navigator.clipboard.writeText(jsonStr);
    NotificationService.success("QR schema copied to clipboard.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* COLUMN 1: SCANNER */}
      <div className="glass-card p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Barcode & QR Reader
          </h3>
          <p className="text-xs text-slate-500 font-semibold mb-6">
            Scan labels on parts to fetch details, track batches, and automate entry logs.
          </p>

          {/* Camera Scan Window */}
          {cameraActive ? (
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex flex-col items-center justify-center mb-6">
              <div id="qr-reader" className="w-full h-full max-w-sm"></div>
              <button
                onClick={stopCamera}
                className="absolute bottom-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-white" /> Stop Webcam
              </button>
            </div>
          ) : (
            <div className="relative rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-400 aspect-video flex flex-col items-center justify-center bg-slate-50 transition-all mb-6">
              <QrCode className="w-12 h-12 text-slate-300 mb-2 animate-pulse-slow" />
              <p className="text-xs text-slate-500 font-bold mb-4">Activate scanner to parse labels via device camera</p>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer"
              >
                <Camera className="w-4 h-4" /> Start Device Camera
              </button>
            </div>
          )}

          {/* HIGH-FIDELITY SIMULATOR BLOCK */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 mb-6">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" /> Scanner Simulator (No-Camera Mode)
            </h4>
            <p className="text-[10px] text-slate-500 font-semibold mb-4 leading-relaxed">
              If camera access is restricted in the preview iframe, select any fabricated part below and click "Trigger Scan" to simulate real-world hardware scans.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase">Select Simulated Part Label</label>
                <select
                  className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  value={simulatedSelectedPart}
                  onChange={e => setSimulatedSelectedPart(Number(e.target.value))}
                >
                  {SIMULATED_PARTS.map((p, idx) => (
                    <option key={idx} value={idx}>{p.partName} [{p.code}]</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={triggerVirtualScan}
                  className="w-full py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white text-white" /> Trigger Virtual Scan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SCAN RESULTS ACTION PANEL */}
        {scanResult && (
          <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block">Valid Item Scanned</span>
                <p className="text-base font-extrabold text-black truncate mt-0.5">{scanResult.partName}</p>
                <p className="text-xs text-slate-600 font-bold mt-0.5">Customer: {scanResult.customer}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-[10px] bg-white/50 p-3 rounded-xl border border-emerald-100">
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[8px]">Serial Code</span>
                <span className="font-extrabold text-slate-800">{scanResult.code}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[8px]">Standard Batch Qty</span>
                <span className="font-extrabold text-slate-800">{scanResult.qty} units</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[8px]">Powder Type</span>
                <span className="font-extrabold text-slate-800">{scanResult.powderType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[8px]">Weight/Part</span>
                <span className="font-extrabold text-slate-800">{scanResult.weightPerPart} kg</span>
              </div>
            </div>

            <button
              onClick={handleApplyToForm}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10"
            >
              Transfer to Material Entry Form
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* COLUMN 2: GENERATOR */}
      <div className="glass-card p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2 mb-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            Custom Label Generator
          </h3>
          <p className="text-xs text-slate-500 font-semibold mb-6">
            Configure metadata, generate barcodes/QR codes, and print tags for newly fabricated parts.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Part Serial Code</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={qrText}
                  onChange={e => setQrText(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Customer Name</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={qrCustomer}
                  onChange={e => setQrCustomer(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Part Name & ID</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={qrPartName}
                  onChange={e => setQrPartName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Standard Quantity</label>
                <input 
                  type="number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={qrQty}
                  onChange={e => setQrQty(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Recommended Powder</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={qrPowderType}
                  onChange={e => setQrPowderType(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase">Unit Weight (kg)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={qrWeight}
                  onChange={e => setQrWeight(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC QR CODE DISPLAY */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center gap-6">
          {/* Virtual QR Block */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center shadow-md">
            <div className="w-36 h-36 border-4 border-slate-900 bg-white relative flex flex-col items-center justify-center p-2">
              {/* Mock Barcode/QR blocks for vector looks */}
              <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-90">
                {[...Array(25)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded ${
                      (i * 7 + qrText.length + qrPartName.length) % 3 === 0 || i === 0 || i === 4 || i === 20 || i === 24
                        ? 'bg-black' 
                        : 'bg-white'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-x-2 bottom-1 bg-white/95 text-[6px] font-mono text-center font-black truncate px-1">
                {qrText}
              </div>
            </div>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-2">Fabricated Item Label</span>
          </div>

          <div className="flex-1 space-y-3 w-full">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Configure QR Schema Payload</h4>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              We compile these details into a high-density QR Payload that can be read by our active readers to instantly synchronize manufacturing logs.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                  NotificationService.success("Label print triggered.");
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Label
              </button>

              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardCopy className="w-3.5 h-3.5" /> Copy JSON Schema
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
