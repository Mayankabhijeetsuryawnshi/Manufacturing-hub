import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  User, 
  X, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { HubApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { NotificationService } from '../lib/notifications';

interface MaintenanceLog {
  id: number;
  machineName: string;
  maintenanceType: 'Routine' | 'Repair' | 'Breakdown' | 'Calibration';
  description: string;
  performedBy: string | null;
  status: 'Completed' | 'Pending' | 'Scheduled';
  cost: number;
  nextDueDate: string | null;
  createdAt: string;
}

export default function MaintenanceLogs() {
  const { dbUser } = useAuth();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    machineName: '',
    maintenanceType: 'Routine' as MaintenanceLog['maintenanceType'],
    description: '',
    performedBy: '',
    status: 'Pending' as MaintenanceLog['status'],
    cost: 0,
    nextDueDate: ''
  });

  const isAdmin = dbUser?.role === 'Admin';
  const isSupervisor = dbUser?.role === 'Supervisor' || isAdmin;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await HubApi.getMaintenanceLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      machineName: '',
      maintenanceType: 'Routine',
      description: '',
      performedBy: '',
      status: 'Pending',
      cost: 0,
      nextDueDate: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log: MaintenanceLog) => {
    setEditingId(log.id);
    setFormData({
      machineName: log.machineName,
      maintenanceType: log.maintenanceType,
      description: log.description,
      performedBy: log.performedBy || '',
      status: log.status,
      cost: log.cost,
      nextDueDate: log.nextDueDate || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.machineName || !formData.description) {
      NotificationService.error('Machine Name and Description are required.');
      return;
    }

    try {
      const payload = {
        ...formData,
        cost: Number(formData.cost) || 0,
        performedBy: formData.performedBy || null,
        nextDueDate: formData.nextDueDate || null
      };

      if (editingId) {
        await HubApi.updateMaintenanceLog(editingId, payload);
        NotificationService.success('Maintenance log updated.');
      } else {
        await HubApi.createMaintenanceLog(payload);
        NotificationService.success('New maintenance entry logged.');
      }
      setIsModalOpen(false);
      loadLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      await HubApi.deleteMaintenanceLog(id);
      NotificationService.success('Record deleted.');
      loadLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickComplete = async (log: MaintenanceLog) => {
    const costInput = window.prompt('Enter final maintenance cost (₹) if any:', log.cost.toString());
    if (costInput === null) return; // user cancelled

    try {
      await HubApi.updateMaintenanceLog(log.id, {
        status: 'Completed',
        cost: Number(costInput) || 0,
        performedBy: log.performedBy || dbUser?.displayName || 'On-site Operator'
      });
      NotificationService.success('Log marked as COMPLETED.');
      loadLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'All' || log.maintenanceType === filterType;
    const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
    return matchesType && matchesStatus;
  });

  // Calculate metrics
  const activeBreakdowns = logs.filter(l => l.maintenanceType === 'Breakdown' && l.status !== 'Completed').length;
  const totalCost = logs.reduce((acc, l) => acc + (l.cost || 0), 0);
  const pendingCount = logs.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-600 animate-spin-slow" />
            Machine Maintenance Logs
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Track industrial equipment breakdown logs, routine maintenance schedules, calibration, and expenses.
          </p>
        </div>

        {isSupervisor && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Maintenance
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl relative overflow-hidden">
          <div className="absolute right-4 top-4 bg-red-600/10 text-red-600 p-2.5 rounded-2xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-red-600">Active Breakdowns</span>
          <p className="text-3xl font-black text-red-950 mt-1">{activeBreakdowns}</p>
          <div className="text-[10px] text-red-700 font-bold uppercase mt-2">Requires immediate attention</div>
        </div>

        <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-3xl relative overflow-hidden">
          <div className="absolute right-4 top-4 bg-yellow-600/10 text-yellow-700 p-2.5 rounded-2xl">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-yellow-700">Pending Actions</span>
          <p className="text-3xl font-black text-yellow-950 mt-1">{pendingCount}</p>
          <div className="text-[10px] text-yellow-700 font-bold uppercase mt-2">Routine & Repair jobs</div>
        </div>

        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl relative overflow-hidden">
          <div className="absolute right-4 top-4 bg-emerald-600/10 text-emerald-600 p-2.5 rounded-2xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Total spent cost</span>
          <p className="text-3xl font-black text-emerald-950 mt-1">₹{totalCost.toLocaleString()}</p>
          <div className="text-[10px] text-emerald-700 font-bold uppercase mt-2">Historical repair spent</div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="uppercase text-[9px] font-black text-slate-400">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Routine">Routine</option>
              <option value="Repair">Repair</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Calibration">Calibration</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="uppercase text-[9px] font-black text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        <span className="text-[9px] text-slate-400 font-bold uppercase">
          Showing {filteredLogs.length} maintenance entries
        </span>
      </div>

      {/* Grid of logs */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Loading Maintenance Logs...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-bold">No maintenance logs matches standard filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const isCompleted = log.status === 'Completed';
            const isPending = log.status === 'Pending';
            const isBreakdown = log.maintenanceType === 'Breakdown';

            return (
              <div 
                key={log.id}
                className={`p-5 rounded-3xl bg-white border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 ${
                  isCompleted ? 'border-emerald-100 hover:border-emerald-200 bg-emerald-50/5' :
                  isBreakdown ? 'border-red-100 hover:border-red-200 bg-red-50/5 animate-pulse-subtle' :
                  'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Details Section */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-black uppercase tracking-tight text-sm">
                      {log.machineName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      log.maintenanceType === 'Breakdown' ? 'bg-red-100 text-red-800' :
                      log.maintenanceType === 'Calibration' ? 'bg-blue-100 text-blue-800' :
                      log.maintenanceType === 'Routine' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.maintenanceType}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    {log.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> Done By: {log.performedBy || 'Not assigned'}
                    </span>
                    {log.nextDueDate && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" /> Next Calibration: {new Date(log.nextDueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-slate-400 font-mono">
                      Logged: {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Costs & Actions */}
                <div className="flex flex-row md:flex-col items-end gap-3 w-full md:w-auto border-t md:border-0 pt-4 md:pt-0 border-slate-100">
                  <div className="flex-1 md:text-right font-mono text-xs">
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Cost Incurred</span>
                    <span className="text-sm font-black text-slate-800">₹{log.cost.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleQuickComplete(log)}
                        className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Solved
                      </button>
                    )}

                    {isSupervisor && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(log)}
                          className="p-1.5 border border-slate-200 hover:border-slate-400 text-slate-400 hover:text-black rounded-lg transition-all cursor-pointer"
                          title="Edit Log"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                          title="Delete Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance Entry Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-[2rem] bg-white border border-slate-200 p-6 md:p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600" />
                {editingId ? 'Edit Maintenance log' : 'Log Machine Maintenance'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Machine Name / ID *</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="e.g. 7-Tank Pretreatment Bath, Reciprocator Machine"
                  value={formData.machineName}
                  onChange={e => setFormData({...formData, machineName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Maintenance Type *</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all"
                    value={formData.maintenanceType}
                    onChange={e => setFormData({...formData, maintenanceType: e.target.value as MaintenanceLog['maintenanceType']})}
                  >
                    <option value="Routine">Routine Service</option>
                    <option value="Repair">Repair</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Calibration">Calibration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Status *</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as MaintenanceLog['status']})}
                  >
                    <option value="Pending">Pending Solution</option>
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Problem / Action Description *</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="e.g. Conveyor belt alignment shifted. Re-tensioned the driving gears and applied lubrication to rollers."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Done By (Operator)</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="e.g. Siemens Tech"
                    value={formData.performedBy}
                    onChange={e => setFormData({...formData, performedBy: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Cost (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Next Due Date</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={formData.nextDueDate}
                    onChange={e => setFormData({...formData, nextDueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
