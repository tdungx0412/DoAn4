import React from 'react';
import { Compass, PlusCircle, KeyRound, BookOpen, Award, GraduationCap, HelpCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenJoinPin: () => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenJoinPin,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <GraduationCap size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
            Wayground
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Khảo thí & Luyện thi
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
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: currentUser.role === 'TEACHER'
                ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)'
                : 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '11px', color: currentUser.role === 'TEACHER' ? '#38bdf8' : '#34d399', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.role === 'TEACHER' ? 'Giáo viên' : 'Học viên'} • {currentUser.email}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(79, 70, 229, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a5b4fc',
              flexShrink: 0,
            }}>
              <LogIn size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                Đăng nhập tài khoản
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                Lưu lịch sử & đề biên soạn
              </div>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};

