import React, { useState } from 'react';
import { X, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Exam } from '../types';

interface JoinPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamFound: (exam: Exam) => void;
}

export const JoinPinModal: React.FC<JoinPinModalProps> = ({ isOpen, onClose, onExamFound }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Vui lòng nhập mã phòng thi gồm 6 chữ số');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const exam = await api.getExamByPin(pin.trim());
      onClose();
      onExamFound(exam);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy phòng thi với mã PIN này');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}>
            <KeyRound size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            Tham Gia Phòng Thi
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Nhập mã PIN 6 số do giáo viên hoặc người tạo đề cung cấp
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/[^0-9]/g, ''));
                setError(null);
              }}
              placeholder="VD: 101101"
              autoFocus
              style={{
                width: '100%',
                height: '60px',
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '2px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#fb7185',
              fontSize: '13px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-subtle)',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Mã phòng thi thử nghiệm có sẵn:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {['101101', '202202', '303303'].map((code) => (
                <button
                  type="button"
                  key={code}
                  onClick={() => setPin(code)}
                  style={{
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#22d3ee',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ height: '48px', fontSize: '15px', marginTop: '8px' }}
          >
            {loading ? 'Đang tìm kiếm...' : (
              <>
                <span>Vào phòng thi ngay</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
