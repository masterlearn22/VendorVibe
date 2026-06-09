import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Loader2 } from 'lucide-react';

interface VendorData {
  id: string;
  name: string;
  category: string;
  risk_status: 'Low' | 'Medium' | 'High';
  created_at: string;
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
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select(`
            id,
            name,
            category,
            risk_status,
            created_at,
            proposals (
              offered_price,
              duration_months,
              risk_score
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVendors(data as unknown as VendorData[]);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, []);

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'High': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-50">Vendor Directory</h2>
          <p className="text-slate-400 mt-2">Daftar semua vendor beserta analisis risiko proposal.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center p-20">
            <FileText className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-200">Belum ada vendor</h3>
            <p className="text-slate-400 mt-1">Silakan unggah proposal vendor terlebih dahulu di menu Upload Proposal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Nama Vendor</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Harga Penawaran</th>
                  <th className="px-6 py-4 font-medium">Durasi (Bulan)</th>
                  <th className="px-6 py-4 font-medium">Skor Risiko</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {vendors.map((vendor) => {
                  const proposal = vendor.proposals?.[0];
                  return (
                    <tr key={vendor.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-50">{vendor.name}</td>
                      <td className="px-6 py-4">{vendor.category || '-'}</td>
                      <td className="px-6 py-4 font-mono">
                        {proposal?.offered_price ? formatPrice(proposal.offered_price) : '-'}
                      </td>
                      <td className="px-6 py-4">{proposal?.duration_months || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono">{proposal?.risk_score || '-'}</span>
                        <span className="text-slate-500 text-xs ml-1">/ 100</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(vendor.risk_status)}`}>
                          {vendor.risk_status}
                        </span>
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
