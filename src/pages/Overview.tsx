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
import { Building2, Eye, CircleDollarSign } from 'lucide-react';

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
            name: v.name.substring(0, 8) + '...',
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
        { name: 'Low Risk', value: riskCounts.Low, color: '#facc15' }, // Yellow
        { name: 'Medium Risk', value: riskCounts.Medium, color: '#fb923c' }, // Light Orange
        { name: 'High Risk', value: riskCounts.High, color: '#f97316' }, // Dark Orange
      ].filter(d => d.value > 0));

      setPriceData(prices);
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-400">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <p className="text-slate-500 font-medium">Avg Duration</p>
          </div>
          <div>
            <h3 className="text-4xl font-semibold text-slate-800">{stats.avgDuration} <span className="text-lg font-normal text-slate-400">Mo</span></h3>
            <div className="mt-4 flex items-center text-sm">
              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">▲ 8%</span>
              <span className="text-slate-400 ml-2">VS Last Week</span>
            </div>
          </div>
        </div>

        <div className="bg-[#ff5a36] rounded-[2rem] p-8 shadow-lg shadow-orange-500/30 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-2xl text-white">
              <Eye className="w-5 h-5" />
            </div>
            <p className="text-white/90 font-medium">Avg Risk Score</p>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-semibold">{stats.avgRiskScore}</h3>
            <div className="mt-4 flex items-center text-sm">
              <span className="bg-black/20 text-white px-2 py-0.5 rounded-full font-medium">▼ 1.8%</span>
              <span className="text-white/70 ml-2">VS Last Week</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-400">
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-slate-500 font-medium">Total Vendors</p>
          </div>
          <div>
            <h3 className="text-4xl font-semibold text-slate-800">{stats.totalVendors}</h3>
            <div className="mt-4 flex items-center text-sm">
              <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-medium">▼ 1.2%</span>
              <span className="text-slate-400 ml-2">VS Last Week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-slate-800">Proposal analytics</h3>
            <div className="bg-slate-50 rounded-full p-1 flex text-sm">
              <button className="px-4 py-1.5 rounded-full bg-white shadow-sm font-medium text-slate-700">Monthly</button>
              <button className="px-4 py-1.5 rounded-full text-slate-500 font-medium hover:text-slate-700">Weekly</button>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-slate-500 mb-1">Avg Offered Price</p>
            <h4 className="text-3xl font-semibold text-slate-800">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(priceData.reduce((acc, curr) => acc + curr.price, 0) / (priceData.length || 1))}
            </h4>
          </div>

          <div className="h-64">
            {priceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))}
                  />
                  <Bar dataKey="price" fill="#ff5a36" radius={[6, 6, 6, 6]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex h-full items-center justify-center text-slate-400">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-slate-800">Risk target</h3>
            <div className="bg-slate-50 rounded-full p-1 flex text-sm">
              <button className="px-4 py-1.5 rounded-full text-slate-500 font-medium hover:text-slate-700">Monthly</button>
              <button className="px-4 py-1.5 rounded-full bg-white shadow-sm font-medium text-slate-700">Yearly</button>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#facc15]"></div>
              <span className="text-slate-600">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f97316]"></div>
              <span className="text-slate-600">High Risk</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={110}
                    outerRadius={150}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400">No data available</div>
            )}
            
            {/* Center Text for Half Pie */}
            {riskData.length > 0 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <h2 className="text-5xl font-bold text-slate-800">{riskData.find(d => d.name === 'Low Risk')?.value || 0}</h2>
                <p className="text-slate-500 mt-1">Safe Vendors</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
