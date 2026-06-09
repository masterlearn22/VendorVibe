import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { analyzeProposalFile } from '../lib/gemini';
import { UploadCloud, FileText, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function UploadProposal() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setStatus('analyzing');
      const parsedData = await analyzeProposalFile(file);

      setStatus('saving');
      
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          name: parsedData.vendor_name,
          category: parsedData.category,
          risk_status: parsedData.risk_status,
        })
        .select()
        .single();

      if (vendorError) throw vendorError;

      const { error: proposalError } = await supabase
        .from('proposals')
        .insert({
          vendor_id: vendorData.id,
          offered_price: parsedData.offered_price,
          duration_months: parsedData.duration_months,
          risk_score: parsedData.risk_score,
          ai_summary: parsedData.ai_summary,
        });

      if (proposalError) throw proposalError;

      setStatus('success');
      setTimeout(() => {
        navigate('/vendors');
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Terjadi kesalahan saat memproses file.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="mb-8 text-center">
        <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Upload Proposal</h2>
        <p className="text-slate-500 mt-2">Unggah file proposal dari vendor untuk dianalisis oleh AI secara otomatis.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Pilih File Proposal</label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              file ? 'border-[#ff5a36] bg-[#ff5a36]/5' : 'border-slate-200 hover:border-[#ff5a36]/50 bg-slate-50'
            }`}>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".txt,.pdf"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <FileText className={`w-12 h-12 mb-3 ${file ? 'text-[#ff5a36]' : 'text-slate-300'}`} />
                {file ? (
                  <span className="text-[#ff5a36] font-medium">{file.name}</span>
                ) : (
                  <span className="text-slate-500">Klik untuk memilih file (.txt, .pdf)</span>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || status === 'analyzing' || status === 'saving' || status === 'success'}
            className="w-full bg-[#ff5a36] hover:bg-[#e04a29] text-white py-3.5 rounded-2xl font-semibold shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 flex justify-center items-center"
          >
            {status === 'analyzing' || status === 'saving' ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <Sparkles className="h-5 w-5 mr-2" />
            )}
            {status === 'idle' && 'Mulai Proses AI'}
            {status === 'analyzing' && 'AI Menganalisis...'}
            {status === 'saving' && 'Menyimpan Database...'}
            {status === 'success' && 'Berhasil! Mengalihkan...'}
            {status === 'error' && 'Coba Lagi'}
          </button>
          
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
