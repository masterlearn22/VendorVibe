import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      const { data } = await supabase
        .from('proposals')
        .select('*, vendor:vendors(name, category)')
        .or('risk_status.eq.High,risk_score.gte.70')
        .order('created_at', { ascending: false });
      
      if (data) setAlerts(data);
      setLoading(false);
    }
    fetchAlerts();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center">
          <AlertCircle className="mr-3 w-8 h-8 text-rose-500" />
          Risk Alerts
        </h2>
        <p className="text-slate-500 mt-2">Daftar proposal dengan skor risiko tinggi yang perlu diwaspadai.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#ff5a36] w-8 h-8" /></div>
        ) : alerts.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-20 text-center text-slate-500 shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p>Tidak ada proposal berisiko tinggi saat ini. Semuanya aman!</p>
          </div>
        ) : (
          alerts.map(a => (
            <div key={a.id} className="bg-rose-50/30 border border-rose-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{a.vendor?.name}</h3>
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-md font-bold">Risk Score: {a.risk_score}</span>
                </div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">{a.ai_summary}</p>
                <a href={a.file_url} target="_blank" rel="noreferrer" className="text-rose-600 font-medium text-sm hover:underline">Lihat Proposal Asli &rarr;</a>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-50 min-w-[200px]">
                <p className="text-xs text-slate-400 mb-1">Harga Penawaran</p>
                <p className="font-bold text-slate-800 text-lg">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(a.offered_price)}</p>
                <p className="text-xs text-slate-400 mt-3 mb-1">Durasi</p>
                <p className="font-medium text-slate-700">{a.duration_months} Bulan</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
