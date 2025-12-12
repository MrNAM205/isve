
import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Activity 
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface DashboardProps {
  onChangeTab: (tab: any) => void;
}

const activityData = [
  { name: 'Mon', packets: 2 },
  { name: 'Tue', packets: 5 },
  { name: 'Wed', packets: 1 },
  { name: 'Thu', packets: 8 },
  { name: 'Fri', packets: 4 },
  { name: 'Sat', packets: 0 },
  { name: 'Sun', packets: 3 },
];

const Dashboard: React.FC<DashboardProps> = ({ onChangeTab }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Deck</h1>
          <p className="text-slate-400">Overview of remedy processes and sovereign status.</p>
        </div>
        <div className="flex gap-3">
           <span className="inline-flex items-center px-3 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-mono">
             <Activity className="w-3 h-3 mr-2" />
             AI AGENTS IDLE
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Remedies</p>
              <h3 className="text-3xl font-bold text-white mt-1">7</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            <span className="text-green-400 font-medium">+2</span> since last week
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Jurisdiction Status</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-1">SECURED</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Last Affidavit filed 12 days ago
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Notices</p>
              <h3 className="text-3xl font-bold text-amber-500 mt-1">3</h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Response required within 72 hours
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 h-[300px] flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 shrink-0">Process Velocity</h3>
          {/* Ensure flex item has min-height to prevent collapse and explicitly set width */}
          <div className="flex-1 w-full" style={{ minHeight: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="packets" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Logs</h3>
          <div className="space-y-4">
            {[
              { label: 'Affidavit of Truth Generated', time: '2h ago', status: 'complete' },
              { label: 'Violation Scan: Chase Bank', time: '5h ago', status: 'warning' },
              { label: 'UCC-1 Draft Pending', time: '1d ago', status: 'pending' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded bg-slate-950/50 border border-slate-800/50">
                <div className="flex items-center gap-3">
                  {item.status === 'complete' && <CheckCircle className="w-4 h4 text-emerald-500" />}
                  {item.status === 'warning' && <AlertTriangle className="w-4 h4 text-amber-500" />}
                  {item.status === 'pending' && <Clock className="w-4 h4 text-blue-500" />}
                  <span className="text-sm text-slate-200">{item.label}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{item.time}</span>
              </div>
            ))}
          </div>
           <button 
            onClick={() => onChangeTab('semantic-scanner')}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded transition-colors"
          >
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
