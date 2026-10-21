import React from 'react';
import { Exam } from '../types';
import { Clock, HelpCircle, Users, Play, BookOpen, KeyRound } from 'lucide-react';

interface QuizCardProps {
  exam: Exam;
  onStartExam: (examId: string) => void;
  onPractice: (examId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ exam, onStartExam, onPractice }) => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }} />
        )}

        {/* Subject Badge */}
        {exam.subject && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 17, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 700,
            color: exam.subject.color || '#fff',
            border: `1px solid ${exam.subject.color || 'var(--border-subtle)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <span>{exam.subject.name}</span>
          </div>
        )}

        {/* Access Code / PIN Badge */}
        {exam.accessCode && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(6, 182, 212, 0.9)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontWeight: 800,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(6, 182, 212, 0.4)',
          }}>
            <KeyRound size={12} />
            <span>PIN: {exam.accessCode}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.4,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
          }}>
            {exam.creatorName.charAt(0)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {exam.creatorName}
          </span>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-dim)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <HelpCircle size={14} color="#8b5cf6" />
            <span>{exam.totalQuestions ?? (exam.questions?.length || 0)} câu hỏi</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={14} color="#f59e0b" />
            <span>{exam.durationMinutes} phút</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={14} color="#10b981" />
            <span>{exam.attemptCount} lượt thi</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
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
            <span>Thi ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
