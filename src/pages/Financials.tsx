import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Loader2, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Financials() {
  const [data, setData] = useState<any>({ total: 0, average: 0, highest: 0, lowest: 0, chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancials() {
      const { data: proposals } = await supabase
        .from('proposals')
        .select('offered_price, vendor:vendors(name)')
        .order('offered_price', { ascending: false });

      if (proposals && proposals.length > 0) {
        const prices = proposals.map(p => p.offered_price);
        const total = prices.reduce((a, b) => a + b, 0);
        const average = total / prices.length;
        const highest = Math.max(...prices);
        const lowest = Math.min(...prices);

        const chartData = proposals.map(p => {
          const vendorObj: any = p.vendor;
          const vName = Array.isArray(vendorObj) ? vendorObj[0]?.name : vendorObj?.name;
          return {
            name: vName ? vName.substring(0, 15) + '...' : 'Unknown',
            price: p.offered_price
          };
        }).slice(0, 10); // Top 10

        setData({ total, average, highest, lowest, chartData });
      }
      setLoading(false);
    }
    fetchFinancials();
  }, []);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center">
          <DollarSign className="mr-3 w-8 h-8 text-emerald-500" />
          Budget & Financials
        </h2>
        <p className="text-slate-500 mt-2">Analisis biaya dan agregasi penawaran harga dari semua vendor.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#ff5a36] w-8 h-8" /></div>
      ) : data.total === 0 ? (
        <div className="text-center p-20 text-slate-500 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <DollarSign className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p>Belum ada data keuangan yang bisa dianalisis.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Total Penawaran Masuk</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatIDR(data.total)}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Rata-rata Harga</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatIDR(data.average)}</h3>
            </div>
            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-rose-600 text-sm mb-1">Penawaran Tertinggi</p>
                  <h3 className="text-xl font-bold text-rose-700">{formatIDR(data.highest)}</h3>
                </div>
                <TrendingUp className="text-rose-400 w-5 h-5" />
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Penawaran Terendah</p>
                  <h3 className="text-xl font-bold text-emerald-700">{formatIDR(data.lowest)}</h3>
                </div>
                <TrendingDown className="text-emerald-400 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-[#ff5a36]" />
              Top 10 Penawaran Tertinggi
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `Rp ${val / 1000000}M`} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => formatIDR(val as number)}
                  />
                  <Bar dataKey="price" fill="#ff5a36" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
