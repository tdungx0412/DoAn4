import React from 'react';
import { Search, KeyRound, Plus, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenJoinPin: () => void;
  onOpenCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenJoinPin,
  onOpenCreate,
}) => {
  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(15, 17, 26, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      gap: '24px',
    }}>
      {/* Search Bar */}
      <div style={{
        flex: 1,
        maxWidth: '520px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '16px' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm đề thi, môn học, giáo viên hoặc mã đề..."
          style={{
            width: '100%',
            height: '44px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '0 20px 0 46px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.boxShadow = '0 0 12px var(--primary-glow)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenJoinPin}
          className="btn-secondary"
          style={{ height: '42px', padding: '0 16px' }}
        >
          <KeyRound size={16} color="#06b6d4" />
          <span>Vào phòng bằng mã PIN</span>
        </button>

        <button
          onClick={onOpenCreate}
          className="btn-primary"
          style={{ height: '42px', padding: '0 20px' }}
        >
          <Plus size={18} />
          <span>Tạo đề mới</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Live Server</span>
        </div>
      </div>
    </header>
  );
};
