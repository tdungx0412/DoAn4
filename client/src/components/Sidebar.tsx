import React from 'react';
import { Compass, PlusCircle, KeyRound, BookOpen, Award, Sparkles, HelpCircle } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenJoinPin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenJoinPin }) => {
  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Wayground
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Khảo thí đa môn
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <button
          onClick={() => onSelectTab('explore')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            color: currentTab === 'explore' ? '#fff' : 'var(--text-muted)',
            background: currentTab === 'explore' ? 'var(--primary)' : 'transparent',
            boxShadow: currentTab === 'explore' ? '0 2px 10px var(--primary-glow)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Compass size={18} />
          <span>Khám phá đề thi</span>
        </button>

        <button
          onClick={onOpenJoinPin}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            color: '#06b6d4',
            background: 'rgba(6, 182, 212, 0.08)',
            marginTop: '4px',
            transition: 'all 0.2s',
          }}
        >
          <KeyRound size={18} />
          <span>Nhập mã phòng PIN</span>
        </button>

        <button
          onClick={() => onSelectTab('create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            color: currentTab === 'create' ? '#fff' : 'var(--text-muted)',
            background: currentTab === 'create' ? 'var(--primary)' : 'transparent',
            boxShadow: currentTab === 'create' ? '0 2px 10px var(--primary-glow)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <PlusCircle size={18} />
          <span>Tạo & Đẩy đề mới</span>
        </button>

        <div style={{ margin: '16px 8px 8px', height: '1px', background: 'var(--border-subtle)' }} />
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '0 8px', letterSpacing: '0.8px' }}>
          Cá nhân & Thống kê
        </div>

        <button
          onClick={() => onSelectTab('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            color: currentTab === 'history' ? '#fff' : 'var(--text-muted)',
            background: currentTab === 'history' ? 'var(--primary)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <Award size={18} />
          <span>Lịch sử thi của tôi</span>
        </button>

        <button
          onClick={() => onSelectTab('guide')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            color: currentTab === 'guide' ? '#fff' : 'var(--text-muted)',
            background: currentTab === 'guide' ? 'var(--primary)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <HelpCircle size={18} />
          <span>Hướng dẫn & Cú pháp</span>
        </button>
      </div>

      {/* Footer Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
          alt="Avatar"
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255, 255, 255, 0.1)' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Thí sinh tự do
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Học viên • Đồ án 4
          </div>
        </div>
      </div>
    </aside>
  );
};
