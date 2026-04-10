
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
  Calendar, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  BarChart3,
  Briefcase
} from 'lucide-react';

const StatisticsSection: React.FC = () => {
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const taskTrendData = [
    { name: 'Sen', tasks: 12 },
    { name: 'Sel', tasks: 19 },
    { name: 'Rab', tasks: 15 },
    { name: 'Kam', tasks: 22 },
    { name: 'Jum', tasks: 30 },
    { name: 'Sab', tasks: 25 },
    { name: 'Min', tasks: 18 },
  ];

  const categoryData = [
    { name: 'Saluran Air', value: 40, color: '#f97316' },
    { name: 'Kebersihan Taman', value: 25, color: '#22c55e' },
    { name: 'Perbaikan Jalan', value: 20, color: '#3b82f6' },
    { name: 'Pohon Tumbang', value: 15, color: '#ef4444' },
  ];

  const rankingData = [
    { name: 'Bambang S.', tasks: 145 },
    { name: 'Agus P.', tasks: 210 },
    { name: 'Siti A.', tasks: 98 },
    { name: 'Rudi H.', tasks: 42 },
    { name: 'Lilis S.', tasks: 77 },
  ].sort((a, b) => b.tasks - a.tasks);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-800">Statistik Tugas</h3>
        <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-100 self-start">
          <button 
            onClick={() => setFilter('daily')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'daily' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Harian
          </button>
          <button 
            onClick={() => setFilter('monthly')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'monthly' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Bulanan
          </button>
          <button 
            onClick={() => setFilter('yearly')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'yearly' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-100 text-white relative overflow-hidden group">
          <Briefcase className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          <p className="text-orange-100 text-sm font-medium mb-1">Total Tugas</p>
          <h3 className="text-4xl font-bold mb-4">1,284</h3>
          <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg">
            <TrendingUp size={16} />
            <span>+12% dari periode lalu</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Tugas Sedang Berjalan</p>
            <h3 className="text-3xl font-bold text-slate-800">42</h3>
            <p className="text-blue-600 text-xs font-bold mt-2">Dalam Proses</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Clock size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Tugas Selesai</p>
            <h3 className="text-3xl font-bold text-slate-800">1,242</h3>
            <p className="text-green-600 text-xs font-bold mt-2">Diselesaikan</p>
          </div>
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
               <TrendingUp size={18} className="text-orange-500" />
               Statistik Keseluruhan Penugasan
            </h4>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskTrendData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Filter size={18} className="text-blue-500" />
             Statistik Kategori Tugas Terbanyak
          </h4>
          <div className="h-72 flex flex-col sm:flex-row items-center">
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-3">
              {categoryData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 - Ranking */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
           <BarChart3 size={18} className="text-green-500" />
           Statistik Anggota PPSU Paling Banyak Bertugas
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankingData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fontWeight: 600, fill: '#1e293b'}}
                width={100}
              />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar 
                dataKey="tasks" 
                fill="#f97316" 
                radius={[0, 10, 10, 0]} 
                barSize={32}
              >
                 {rankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : index === 1 ? '#3b82f6' : '#94a3b8'} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
