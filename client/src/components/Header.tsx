import React from 'react';
import { Search, KeyRound, Plus, LogIn, UserPlus, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenJoinPin: () => void;
  onOpenCreate: () => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenJoinPin,
  onOpenCreate,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(15, 17, 26, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      gap: '20px',
    }}>
      {/* Search Bar */}
      <div style={{
        flex: 1,
        maxWidth: '460px',
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
            height: '42px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '0 20px 0 46px',
            color: '#fff',
            fontSize: '13.5px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onOpenJoinPin}
          className="btn-secondary"
          style={{ height: '40px', padding: '0 14px', fontSize: '13px' }}
        >
          <KeyRound size={16} color="#06b6d4" />
          <span>Vào phòng PIN</span>
        </button>

        <button
          onClick={onOpenCreate}
          className="btn-primary"
          style={{ height: '40px', padding: '0 16px', fontSize: '13px' }}
        >
          <Plus size={16} />
          <span>Tạo đề mới</span>
        </button>

        <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Authentication State */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px 4px 6px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentUser.role === 'TEACHER'
                  ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)'
                  : 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
              }}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                  {currentUser.name}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: currentUser.role === 'TEACHER' ? '#38bdf8' : '#34d399',
                  lineHeight: 1.2,
                }}>
                  {currentUser.role === 'TEACHER' ? 'Giáo viên' : 'Học viên'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="btn-secondary"
              style={{
                width: '38px',
                height: '38px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-secondary"
              style={{ height: '38px', padding: '0 14px', fontSize: '13px' }}
            >
              <LogIn size={15} />
              <span>Đăng nhập</span>
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="btn-primary"
              style={{ height: '38px', padding: '0 14px', fontSize: '13px' }}
            >
              <UserPlus size={15} />
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

