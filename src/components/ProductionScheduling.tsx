import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Check, 
  X, 
  Filter,
  Users
} from 'lucide-react';
import { HubApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { NotificationService } from '../lib/notifications';

interface Schedule {
  id: number;
  customer: string;
  partName: string;
  qty: number;
  targetDate: string;
  assignedTo: string | null;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export default function ProductionScheduling() {
  const { dbUser } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  
  // Create / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customer: '',
    partName: '',
    qty: 100,
    targetDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    status: 'Scheduled' as Schedule['status']
  });

  const isAdmin = dbUser?.role === 'Admin';
  const isSupervisor = dbUser?.role === 'Supervisor' || isAdmin;

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await HubApi.getProductionSchedules();
      setSchedules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      customer: '',
      partName: '',
      qty: 100,
      targetDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
      status: 'Scheduled'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormData({
      customer: schedule.customer,
      partName: schedule.partName,
      qty: schedule.qty,
      targetDate: schedule.targetDate,
      assignedTo: schedule.assignedTo || '',
      status: schedule.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer || !formData.partName || formData.qty <= 0 || !formData.targetDate) {
      NotificationService.error('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await HubApi.updateProductionSchedule(editingId, {
          ...formData,
          assignedTo: formData.assignedTo || null
        });
        NotificationService.success('Production schedule updated successfully.');
      } else {
        await HubApi.createProductionSchedule({
          ...formData,
          assignedTo: formData.assignedTo || null
        });
        NotificationService.success('New production schedule created.');
      }
      setIsModalOpen(false);
      loadSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this scheduled production run?')) return;
    try {
      await HubApi.deleteProductionSchedule(id);
      NotificationService.success('Schedule deleted.');
      loadSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusChange = async (schedule: Schedule, newStatus: Schedule['status']) => {
    try {
      await HubApi.updateProductionSchedule(schedule.id, { status: newStatus });
      NotificationService.success(`Status updated to ${newStatus}`);
      loadSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSchedules = filter === 'All' 
    ? schedules 
    : schedules.filter(s => s.status === filter);

  return (
    <div className="space-y-6">
      {/* Upper Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Production Scheduling
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Plan, delegate, and track fabrication batch schedules in real-time.
          </p>
        </div>

        {isSupervisor && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Status:
        </span>
        {['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === status 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Grid of Schedules */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Loading Schedules...</span>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-bold">No schedules found matching "{filter}".</p>
          {isSupervisor && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider bg-blue-50 rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
            >
              Schedule First Batch
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => {
            const isCompleted = schedule.status === 'Completed';
            const isInProgress = schedule.status === 'In Progress';
            const isCancelled = schedule.status === 'Cancelled';

            return (
              <div 
                key={schedule.id}
                className={`glass-card p-6 rounded-3xl bg-white border transition-all duration-300 relative group flex flex-col justify-between ${
                  isCompleted ? 'border-emerald-100 bg-emerald-50/5' :
                  isInProgress ? 'border-blue-100 bg-blue-50/5' :
                  isCancelled ? 'border-slate-100 bg-slate-50/5 opacity-75' :
                  'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Target Date
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {new Date(schedule.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isInProgress ? 'bg-blue-100 text-blue-800' :
                      isCancelled ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>

                  {/* Customer / Part Details */}
                  <div className="mb-4">
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest text-[9px]">Customer</h4>
                    <p className="text-base font-extrabold text-black truncate mt-0.5">{schedule.customer}</p>
                    
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest text-[9px] mt-3">Part Details</h4>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{schedule.partName}</p>
                    
                    <div className="flex items-center justify-between mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Target Quantity</span>
                      <span className="font-extrabold text-slate-800">{schedule.qty.toLocaleString()} units</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-4 border-t border-slate-100/80">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> Operator Assigned:
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {schedule.assignedTo || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Status progress actions */}
                    {schedule.status === 'Scheduled' && (
                      <button
                        onClick={() => handleQuickStatusChange(schedule, 'In Progress')}
                        className="flex-1 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        Start Batch
                      </button>
                    )}

                    {schedule.status === 'In Progress' && (
                      <button
                        onClick={() => handleQuickStatusChange(schedule, 'Completed')}
                        className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    )}

                    {/* Supervisor edit actions */}
                    {isSupervisor && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(schedule)}
                          className="p-2 border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-black rounded-xl transition-all cursor-pointer"
                          title="Edit Schedule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                          title="Delete Schedule"
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

      {/* Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-[2rem] bg-white border border-slate-200 p-6 md:p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingId ? 'Edit Scheduled Run' : 'Schedule Production Run'}
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
                <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Customer Name *</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Caterpillar India"
                  value={formData.customer}
                  onChange={e => setFormData({...formData, customer: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Part Name & Code *</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Engine Bracket EB-401"
                  value={formData.partName}
                  onChange={e => setFormData({...formData, partName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Target Quantity *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.qty}
                    onChange={e => setFormData({...formData, qty: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Target Finish Date *</label>
                  <input 
                    type="date"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.targetDate}
                    onChange={e => setFormData({...formData, targetDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Assigned Operator</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.assignedTo}
                    onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase">Initial Status</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as Schedule['status']})}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
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
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Schedule Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
