/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BarChart3, 
  ClipboardCheck, 
  Package, 
  Factory, 
  LayoutDashboard, 
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Activity,
  RotateCcw,
  Settings,
  Link2,
  CheckCircle2,
  RefreshCw,
  Users,
  X,
  MessageCircle,
  Clock,
  Trash2,
  Download,
  ShieldAlert,
  UserCheck,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, Component, ReactNode } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  Navigate
} from 'react-router-dom';
import { HubApi } from './api';
import { HubLogo } from './components/Logo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CONFIG } from './config';
import { TelegramBotService, TelegramUser } from './lib/telegram-service';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationService, Toast } from './lib/notifications';

import ProductionLog from './components/ProductionLog';
import PowderStock from './components/PowderStock';
import DailyChecking from './components/DailyChecking';
import DailyProductionReport from './components/DailyProductionReport';
import ProductionScheduling from './components/ProductionScheduling';
import MaintenanceLogs from './components/MaintenanceLogs';
import QRScanner from './components/QRScanner';

// --- Types ---
interface NavItem {
  name: string;
  path: string;
  icon: any;
  color: string;
}

// --- Components ---

const Sidebar = ({ isOpen, setToggle }: { isOpen: boolean, setToggle: (val: boolean) => void }) => {
  const location = useLocation();
  const { dbUser, logOut } = useAuth();
  
  const navItems: NavItem[] = [
    { name: 'Hub', path: '/', icon: LayoutDashboard, color: 'text-sky-400' },
    { name: 'Material Movement', path: '/production', icon: Factory, color: 'text-emerald-400' },
    { name: 'Scheduling', path: '/scheduling', icon: Clock, color: 'text-blue-400' },
    { name: 'Stock', path: '/powder', icon: Package, color: 'text-orange-400' },
    { name: 'Checking', path: '/checking', icon: ClipboardCheck, color: 'text-emerald-500' },
    { name: 'Maintenance', path: '/maintenance', icon: Settings, color: 'text-amber-500' },
    { name: 'QR Scan', path: '/scanner', icon: QrCode, color: 'text-indigo-400' },
    { name: 'Reports', path: '/reports', icon: BarChart3, color: 'text-blue-400' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 glass-card h-[calc(100vh-2rem)] fixed left-4 top-4 p-5 flex-col z-50 justify-between">
        <div>
          <div className="mb-6">
            <HubLogo className="h-14" />
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-black uppercase tracking-wider">Active Session</span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate" title={dbUser?.email}>
              {dbUser?.displayName || dbUser?.email.split('@')[0]}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 rounded">
              {dbUser?.role || 'Worker'}
            </span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group border border-transparent ${
                    isActive 
                      ? 'bg-white border-slate-100 text-black shadow-sm' 
                      : 'text-slate-600 hover:bg-white/40 hover:text-black'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : item.color.replace('400', '600').replace('500', '600')}`} />
                  <span className="text-sm font-bold">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-black">Live Inventory</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
              PostgreSQL depletion engine tracks stocks in real-time.
            </p>
          </div>

          <button
            onClick={logOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-bold text-sm border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-3 flex justify-between items-center z-[100] pb-safe shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${isActive ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-tight">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={logOut}
          className="flex flex-col items-center gap-0.5 text-red-500 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Out</span>
        </button>
      </div>
    </>
  );
};

const Hub = () => {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState({ 
    production: 0, 
    powder: 0, 
    quality: 98.4,
    forecasting: [] as any[],
    recentLogs: [] as any[]
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecasting' | 'users' | 'audits'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [telegramUsers, setTelegramUsers] = useState<TelegramUser[]>([]);
  const [newUser, setNewUser] = useState({ firstName: '', username: '', userId: '' });
  const [showUserModal, setShowUserModal] = useState(false);

  const isAdmin = dbUser?.role === 'Admin';
  const isSupervisor = dbUser?.role === 'Supervisor' || isAdmin;

  const loadTelegramData = () => {
    const defaultUsers = [
      { id: '5659382825', name: 'User 1' },
      { id: '7829696196', name: 'User 2' },
      { id: '8703631446', name: 'User 3 (New)' }
    ];

    defaultUsers.forEach(u => {
      if (!TelegramBotService.isUserRegistered(u.id)) {
        TelegramBotService.registerUser({
          userId: u.id,
          firstName: u.name,
        });
      }
    });
    setTelegramUsers(TelegramBotService.getAllUsers());
  };

  const addTelegramUser = async () => {
    if (newUser.firstName.trim() && newUser.userId.trim()) {
      const user = TelegramBotService.registerUser({
        userId: newUser.userId,
        firstName: newUser.firstName,
        username: newUser.username || undefined,
      });
      loadTelegramData();
      
      // Sync added user asynchronously with Google Sheets
      HubApi.syncTelegramUserWithGoogleSheets(newUser.userId, newUser.firstName, 'ADD').catch(err => {
        console.error("Failed to sync added user with Sheets:", err);
      });

      setNewUser({ firstName: '', username: '', userId: '' });
      setShowUserModal(false);
      alert(`✅ User "${user.firstName}" LINKED.\n\nThey will now receive factory alerts on Chat ID: ${user.userId}`);
    } else {
      alert("⚠️ Please enter both Name and Chat ID");
    }
  };

  const removeTelegramUser = async (userId: string) => {
    if (window.confirm('Remove this user from alerts?')) {
      const userObj = TelegramBotService.getUser(userId);
      const userDisplayName = userObj ? TelegramBotService.formatUserName(userObj) : 'User';
      
      TelegramBotService.removeUser(userId);
      loadTelegramData();

      // Sync removed user asynchronously with Google Sheets
      HubApi.syncTelegramUserWithGoogleSheets(userId, userDisplayName, 'REMOVE').catch(err => {
        console.error("Failed to sync removed user with Sheets:", err);
      });
    }
  };

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const data = await HubApi.getStats();
      if (data && data.status === 'success') {
        setStats({
          production: data.production,
          powder: data.powder,
          quality: data.quality,
          forecasting: data.forecasting || [],
          recentLogs: data.recentLogs || []
        });
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const list = await HubApi.getAllUsers();
      setUsersList(list);
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  };

  const fetchAuditLogs = async () => {
    if (!isSupervisor) return;
    try {
      const list = await HubApi.getAuditLogs();
      setAuditLogsList(list);
    } catch (e) {
      console.error("Failed to load audits:", e);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    const res = await HubApi.updateUserRole(userId, newRole);
    if (res) {
      alert("✅ Role updated successfully!");
      fetchUsers();
    } else {
      alert("❌ Failed to update role");
    }
  };

  const handleExportForecastingPdf = () => {
    const doc = new jsPDF();
    doc.setFillColor(249, 115, 22); // Orange theme
    doc.rect(0, 0, 210, 42, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("INVENTORY FORECASTING & DEPLETION REPORT", 14, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(241, 245, 249);
    doc.text(`Generated: ${new Date().toLocaleString()} | Operator: ${dbUser?.displayName || dbUser?.email}`, 14, 28);
    doc.text("Engine Type: Live 30-Day Predictive Consumption Engine", 14, 34);

    const body = stats.forecasting.map((item: any) => [
      item.powderType,
      `${item.currentStockKg} kg`,
      `${item.minThreshold} kg`,
      `${item.avgDailyUsageKg} kg/day`,
      item.daysRemaining !== null ? `${item.daysRemaining} days` : '∞',
      item.status
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Powder Type", "Current Stock", "Min Threshold", "Avg Daily Usage", "Est. Days Remaining", "Alert Status"]],
      body: body.length > 0 ? body : [["N/A", "-", "-", "-", "-", "No metrics"]],
      headStyles: { fillColor: [249, 115, 22] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Replenishment Action Trigger Notes:", 14, finalY);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("1. Immediate purchase requisitions should be issued for any powder stock flagged with 'Critical' status.", 14, finalY + 6);
    doc.text("2. Purchase lead times of 3 to 5 business days must be accounted for items under 'Warning' status.", 14, finalY + 12);

    doc.save(`Inventory_Depletion_Forecast_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportAuditTrailPdf = () => {
    const doc = new jsPDF();
    doc.setFillColor(220, 38, 38); // Red theme
    doc.rect(0, 0, 210, 42, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("MANUFACTURING HUB AUDIT TRAIL REPORT", 14, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(254, 226, 226);
    doc.text(`Exported At: ${new Date().toLocaleString()} | Security Officer: ${dbUser?.displayName || dbUser?.email}`, 14, 28);
    doc.text("Compliance Standard: ISO 9001 Operation Log Trail", 14, 34);

    const body = auditLogsList.map((log: any) => [
      new Date(log.createdAt).toLocaleString(),
      log.userEmail,
      log.action,
      log.entity,
      log.details
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Timestamp", "Operator Email", "Action", "Target Entity", "Operation Details"]],
      body: body.length > 0 ? body : [["N/A", "-", "-", "-", "-"]],
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });

    doc.save(`Security_Audit_Trail_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchStats();
    loadTelegramData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'audits') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">Welcome, {dbUser?.displayName || 'Hub'}</h2>
          <p className="text-slate-600 mt-2 text-base md:text-lg font-medium tracking-tight">
            Full-Stack control deck for PostgreSQL & Firebase Manufacturing Suite.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStats}
            disabled={refreshing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 ${refreshing ? 'opacity-50' : ''}`}
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Dashboard'}
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Overview
        </button>
        {isSupervisor && (
          <button
            onClick={() => setActiveTab('forecasting')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'forecasting' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            Inventory Forecasting
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            User Management
          </button>
        )}
        {isSupervisor && (
          <button
            onClick={() => setActiveTab('audits')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'audits' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            Audit Logs
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <StatCard 
                title="Today's Production" 
                value={loading ? '...' : (stats.production || 0).toLocaleString()} 
                trend="Live"
                icon={Factory} 
                color="emerald" 
              />
              <StatCard 
                title="Powder Inventory" 
                value={loading ? '...' : `${stats.powder || 0}kg`} 
                trend="Real-time"
                icon={Package} 
                color="blue" 
              />
              <StatCard 
                title="Quality Score" 
                value={loading ? '...' : `${(stats.quality || 0).toFixed(1)}%`} 
                trend="Active"
                icon={ClipboardCheck} 
                color="orange" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Navigation Cards */}
              <div className="glass-card p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Quick Navigation
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <QuickActionLink to="/production" label="Material Movement" desc="Submit inward challans" />
                  <QuickActionLink to="/powder" label="Update Stock" desc="Current inventory check" />
                  <QuickActionLink to="/checking" label="Daily Quality" desc="Chemical parameters" />
                  <QuickActionLink to="/reports" label="View Reports" desc="Analytics dashboard" />
                </div>
              </div>

              {/* Recent Logs Panel */}
              <div className="glass-card p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Live Actions
                </h3>
                {stats.recentLogs && stats.recentLogs.length > 0 ? (
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {stats.recentLogs.map((log: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{log.customer}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Part: {log.partName} • Qty: {log.qty}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Challan {log.challanNo}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-8 text-center">No material movement logs yet.</p>
                )}
              </div>
            </div>

            {/* Telegram Alert Manager */}
            <div className="glass-card p-6 md:p-8 rounded-[2rem] border-sky-100 bg-sky-50/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-sky-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black tracking-tight">Telegram Alert Subscriptions</h3>
                  <p className="text-[10px] text-sky-600 font-black uppercase tracking-widest mt-1">Real-time notification engine</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/80 rounded-2xl border border-sky-100 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-600 font-semibold leading-relaxed mb-4">
                    1. Message <span className="text-sky-600 font-black">@{CONFIG.BOT_USERNAME}</span> on Telegram.<br/>
                    2. Send <code className="bg-slate-100 px-1 py-0.5 rounded text-black font-mono">/id</code> to find your Chat ID.<br/>
                    3. Click <span className="font-bold">Add User</span> below to link the user.
                  </div>
                  <button 
                    onClick={() => {
                      if (!CONFIG.GOOGLE_SHEET_URL) {
                        alert("⚠️ Please configure VITE_GOOGLE_SHEET_URL in your environment first.");
                        return;
                      }
                      window.open(`${CONFIG.GOOGLE_SHEET_URL}?action=setWebhook`, '_blank');
                    }}
                    className="w-full py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <Link2 className="w-3 h-3" />
                    Force Webhook Link
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-sky-100 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1">
                      Registered Alert Receivers ({telegramUsers.length})
                    </h4>
                    <button 
                      onClick={() => setShowUserModal(true)}
                      className="text-[9px] font-black text-sky-600 hover:text-sky-700 uppercase px-2 py-1 rounded-lg hover:bg-sky-50 border border-sky-100 transition-all"
                    >
                      + Add
                    </button>
                  </div>

                  {telegramUsers.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">No users registered yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {telegramUsers.map(user => (
                        <div key={user.userId} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-black truncate">{TelegramBotService.formatUserName(user)}</p>
                          </div>
                          <button 
                            onClick={() => removeTelegramUser(user.userId)}
                            className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: INVENTORY FORECASTING */}
        {activeTab === 'forecasting' && isSupervisor && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-xl font-bold text-black">Inventory Depletion Forecasting</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Estimated depletion based on past 30 days usage</p>
                </div>
              </div>
              <button
                onClick={handleExportForecastingPdf}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer shadow-lg shadow-orange-500/10"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-black">Powder Type</th>
                    <th className="p-4 font-black text-right">Current Stock (kg)</th>
                    <th className="p-4 font-black text-right">Min Threshold</th>
                    <th className="p-4 font-black text-right">Avg Daily Usage</th>
                    <th className="p-4 font-black text-right">Days Remaining</th>
                    <th className="p-4 font-black text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.forecasting && stats.forecasting.length > 0 ? (
                    stats.forecasting.map((item: any, idx: number) => {
                      const isCritical = item.status.includes('Critical');
                      const isWarning = item.status.includes('Warning');
                      const isLow = item.status.includes('Low');
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors font-semibold">
                          <td className="p-4 text-black font-bold">{item.powderType}</td>
                          <td className="p-4 text-right font-mono">{item.currentStockKg} kg</td>
                          <td className="p-4 text-right text-slate-400 font-mono">{item.minThreshold} kg</td>
                          <td className="p-4 text-right text-slate-600 font-mono">{item.avgDailyUsageKg} kg/day</td>
                          <td className="p-4 text-right font-mono">
                            {item.daysRemaining !== null ? `${item.daysRemaining} days` : '∞'}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isCritical ? 'bg-red-100 text-red-800' : 
                              isWarning ? 'bg-yellow-100 text-yellow-800' :
                              isLow ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">No forecasting metrics available. Add some Material logs first.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === 'users' && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-black">User Account & Role Controls</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Configure access privileges (Worker, Supervisor, Admin)</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-black">User Email</th>
                    <th className="p-4 font-black">Display Name</th>
                    <th className="p-4 font-black">Joined Date</th>
                    <th className="p-4 font-black">Role Privilege</th>
                    <th className="p-4 font-black text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {usersList.length > 0 ? (
                    usersList.map((user: any) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-blue-600">{user.email}</td>
                        <td className="p-4 text-black font-bold">{user.displayName || 'Unnamed User'}</td>
                        <td className="p-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                            user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'Supervisor' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 px-3 py-1 outline-none"
                          >
                            <option value="Worker">Worker</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">No registered users in relational database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audits' && isSupervisor && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-xl font-bold text-black">System Audit Trail</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Chronological record of manufacturing database operations</p>
                </div>
              </div>
              <button
                onClick={handleExportAuditTrailPdf}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer shadow-lg shadow-red-500/10"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-black">Timestamp</th>
                    <th className="p-4 font-black">Operator</th>
                    <th className="p-4 font-black">Action</th>
                    <th className="p-4 font-black">Target Entity</th>
                    <th className="p-4 font-black">Operation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditLogsList.length > 0 ? (
                    auditLogsList.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors font-semibold">
                        <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-slate-800 font-bold max-w-[120px] truncate" title={log.userEmail}>
                          {log.userEmail}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[9px] font-black rounded uppercase">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono">{log.entity}</td>
                        <td className="p-4 text-black max-w-[300px] truncate" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">No system audit records logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telegram User Link Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-card rounded-[2rem] bg-white border border-slate-200 p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-black mb-4">Add Telegram Alert Receiver</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Telegram Chat ID</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="e.g., 1675082413"
                  value={newUser.userId}
                  onChange={e => setNewUser({...newUser, userId: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">User Full Name</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl font-bold text-black focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="e.g., Sadikh"
                  value={newUser.firstName}
                  onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                  onKeyPress={e => e.key === 'Enter' && addTelegramUser()}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 h-11 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={addTelegramUser}
                  className="flex-1 h-11 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Register Receiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => {
  const getContainerClass = (c: string) => {
    switch (c) {
      case 'emerald': return 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-500/5';
      case 'blue': return 'bg-blue-50 border-blue-100 shadow-sm shadow-blue-500/5';
      case 'orange': return 'bg-orange-50 border-orange-100 shadow-sm shadow-orange-500/5';
      default: return 'bg-white border-slate-100';
    }
  };

  const getIconClass = (c: string) => {
    switch (c) {
      case 'emerald': return 'bg-emerald-600 text-white';
      case 'blue': return 'bg-blue-600 text-white';
      case 'orange': return 'bg-orange-600 text-white';
      default: return 'bg-slate-900 text-white';
    }
  };

  const isPositive = trend && trend.toString().startsWith('+');
  const isNegative = trend && trend.toString().startsWith('-');
  const isSpecial = trend && (trend === 'Live' || trend === 'Real-time' || trend === 'Active');

  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.01 }}
      className={`glass-card p-8 rounded-[2.5rem] border ${getContainerClass(color)} relative overflow-hidden group transition-all duration-300 bg-white`}
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-2xl ${getIconClass(color)} shadow-lg shadow-${color}-500/20`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
            isPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 
            isNegative ? 'text-orange-700 bg-orange-50 border border-orange-200' : 
            isSpecial ? 'text-blue-700 bg-blue-50 border border-blue-200 animate-pulse' :
            'text-slate-500 bg-slate-50 border border-slate-200'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-2 relative z-10">{title}</h4>
      <p className="text-4xl font-bold text-black relative z-10 tracking-tight leading-none">{value}</p>
      <div className="w-full h-1.5 bg-slate-200/50 rounded-full mt-6 overflow-hidden relative z-10">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'}`} 
          style={{ width: '85%' }} 
        />
      </div>
    </motion.div>
  );
};

const QuickActionLink = ({ to, label, desc }: any) => (
  <Link 
    to={to} 
    className="p-5 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300 block group"
  >
    <span className="block font-bold text-black group-hover:text-blue-600 transition-colors text-sm uppercase tracking-tight">{label}</span>
    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{desc}</span>
  </Link>
);

// --- Login Page ---

const SignInPage = () => {
  const { signIn, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="mesh-gradient-blobs absolute inset-0 pointer-events-none">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-8 md:p-10 rounded-[3rem] border border-slate-200 bg-white shadow-2xl relative z-10 text-center"
      >
        <div className="mb-8 flex justify-center">
          <HubLogo className="h-16" />
        </div>

        <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">Unified Manufacturing Hub</h2>
        <p className="text-slate-600 text-sm mb-8 font-medium">
          Robust full-stack enterprise portal powered by high-concurrency PostgreSQL and real-time JWT auth.
        </p>

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-slate-900/15 hover:shadow-slate-950/25 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          {loading ? 'Connecting...' : 'Sign In with Google'}
        </button>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            First user in database or configured mail acquires Admin role.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught render error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-slate-800">
          <div className="glass-card p-8 rounded-[2rem] max-w-md w-full text-center bg-white border border-slate-200">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium bg-slate-100 p-3 rounded-xl overflow-auto max-h-32 text-left font-mono">
              {this.state.error?.message || "Unknown error"}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Securing Session...</span>
        </div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return <SignInPage />;
  }

  return (
    <div className="flex min-h-screen font-sans text-slate-900 bg-[#f8fafc] relative overflow-hidden pb-16 md:pb-0">
      {/* Mesh Gradient Backgrounds */}
      <div className="mesh-gradient-blobs fixed inset-0 pointer-events-none">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>
        <div className="blob-4"></div>
      </div>

      <Sidebar isOpen={isSidebarOpen} setToggle={setSidebarOpen} />
      
      <main className="flex-1 md:ml-64 w-full relative z-10 transition-all duration-300">
        <div className="h-full rounded-[2.5rem] p-4 md:p-8 pb-32 md:pb-8">
          <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl shadow-slate-200/40 group">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 leading-none mb-0.5">
                Active Cluster
              </span>
              <span className="text-[8px] text-slate-400 font-medium">
                PostgreSQL + JWT Secure
              </span>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Routes>
                <Route path="/" element={<Hub />} />
                <Route path="/production" element={<ProductionLog />} />
                <Route path="/scheduling" element={<ProductionScheduling />} />
                <Route path="/powder" element={<PowderStock />} />
                <Route path="/checking" element={<DailyChecking />} />
                <Route path="/maintenance" element={<MaintenanceLogs />} />
                <Route path="/scanner" element={<QRScanner />} />
                <Route path="/reports" element={<DailyProductionReport />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return NotificationService.subscribe((currentToasts) => {
      setToasts(currentToasts);
    });
  }, []);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[300] space-y-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 bg-white text-slate-800 ${
              toast.type === 'success' ? 'border-emerald-100 bg-emerald-50/95 text-emerald-900' :
              toast.type === 'error' ? 'border-red-100 bg-red-50/95 text-red-900' :
              toast.type === 'warning' ? 'border-orange-100 bg-orange-50/95 text-orange-900' :
              'border-blue-100 bg-blue-50/95 text-blue-900'
            }`}
          >
            <div className="flex-1 text-xs font-bold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => NotificationService.dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    console.log(`🚀 ${CONFIG.APP_NAME} Full-Stack Initialized`);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
          <ToastContainer />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
