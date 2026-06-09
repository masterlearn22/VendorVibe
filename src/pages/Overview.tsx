import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Building2, ShieldAlert, Timer, Users } from 'lucide-react';

export default function Overview() {
  const [stats, setStats] = useState({
    totalVendors: 0,
    avgRiskScore: 0,
    avgDuration: 0,
  });
  const [riskData, setRiskData] = useState<any[]>([]);
  const [priceData, setPriceData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const { data: vendors } = await supabase.from('vendors').select('*, proposals(*)');
      if (!vendors) return;

      let totalVendors = vendors.length;
      let totalRisk = 0;
      let totalDuration = 0;
      let riskCounts = { Low: 0, Medium: 0, High: 0 };
      let prices: any[] = [];

      vendors.forEach(v => {
        if (v.risk_status === 'Low') riskCounts.Low++;
        if (v.risk_status === 'Medium') riskCounts.Medium++;
        if (v.risk_status === 'High') riskCounts.High++;

        const p = v.proposals?.[0];
        if (p) {
          totalRisk += p.risk_score || 0;
          totalDuration += p.duration_months || 0;
          prices.push({
            name: v.name.substring(0, 10) + '...',
            price: p.offered_price
          });
        }
      });

      setStats({
        totalVendors,
        avgRiskScore: totalVendors ? Math.round(totalRisk / totalVendors) : 0,
        avgDuration: totalVendors ? Math.round(totalDuration / totalVendors) : 0,
      });

      setRiskData([
        { name: 'Low Risk', value: riskCounts.Low, color: '#34d399' },
        { name: 'Medium Risk', value: riskCounts.Medium, color: '#fbbf24' },
        { name: 'High Risk', value: riskCounts.High, color: '#f87171' },
      ].filter(d => d.value > 0));

      setPriceData(prices);
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">Overview Dashboard</h2>
        <p className="text-slate-400 mt-2">Ringkasan statistik metrik vendor dan proposal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex items-center">
          <div className="bg-indigo-500/10 p-4 rounded-lg mr-4">
            <Building2 className="h-8 w-8 text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Vendor</p>
            <h3 className="text-2xl font-bold text-slate-50">{stats.totalVendors}</h3>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex items-center">
          <div className="bg-amber-500/10 p-4 rounded-lg mr-4">
            <ShieldAlert className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Rata-rata Skor Risiko</p>
            <h3 className="text-2xl font-bold text-slate-50">{stats.avgRiskScore} <span className="text-sm font-normal text-slate-500">/ 100</span></h3>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex items-center">
          <div className="bg-emerald-500/10 p-4 rounded-lg mr-4">
            <Timer className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Rata-rata Durasi (Bulan)</p>
            <h3 className="text-2xl font-bold text-slate-50">{stats.avgDuration} <span className="text-sm font-normal text-slate-500">Bulan</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-200 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2 text-slate-400" />
            Distribusi Tingkat Risiko
          </h3>
          <div className="h-72">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">Belum ada data risiko</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-200 mb-6">Perbandingan Harga Vendor</h3>
          <div className="h-72">
            {priceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `Rp ${value / 1000000}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    formatter={(value: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value))}
                  />
                  <Bar dataKey="price" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex h-full items-center justify-center text-slate-500">Belum ada data harga</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
