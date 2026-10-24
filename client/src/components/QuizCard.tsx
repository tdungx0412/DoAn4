import React, { useState } from 'react';
import { Exam } from '../types';
import { Clock, FileText, Users, Play, BookOpen, KeyRound, Check } from 'lucide-react';

interface QuizCardProps {
  exam: Exam;
  onStartExam: (examId: string) => void;
  onPractice: (examId: string) => void;
  onDelete?: (examId: string) => void;
}

const getGradeLevelInfo = (level?: string) => {
  switch (level) {
    case 'PRIMARY':
      return { label: 'Tiểu học', bg: 'rgba(234, 88, 12, 0.25)', color: '#fb923c', border: 'rgba(234, 88, 12, 0.5)' };
    case 'SECONDARY':
      return { label: 'THCS', bg: 'rgba(2, 132, 199, 0.25)', color: '#38bdf8', border: 'rgba(2, 132, 199, 0.5)' };
    case 'HIGH_SCHOOL':
      return { label: 'THPT', bg: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc', border: 'rgba(99, 102, 241, 0.5)' };
    case 'UNIVERSITY':
      return { label: 'Đại học / CC', bg: 'rgba(16, 185, 129, 0.25)', color: '#34d399', border: 'rgba(16, 185, 129, 0.5)' };
    default:
      return { label: 'Phổ thông', bg: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', border: 'rgba(255, 255, 255, 0.2)' };
  }
};

export const QuizCard: React.FC<QuizCardProps> = ({ exam, onStartExam, onPractice, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const levelInfo = getGradeLevelInfo(exam.gradeLevel);

  const handleCopyPin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!exam.accessCode) return;
    navigator.clipboard.writeText(exam.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* Cover Image */}
      <div style={{ position: 'relative', height: '150px', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
        {exam.coverImage ? (
          <img
            src={exam.coverImage}
            alt={exam.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #3730a3, #4f46e5)' }} />
        )}

        {/* Badges: Subject & Grade Level */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          maxWidth: '65%',
        }}>
          {exam.subject && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              color: exam.subject.color || '#fff',
              border: `1px solid ${exam.subject.color || 'var(--border-subtle)'}`,
            }}>
              <span>{exam.subject.name}</span>
            </div>
          )}

          {exam.gradeLevel && (
            <div style={{
              background: levelInfo.bg,
              backdropFilter: 'blur(8px)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10px',
              fontWeight: 800,
              color: levelInfo.color,
              border: `1px solid ${levelInfo.border}`,
              letterSpacing: '0.2px',
            }}>
              <span>{levelInfo.label}</span>
            </div>
          )}
        </div>

        {/* Access Code / PIN Badge - Clickable Copy */}
        {exam.accessCode && (
          <button
            onClick={handleCopyPin}
            title="Click để sao chép mã PIN phòng thi"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(14, 165, 233, 0.95)',
              border: 'none',
              padding: '4px 9px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? <Check size={12} /> : <KeyRound size={12} />}
            <span>{copied ? 'Đã chép' : `PIN: ${exam.accessCode}`}</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.45,
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '44px',
        }}>
          {exam.title}
        </h3>

        {exam.description && (
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {exam.description}
          </p>
        )}

        {/* Creator Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: 'auto' }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
          }}>
            {exam.creatorName ? exam.creatorName.charAt(0).toUpperCase() : 'C'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {exam.creatorName}
          </span>
        </div>

        {/* Stats Row - Unified subtle monochromatic icons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-dim)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FileText size={14} color="var(--text-dim)" />
            <span>{exam.totalQuestions ?? (exam.questions?.length || 0)} câu</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={14} color="var(--text-dim)" />
            <span>{exam.durationMinutes} phút</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={14} color="var(--text-dim)" />
            <span>{exam.attemptCount} lượt</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => onPractice(exam.id)}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <BookOpen size={14} />
            <span>Ôn luyện</span>
          </button>

          <button
            onClick={() => onStartExam(exam.id)}
            className="btn-primary"
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <Play size={14} />
            <span>Làm bài</span>
          </button>
        </div>
      </div>
    </div>
  );
};

