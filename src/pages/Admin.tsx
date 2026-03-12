import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  session_type: string;
  daily_notice: string | null;
  started_at: string;
}

export default function Admin() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [notice, setNotice] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSession = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error('Không tải được phiên');
    } else if (data) {
      setSession(data);
      setNotice(data.daily_notice || '');
      setIsVisible(!!data.daily_notice && data.daily_notice.trim().length > 0);
    } else {
      setSession(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    const newNotice = isVisible ? notice.trim() : '';
    const { error } = await supabase
      .from('sessions')
      .update({ daily_notice: newNotice || null })
      .eq('id', session.id);

    if (error) {
      toast.error('Lỗi khi lưu');
    } else {
      toast.success('Đã cập nhật thông báo');
      setSession(prev => prev ? { ...prev, daily_notice: newNotice || null } : null);
    }
    setSaving(false);
  };

  const presets = [
    { label: '🌕 Rằm', text: 'Hôm nay là ngày Rằm — Quán phục vụ thực đơn chay thanh tịnh 🙏' },
    { label: '🌑 Mùng 1', text: 'Hôm nay là ngày Mùng 1 — Thực đơn chay đặc biệt 🌿' },
    { label: '🍜 Món mới', text: 'Hôm nay quán có món đặc biệt: Bún riêu chay 🍜' },
    { label: '🎉 Sự kiện', text: 'Quán có chương trình khuyến mãi đặc biệt hôm nay! 🎉' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-stone-100" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-800">Quản lý thông báo</h1>
            <p className="text-xs text-zinc-400 font-medium">Hiển thị trên phiếu chờ của khách</p>
          </div>
          <button
            onClick={fetchSession}
            className="p-2 rounded-xl bg-white shadow-sm border border-zinc-200 text-zinc-500 hover:text-zinc-700 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        ) : !session ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
            <p className="text-zinc-400 text-sm font-medium">Chưa có phiên hoạt động</p>
            <p className="text-zinc-300 text-xs mt-1">Bắt đầu một phiên để quản lý thông báo</p>
          </div>
        ) : (
          <>
            {/* Session info */}
            <div className="bg-white rounded-2xl border border-zinc-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Phiên đang hoạt động</p>
                <p className="text-sm font-bold text-zinc-700 capitalize">{session.session_type}</p>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang mở
              </span>
            </div>

            {/* Toggle visibility */}
            <div className="bg-white rounded-2xl border border-zinc-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-700">Thông báo ngày</span>
                </div>
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    isVisible
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                  }`}
                >
                  {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {isVisible ? 'Đang hiện' : 'Đang ẩn'}
                </button>
              </div>

              {isVisible && (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={notice}
                    onChange={e => setNotice(e.target.value)}
                    placeholder="Nhập thông báo cho khách..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 resize-none"
                  />

                  {/* Presets */}
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">Mẫu nhanh</p>
                    <div className="flex flex-wrap gap-1.5">
                      {presets.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setNotice(p.text)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/50 text-xs font-semibold text-amber-700 hover:bg-amber-100 active:scale-95 transition-all"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {isVisible && notice.trim() && (
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider px-1">Xem trước trên phiếu</p>
                <div className="bg-fuchsia-900/40 border border-fuchsia-500/20 rounded-xl px-3 py-2">
                  <p className="text-xs font-bold text-fuchsia-300">{notice}</p>
                </div>
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 text-white font-bold text-sm shadow-lg hover:bg-zinc-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
