import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flag, Loader2 } from 'lucide-react';

export default function Priority() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlagged() {
      const { data } = await supabase
        .from('vendors')
        .select('*, proposals(*)')
        .eq('is_flagged', true);
      if (data) setVendors(data);
      setLoading(false);
    }
    fetchFlagged();
  }, []);

  const removeFlag = async (id: string) => {
    await supabase.from('vendors').update({ is_flagged: false }).eq('id', id);
    setVendors(vendors.filter(v => v.id !== id));
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center">
          <Flag className="mr-3 w-8 h-8 text-[#ff5a36]" />
          Priority Vendors
        </h2>
        <p className="text-slate-500 mt-2">Daftar vendor yang telah Anda tandai sebagai prioritas atau pantauan khusus.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#ff5a36] w-8 h-8" /></div>
        ) : vendors.length === 0 ? (
          <div className="text-center p-20 text-slate-500">
            <Flag className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p>Belum ada vendor yang ditandai.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Status Risiko</th>
                <th className="px-6 py-4 font-medium">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map(v => (
                <tr key={v.id}>
                  <td className="px-6 py-4 font-medium text-slate-800">{v.name}</td>
                  <td className="px-6 py-4 text-slate-600">{v.category || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${v.risk_status === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : v.risk_status === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                      {v.risk_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => removeFlag(v.id)} className="text-rose-500 hover:text-rose-700 text-sm font-medium">Hapus Prioritas</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
