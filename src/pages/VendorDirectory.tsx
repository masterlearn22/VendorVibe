import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Loader2, FileText } from 'lucide-react';

interface VendorData {
  id: string;
  name: string;
  category: string | null;
  risk_status: string;
  is_flagged: boolean;
  proposals: {
    offered_price: number;
    duration_months: number;
    risk_score: number;
  }[];
}

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      const { data, error } = await supabase
        .from('vendors')
        .select('*, proposals(*)');
      
      if (!error && data) {
        setVendors(data);
      }
      setLoading(false);
    }

    fetchVendors();
  }, []);

  const toggleFlag = async (vendorId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('vendors')
      .update({ is_flagged: !currentStatus })
      .eq('id', vendorId);
    
    if (!error) {
      setVendors(vendors.map(v => v.id === vendorId ? { ...v, is_flagged: !currentStatus } : v));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Vendor Directory</h2>
        <p className="text-slate-500 mt-2">Daftar semua vendor yang proposalnya telah dianalisis.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-slate-400" />
            Vendor Database
          </h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center p-20">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Belum ada vendor</h3>
            <p className="text-slate-500 mt-1">Silakan unggah proposal vendor terlebih dahulu di menu Upload Proposal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Nama Vendor</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Penawaran</th>
                  <th className="px-6 py-4 font-medium">Durasi</th>
                  <th className="px-6 py-4 font-medium">Skor Risiko</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => {
                  const p = v.proposals?.[0];
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <span className="font-medium text-slate-800">{v.name}</span>
                      </td>
                      <td className="px-6 py-4 align-top text-slate-600">{v.category || '-'}</td>
                      <td className="px-6 py-4 align-top font-mono text-slate-700">
                        {p?.offered_price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.offered_price) : '-'}
                      </td>
                      <td className="px-6 py-4 align-top text-slate-600">{p?.duration_months || '-'} Bln</td>
                      <td className="px-6 py-4 align-top text-slate-600 font-medium">{p?.risk_score || '-'}</td>
                      <td className="px-6 py-4 align-top">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          v.risk_status === 'Low' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : v.risk_status === 'Medium'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {v.risk_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <button 
                          onClick={() => toggleFlag(v.id, v.is_flagged)}
                          className={`p-2 rounded-full transition-colors ${
                            v.is_flagged ? 'text-[#ff5a36] bg-[#ff5a36]/10' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                          }`}
                          title={v.is_flagged ? "Hapus dari prioritas" : "Tandai sebagai prioritas"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={v.is_flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
