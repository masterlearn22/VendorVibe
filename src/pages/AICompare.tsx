import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { compareVendorsAI } from '../lib/gemini';
import { Sparkles, Loader2, CheckSquare, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownComponents: any = {
  p: ({node, ...props}: any) => <p className="mb-4 text-justify leading-relaxed" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3" {...props} />,
  h4: ({node, ...props}: any) => <h4 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />,
  strong: ({node, ...props}: any) => <strong className="font-bold text-slate-900" {...props} />,
  table: ({node, ...props}: any) => <div className="overflow-x-auto mb-6"><table className="w-full text-left border-collapse text-sm" {...props} /></div>,
  th: ({node, ...props}: any) => <th className="bg-[#ff5a36]/5 text-[#ff5a36] font-semibold p-3 border-b border-[#ff5a36]/20 whitespace-nowrap" {...props} />,
  td: ({node, ...props}: any) => <td className="p-3 border-b border-slate-100 text-slate-700 whitespace-nowrap" {...props} />,
  ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
  ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
  li: ({node, ...props}: any) => <li className="text-slate-700 text-justify" {...props} />,
};

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
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">AI Compare</h2>
        <p className="text-slate-500 mt-2">Pilih 2 hingga 3 vendor untuk dibandingkan dan dapatkan rekomendasi terbaik dari Gemini AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm h-fit">
          <h3 className="font-semibold text-slate-800 mb-6">Pilih Vendor (Max 3)</h3>
          <div className="space-y-3 mb-8 max-h-96 overflow-y-auto pr-2">
            {vendors.map(v => (
              <div 
                key={v.id} 
                onClick={() => toggleSelection(v.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start ${selectedIds.has(v.id) ? 'bg-[#ff5a36]/5 border-[#ff5a36]/30 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
              >
                {selectedIds.has(v.id) ? (
                  <CheckSquare className="h-5 w-5 text-[#ff5a36] mt-0.5 mr-3 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-slate-300 mt-0.5 mr-3 shrink-0" />
                )}
                <div>
                  <p className={`font-semibold text-sm ${selectedIds.has(v.id) ? 'text-slate-800' : 'text-slate-600'}`}>{v.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Skor Risiko: {v.proposals?.[0]?.risk_score || '-'}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleCompare}
            disabled={selectedIds.size < 2 || loading}
            className="w-full bg-[#ff5a36] hover:bg-[#e04a29] text-white py-3.5 rounded-2xl font-semibold shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 flex justify-center items-center"
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
                  <div key={v.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden flex flex-col">
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${v.risk_status === 'Low' ? 'bg-[#facc15]' : v.risk_status === 'Medium' ? 'bg-[#fb923c]' : 'bg-[#f97316]'}`} />
                    <h4 className="text-xl font-bold text-slate-800 mb-6">{v.name}</h4>
                    
                    <div className="space-y-6 text-sm flex-1">
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Harga Penawaran</p>
                        <p className="font-mono text-xl font-bold text-slate-800">{p?.offered_price ? formatPrice(p.offered_price) : '-'}</p>
                      </div>
                      <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                        <div>
                          <p className="text-slate-500 mb-1 font-medium">Durasi</p>
                          <p className="font-semibold text-slate-800">{p?.duration_months || '-'} Bulan</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 mb-1 font-medium">Skor Risiko</p>
                          <p className="font-semibold text-slate-800">{p?.risk_score || '-'} / 100</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-2 font-medium">AI Summary</p>
                        <div className="text-slate-600 text-sm">
                          {p?.ai_summary ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                              {p.ai_summary}
                            </ReactMarkdown>
                          ) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {recommendation && (
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-[0.03] pointer-events-none">
                <Sparkles className="h-48 w-48 text-[#ff5a36]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <div className="bg-[#ff5a36] text-white p-2 rounded-xl mr-3 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                Rekomendasi Final AI
              </h3>
              <div className="text-slate-700 pl-2 lg:pl-12 text-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {recommendation}
                </ReactMarkdown>
              </div>
            </div>
          )}
          
          {!recommendation && selectedVendorsList.length === 0 && (
             <div className="bg-white/50 border border-slate-200/50 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
               <div className="bg-slate-100 p-6 rounded-full mb-6">
                 <Sparkles className="h-12 w-12 text-slate-300" />
               </div>
               <p className="text-slate-500 text-lg">Pilih vendor di samping untuk mulai membandingkan performa mereka.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
