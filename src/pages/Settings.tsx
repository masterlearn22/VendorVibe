import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('app_settings').select('*');
      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.setting_key] = item.setting_value;
        });
        setSettings(settingsMap);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from('app_settings')
        .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });
    }

    setSaving(false);
    setMessage('Pengaturan berhasil disimpan!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center">
          <SettingsIcon className="mr-3 w-8 h-8 text-slate-600" />
          Settings
        </h2>
        <p className="text-slate-500 mt-2">Kelola preferensi dan batasan aplikasi VendorVibe Anda.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#ff5a36] w-8 h-8" /></div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8">
          <div className="space-y-8">
            
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Pengaturan Kuota</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Maksimal Proposal per Bulan</label>
                  <p className="text-xs text-slate-500 mb-2">Batasi jumlah unggahan proposal untuk menghemat kuota Storage Supabase dan limit API Gemini.</p>
                  <input 
                    type="number" 
                    value={settings['proposal_limit_per_month'] || ''}
                    onChange={(e) => handleChange('proposal_limit_per_month', e.target.value)}
                    className="w-full md:w-1/2 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-[#ff5a36] focus:ring-1 focus:ring-[#ff5a36]"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Preferensi Tampilan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tema Aplikasi (Segera Hadir)</label>
                  <select disabled className="w-full md:w-1/2 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 text-slate-400 cursor-not-allowed">
                    <option>Light Theme (Aktif)</option>
                    <option>Dark Theme</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-[#ff5a36] text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-600 transition-colors flex items-center disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Pengaturan
              </button>
              {message && <span className="text-emerald-600 font-medium text-sm">{message}</span>}
            </div>

          </div>
        </form>
      )}
    </div>
  );
}
