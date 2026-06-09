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
      const { data } = await supabase.from('vendors').select('id, name');
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
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          {!selectedVendorId ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p>Pilih vendor di sebelah kiri untuk melihat catatan.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {notes.map(n => (
                  <div key={n.id} className="bg-slate-50 p-4 rounded-2xl rounded-tl-sm border border-slate-100 max-w-[85%]">
                    <p className="text-slate-700 text-sm">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center text-slate-400 mt-10">Belum ada catatan untuk vendor ini.</div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis catatan..."
                    className="flex-1 border border-slate-200 rounded-full px-5 py-2.5 outline-none focus:border-[#ff5a36] focus:ring-1 focus:ring-[#ff5a36]"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-[#ff5a36] text-white p-2.5 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50">
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
