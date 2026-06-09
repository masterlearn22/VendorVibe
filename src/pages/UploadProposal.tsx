import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { analyzeProposalFile } from '../lib/gemini';
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadProposal() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setStatus('analyzing');
      setErrorMessage('');
      
      // 1. Analyze with Gemini
      const extractedData = await analyzeProposalFile(file);
      
      setStatus('saving');

      // 2. Insert into Vendors table
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert([{
          name: extractedData.vendor_name,
          category: extractedData.category,
          risk_status: extractedData.risk_status
        }])
        .select()
        .single();

      if (vendorError) throw vendorError;

      // 3. Insert into Proposals table
      const { error: proposalError } = await supabase
        .from('proposals')
        .insert([{
          vendor_id: vendorData.id,
          file_url: file.name, // In a real app, upload file to Storage and save URL
          offered_price: extractedData.offered_price,
          duration_months: extractedData.duration_months,
          ai_summary: extractedData.ai_summary,
          risk_score: extractedData.risk_score
        }]);

      if (proposalError) throw proposalError;

      setStatus('success');
      setTimeout(() => {
        navigate('/vendors');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses proposal.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50">Upload Proposal</h2>
        <p className="text-slate-400 mt-2">Unggah dokumen proposal PDF vendor untuk diekstraksi otomatis menggunakan AI.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
        <div 
          className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer relative"
        >
          <input 
            type="file" 
            accept="application/pdf, text/plain" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={status === 'analyzing' || status === 'saving'}
          />
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-200 font-medium mb-1">
            {file ? file.name : "Klik atau seret file ke area ini"}
          </p>
          <p className="text-slate-500 text-sm">Mendukung PDF dan TXT (Maks. 10MB)</p>
        </div>

        {status === 'error' && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start text-rose-400">
            <AlertCircle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || status === 'analyzing' || status === 'saving' || status === 'success'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            {status === 'analyzing' && <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> AI Menganalisis...</>}
            {status === 'saving' && <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Menyimpan Database...</>}
            {status === 'success' && <><CheckCircle2 className="-ml-1 mr-2 h-4 w-4 text-emerald-400" /> Berhasil!</>}
            {status === 'idle' && 'Mulai Proses AI'}
            {status === 'error' && 'Coba Lagi'}
          </button>
        </div>
      </div>
    </div>
  );
}
