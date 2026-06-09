import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2, CheckCircle2, History } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Alerts() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  async function fetchProposals() {
    setLoading(true);
    const { data } = await supabase
      .from('proposals')
      .select('*, vendor:vendors(name, category, risk_status)')
      .order('uploaded_at', { ascending: false });
    
    if (data) setProposals(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleAcknowledge = async (id: string) => {
    const { error } = await supabase
      .from('proposals')
      .update({ is_acknowledged: true })
      .eq('id', id);
    
    if (!error) {
      setProposals(proposals.map(p => p.id === id ? { ...p, is_acknowledged: true } : p));
    }
  };

  const activeAlerts = proposals.filter(p => !p.is_acknowledged && p.risk_score >= 70);
  const archivedAlerts = proposals.filter(p => p.is_acknowledged);

  const riskData = [
    { name: 'Low Risk', value: proposals.filter(p => p.risk_score < 40).length, color: '#10b981' },
    { name: 'Medium Risk', value: proposals.filter(p => p.risk_score >= 40 && p.risk_score < 70).length, color: '#f59e0b' },
    { name: 'High Risk', value: proposals.filter(p => p.risk_score >= 70).length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const avgRiskScore = proposals.length > 0 ? Math.round(proposals.reduce((a, b) => a + b.risk_score, 0) / proposals.length) : 0;

  const renderAlertCard = (a: any, isArchived: boolean) => (
    <div key={a.id} className={`${isArchived ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/30 border-rose-100'} border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-bold text-slate-800 text-lg">{a.vendor?.name}</h3>
          <span className={`${isArchived ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-700'} text-xs px-2 py-1 rounded-md font-bold`}>Risk Score: {a.risk_score}</span>
        </div>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-3">{a.ai_summary}</p>
        <a href={a.file_url} target="_blank" rel="noreferrer" className={`${isArchived ? 'text-slate-500' : 'text-rose-600'} font-medium text-sm hover:underline`}>Lihat Proposal Asli &rarr;</a>
      </div>
      <div className="flex flex-col items-end gap-3 min-w-[200px]">
        <div className="bg-white p-4 rounded-xl border border-slate-100 w-full">
          <p className="text-xs text-slate-400 mb-1">Harga Penawaran</p>
          <p className="font-bold text-slate-800 text-lg">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(a.offered_price)}</p>
          <p className="text-xs text-slate-400 mt-3 mb-1">Durasi</p>
          <p className="font-medium text-slate-700">{a.duration_months} Bulan</p>
        </div>
        {!isArchived && (
          <button 
            onClick={() => handleAcknowledge(a.id)}
            className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl flex items-center justify-center font-medium transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Tandai Selesai
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center">
          <AlertCircle className="mr-3 w-8 h-8 text-rose-500" />
          Risk Alerts & Analysis
        </h2>
        <p className="text-slate-500 mt-2">Peta persebaran risiko proposal dan peringatan bahaya (*red flags*).</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#ff5a36] w-8 h-8" /></div>
      ) : (
        <>
          {/* Visualisasi Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center">
              <div className="w-1/2 h-48">
                {proposals.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="middle" layout="vertical" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">Belum ada data</div>
                )}
              </div>
              <div className="w-1/2 pl-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Distribusi Risiko</h3>
                <p className="text-slate-500 text-sm">Grafik ini menunjukkan porsi tingkat risiko dari seluruh proposal yang masuk.</p>
              </div>
            </div>
            
            <div className="bg-[#ff5a36] text-white rounded-[2rem] p-6 shadow-sm shadow-orange-500/20 flex flex-col justify-center">
              <p className="text-white/80 font-medium mb-2">Rata-rata Skor Risiko Keseluruhan</p>
              <h3 className="text-6xl font-bold">{avgRiskScore}</h3>
              <p className="text-white/80 mt-4 text-sm">*Skor di atas 70 memerlukan perhatian khusus.</p>
            </div>
          </div>

          {/* Tabs Navigasi */}
          <div className="flex gap-4 mb-6 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'active' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <AlertCircle className="w-4 h-4" /> Peringatan Aktif ({activeAlerts.length})
            </button>
            <button 
              onClick={() => setActiveTab('archived')}
              className={`pb-4 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'archived' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <History className="w-4 h-4" /> Riwayat Terselesaikan ({archivedAlerts.length})
            </button>
          </div>

          {/* Daftar Peringatan */}
          <div className="space-y-4">
            {activeTab === 'active' ? (
              activeAlerts.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-20 text-center text-slate-500 shadow-sm">
                  <AlertCircle className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                  <p>Tidak ada proposal berisiko tinggi saat ini. Semuanya aman!</p>
                </div>
              ) : (
                activeAlerts.map(a => renderAlertCard(a, false))
              )
            ) : (
              archivedAlerts.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-20 text-center text-slate-500 shadow-sm">
                  <History className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                  <p>Belum ada riwayat peringatan yang ditandai selesai.</p>
                </div>
              ) : (
                archivedAlerts.map(a => renderAlertCard(a, true))
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
