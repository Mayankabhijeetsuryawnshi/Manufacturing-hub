/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ClipboardCheck, ShieldAlert, Sparkles, AlertCircle, Camera, Upload, Trash2, Image } from 'lucide-react';
import { HubApi } from '../api';

const PARAMETERS = [
  { id: 1, name: 'Degreasing', range: '60–72 ml', min: 60, unit: 'ml' },
  { id: 2, name: 'Water Rinse 1 PH', range: '7–10', min: 7, unit: 'PH' },
  { id: 3, name: 'Water Rinse 2 PH', range: '7–10', min: 7, unit: 'PH' },
  { id: 4, name: 'Activation PH', range: '7–10', min: 7, unit: 'PH' },
  { id: 5, name: 'Activation', range: '6–9 ml', min: 6, unit: 'ml' },
  { id: 6, name: 'Phosphating', range: '24–28 ml', min: 24, unit: 'ml' },
  { id: 7, name: 'Gas Point', range: '2–4 ml', min: 2, unit: 'ml' },
  { id: 8, name: 'Free Acid', range: '1–2 ml', min: 1, unit: 'ml' },
  { id: 9, name: 'Water Rinse', range: '7–10', min: 7, unit: 'PH' },
  { id: 10, name: 'Passivation', range: '4–5', min: 4, unit: 'PH' },
  { id: 11, name: 'Passivation (ml)', range: '4–6 ml', min: 4, unit: 'ml' }
];

const CHEMICAL_ADDITIONS = [
  { id: 1, name: '1100 P' },
  { id: 2, name: '2104' },
  { id: 3, name: '1213' },
  { id: 4, name: '2103' },
  { id: 5, name: '3202' },
  { id: 6, name: '2804' },
  { id: 7, name: 'R 5000' }
];

export default function DailyChecking() {
  const [checks, setChecks] = useState<Record<number, number | string>>(
    Object.fromEntries(PARAMETERS.map(p => [p.id, '']))
  );
  const [additions, setAdditions] = useState<Record<number, string>>(
    Object.fromEntries(CHEMICAL_ADDITIONS.map(c => [c.id, '']))
  );
  const [status, setStatus] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startWebcam = async () => {
    setCameraActive(true);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.getElementById('qc-video') as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        alert("Could not access webcam. Please upload an image file instead.");
        setCameraActive(false);
      }
    }, 100);
  };

  const captureSnapshot = () => {
    const video = document.getElementById('qc-video') as HTMLVideoElement;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoBase64(dataUrl);
        
        // Stop stream tracks
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        setCameraActive(false);
      }
    }
  };

  const cancelWebcam = () => {
    const video = document.getElementById('qc-video') as HTMLVideoElement;
    if (video) {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    }
    setCameraActive(false);
  };

  const belowMinCount = PARAMETERS.filter(p => {
    const val = Number(checks[p.id]);
    return checks[p.id] !== '' && !isNaN(val) && val < p.min;
  }).length;

  const handleSave = async () => {
    const lowParams = PARAMETERS
      .filter(p => {
        const val = Number(checks[p.id]);
        return checks[p.id] !== '' && !isNaN(val) && val < p.min;
      })
      .map(p => ({ 
        name: p.name, 
        value: checks[p.id], 
        min: p.min,
        unit: p.unit
      }));

    setStatus('Submitting...');
    try {
      const formattedChecks = PARAMETERS.map(p => ({
        label: p.name,
        value: checks[p.id] === '' ? 'Not Entered' : checks[p.id]
      }));

      const formattedAdditions = CHEMICAL_ADDITIONS.map(c => ({
        label: c.name,
        value: additions[c.id] || "No addition"
      }));

      await HubApi.save({
        type: 'dailyChecking',
        timestamp: new Date().toISOString(),
        checks: formattedChecks,
        additions: formattedAdditions,
        lowParams,
        totalChecked: PARAMETERS.filter(p => checks[p.id] !== '').length,
        isQualityOk: lowParams.length === 0,
        photoBase64
      });
      setStatus('Report Submitted!');
      setPhotoBase64(null);
    } catch (e: any) {
      console.error("Save failed:", e);
      const msg = e.message || 'Check Connection';
      setStatus('Error: ' + msg);
      alert('Error: ' + msg);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 md:mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <ClipboardCheck className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight">Quality Log</h2>
            <p className="text-slate-600 text-xs md:text-sm font-semibold tracking-tight">Parameter monitoring.</p>
          </div>
        </div>

        <div className={`w-full md:w-auto p-4 md:p-5 rounded-2xl flex items-center gap-4 md:gap-5 border transition-all duration-700 ${belowMinCount > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {belowMinCount > 0 ? <ShieldAlert className="w-6 h-6 md:w-7 md:h-7" /> : <Sparkles className="w-6 h-6 md:w-7 md:h-7" />}
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Safety Status</p>
            <p className="text-base md:text-xl font-black tracking-tight">{belowMinCount} Parameters Below Min</p>
          </div>
        </div>
      </div>

      {/* Bath Parameters Table */}
      <div className="glass-card rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-slate-100 shadow-sm mb-8">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-12 bg-slate-50 p-4 md:p-5 border-b border-slate-100 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5 px-6">Process Parameter</div>
              <div className="col-span-3 text-center">Target Range</div>
              <div className="col-span-3 text-center">Actual Value</div>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden bg-white">
          {PARAMETERS.map((p) => {
            const val = Number(checks[p.id]);
            const isLow = checks[p.id] !== '' && !isNaN(val) && val < p.min;
            return (
              <div key={p.id} className={`grid grid-cols-12 p-5 items-center transition-colors hover:bg-slate-50/50 group`}>
                <div className="col-span-1 text-center text-xs font-bold text-slate-400 group-hover:text-black">0{p.id}</div>
                <div className="col-span-5 px-6">
                  <p className="text-sm font-bold text-black group-hover:text-black transition-colors">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.unit}</p>
                </div>
                <div className="col-span-3 text-center">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-black uppercase tracking-wider underline underline-offset-2 decoration-slate-300">{p.range}</span>
                </div>
                <div className="col-span-3 flex justify-center relative">
                  <input 
                    type="number" 
                    className={`w-32 text-center font-black text-lg py-2 ${isLow ? 'text-orange-700 border-orange-200 bg-orange-50' : 'text-black border-slate-200 focus:border-blue-300 bg-white'}`}
                    placeholder="--"
                    value={checks[p.id]}
                    onChange={(e) => setChecks({...checks, [p.id]: e.target.value})}
                  />
                  {isLow && (
                    <div className="absolute right-[-32px] top-1/2 -translate-y-1/2">
                       <AlertCircle className="w-5 h-5 text-orange-600 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>

      {/* Chemical Additions Table */}
      <div className="glass-card rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-slate-100 shadow-sm">
        <div className="bg-slate-50 p-4 md:p-6 border-b border-slate-100">
          <h3 className="font-black text-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            Chemical Additions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
          {CHEMICAL_ADDITIONS.map((c) => (
            <div key={c.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b border-slate-50">
              <div>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sr. {c.id}</p>
                <p className="text-xs md:text-sm font-bold text-black">{c.name}</p>
              </div>
              <input 
                type="text" 
                className="w-24 md:w-32 text-center font-black text-xs md:text-sm py-2 border-slate-200 bg-white rounded-lg"
                placeholder="Qty..."
                value={additions[c.id]}
                onChange={(e) => setAdditions({...additions, [c.id]: e.target.value})}
              />
            </div>
          ))}
        </div>
        
        {/* Photo Attachment / Live Webcam Capture for QC */}
        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 space-y-4">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-500" />
            Photo Attachment for Quality Control
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Upload visual evidence of pretreatment bath condition or test coupon results. Recommended for audit compliance.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left side: Upload / Capture Actions */}
            <div className="space-y-3 w-full md:w-auto">
              {cameraActive ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black max-w-sm w-full aspect-video flex flex-col justify-between">
                  <video id="qc-video" className="w-full h-full object-cover"></video>
                  <div className="absolute bottom-3 inset-x-3 flex gap-2">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={cancelWebcam}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" /> Take Snapshot
                  </button>

                  <label className="px-4 py-2.5 border border-slate-200 hover:border-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 bg-white transition-all flex items-center gap-2 cursor-pointer justify-center">
                    <Upload className="w-4 h-4 text-blue-500" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Right side: Attachment Preview */}
            {photoBase64 && (
              <div className="flex items-center gap-4 bg-white p-3 border border-slate-200 rounded-2xl animate-fade-in max-w-sm w-full">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                  <img src={photoBase64} alt="QC attachment preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">Attachment Ready</span>
                  <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">QC-Evidence-Base64.jpg</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoBase64(null)}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                  title="Remove Attachment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-100">
           <div className="text-[10px] md:text-xs text-slate-500 max-w-sm font-bold leading-relaxed italic text-center md:text-left">
             Ensure calibration before readings.
           </div>
           <button 
            onClick={handleSave}
            className="w-full md:w-auto px-8 md:px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest text-[10px]"
           >
             Submit Log
           </button>
        </div>
      </div>
      {status && <p className="text-center mt-4 text-emerald-700 font-bold tracking-widest text-xs uppercase">{status}</p>}
    </div>
  );
}
