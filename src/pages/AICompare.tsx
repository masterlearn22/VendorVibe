import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { compareVendorsAI } from '../lib/gemini';
import { Sparkles, Loader2, CheckSquare, Square } from 'lucide-react';

interface VendorData {
  id: string;
  name: string;
  risk_status: string;
  proposals: {
    offered_price: number;
    duration_months: number;
    risk_score: number;
    ai_summary: string;
  }[];
}

export default function AICompare() {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVendors() {
      const { data } = await supabase
        .from('vendors')
        .select('*, proposals(*)');
      if (data) setVendors(data);
    }
    fetchVendors();
  }, []);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (newSet.size < 3) {
        newSet.add(id);
      }
    }
    setSelectedIds(newSet);
  };

  const handleCompare = async () => {
    if (selectedIds.size < 2) return;
    setLoading(true);
    setRecommendation(null);
    
    try {
      const selectedVendors = vendors.filter(v => selectedIds.has(v.id));
      const formattedData = selectedVendors.map(v => ({
        name: v.name,
        price: v.proposals?.[0]?.offered_price,
        duration: v.proposals?.[0]?.duration_months,
        risk_score: v.proposals?.[0]?.risk_score,
        risk_status: v.risk_status,
        summary: v.proposals?.[0]?.ai_summary,
      }));

      const result = await compareVendorsAI(JSON.stringify(formattedData, null, 2));
      setRecommendation(result);
    } catch (err) {
      console.error(err);
      setRecommendation("Gagal mendapatkan rekomendasi AI. Pastikan API key valid.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const selectedVendorsList = vendors.filter(v => selectedIds.has(v.id));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">AI Compare</h2>
        <p className="text-slate-400 mt-2">Pilih 2 hingga 3 vendor untuk dibandingkan dan dapatkan rekomendasi terbaik dari Gemini AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm h-fit">
          <h3 className="font-medium text-slate-200 mb-4">Pilih Vendor (Max 3)</h3>
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
            {vendors.map(v => (
              <div 
                key={v.id} 
                onClick={() => toggleSelection(v.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start ${selectedIds.has(v.id) ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
              >
                {selectedIds.has(v.id) ? (
                  <CheckSquare className="h-5 w-5 text-indigo-400 mt-0.5 mr-3 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-slate-600 mt-0.5 mr-3 shrink-0" />
                )}
                <div>
                  <p className={`font-medium text-sm ${selectedIds.has(v.id) ? 'text-indigo-200' : 'text-slate-300'}`}>{v.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Skor Risiko: {v.proposals?.[0]?.risk_score || '-'}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleCompare}
            disabled={selectedIds.size < 2 || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Sparkles className="h-4 w-4 mr-2" /> Bandingkan via AI</>}
          </button>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {selectedVendorsList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedVendorsList.map(v => {
                const p = v.proposals?.[0];
                return (
                  <div key={v.id} className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${v.risk_status === 'Low' ? 'bg-emerald-400' : v.risk_status === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                    <h4 className="text-lg font-bold text-slate-50 mb-4">{v.name}</h4>
                    
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-slate-400 mb-1">Harga Penawaran</p>
                        <p className="font-mono text-lg font-semibold text-slate-200">{p?.offered_price ? formatPrice(p.offered_price) : '-'}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-slate-400 mb-1">Durasi</p>
                          <p className="font-medium text-slate-200">{p?.duration_months || '-'} Bulan</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Skor Risiko</p>
                          <p className="font-medium text-slate-200">{p?.risk_score || '-'} / 100</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-1">AI Summary</p>
                        <p className="text-slate-300 leading-relaxed text-xs">{p?.ai_summary || '-'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {recommendation && (
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10 pointer-events-none">
                <Sparkles className="h-32 w-32 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-indigo-400" />
                Rekomendasi Final AI
              </h3>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {recommendation}
              </div>
            </div>
          )}
          
          {!recommendation && selectedVendorsList.length === 0 && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
               <Sparkles className="h-12 w-12 text-slate-600 mb-4" />
               <p className="text-slate-400">Pilih vendor di samping untuk mulai membandingkan performa mereka.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
