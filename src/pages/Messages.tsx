import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send } from 'lucide-react';

export default function Messages() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [notes, setNotes] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    async function fetchVendors() {
      const { data } = await supabase.from('vendors').select('id, name, risk_status').in('risk_status', ['Low', 'Medium']);
      if (data) setVendors(data);
    }
    fetchVendors();
  }, []);

  useEffect(() => {
    if (!selectedVendorId) return;
    async function fetchNotes() {
      const { data } = await supabase
        .from('vendor_notes')
        .select('*')
        .eq('vendor_id', selectedVendorId)
        .order('created_at', { ascending: true });
      if (data) setNotes(data);
    }
    fetchNotes();
  }, [selectedVendorId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedVendorId) return;

    const { data, error } = await supabase
      .from('vendor_notes')
      .insert([{ vendor_id: selectedVendorId, message: newMessage }])
      .select();

    if (!error && data) {
      setNotes([...notes, data[0]]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center">
          <MessageSquare className="mr-3 w-8 h-8 text-[#ff5a36]" />
          Team Notes
        </h2>
        <p className="text-slate-500 mt-2">Diskusikan evaluasi vendor bersama tim Anda.</p>
      </div>

      <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Vendor List */}
        <div className="w-full md:w-1/3 border-r border-slate-100 bg-slate-50/50 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Pilih Vendor</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {vendors.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVendorId(v.id)}
                className={`w-full text-left p-3 rounded-xl mb-1 transition-colors ${
                  selectedVendorId === v.id ? 'bg-white shadow-sm border border-slate-100 text-[#ff5a36] font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {v.name}
              </button>
            ))}
            {vendors.length === 0 && <p className="text-slate-400 p-4 text-center text-sm">Belum ada vendor</p>}
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div className="w-full md:w-2/3 flex flex-col bg-[#efeae2] relative">
          {/* Subtle chat background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {!selectedVendorId ? (
            <div className="flex-1 flex items-center justify-center relative z-10">
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm text-slate-500 text-sm">
                Pilih vendor di sebelah kiri untuk melihat obrolan.
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 flex flex-col">
                {notes.map((n) => {
                  const time = new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={n.id} className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-[#d9fdd3] p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] relative min-w-[120px]">
                        <p className="text-[#111b21] text-[15px] leading-relaxed pb-3">{n.message}</p>
                        <span className="text-[11px] text-emerald-700/80 absolute bottom-1.5 right-3 font-medium">{time}</span>
                      </div>
                    </div>
                  );
                })}
                {notes.length === 0 && (
                  <div className="flex justify-center mt-10">
                    <div className="bg-[#fcebb6] px-4 py-2 rounded-xl shadow-sm text-slate-700 text-sm text-center">
                      🔒 Pesan ini terenkripsi secara end-to-end.<br/>Mulai diskusikan evaluasi vendor ini!
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#f0f2f5] relative z-10 flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-white border-none rounded-2xl px-5 py-3.5 outline-none focus:ring-0 resize-none h-[52px] max-h-[150px] shadow-sm text-[15px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as any);
                    }
                  }}
                />
                <button 
                  onClick={handleSend} 
                  disabled={!newMessage.trim()} 
                  className="bg-[#00a884] text-white p-3 h-[52px] w-[52px] rounded-full hover:bg-[#008f6f] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
