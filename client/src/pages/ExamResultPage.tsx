import React, { useEffect } from 'react';
import { ExamAttempt } from '../types';
import { MathRenderer } from '../components/MathRenderer';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Compass,
  AlertTriangle,
  Award,
  Share2,
} from 'lucide-react';

interface ExamResultPageProps {
  result: ExamAttempt;
  onRetake: () => void;
  onGoHome: () => void;
}

export const ExamResultPage: React.FC<ExamResultPageProps> = ({
  result,
  onRetake,
  onGoHome,
}) => {
  // Bắn pháo hoa nếu điểm từ trung bình khá trở lên
  useEffect(() => {
    if (result.score >= 5) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result.score]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs} giây`;
  };

  const percentage = Math.round((result.totalCorrect / (result.totalQuestions || 1)) * 100);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
      {/* Result Summary Card */}
      <div className="glass-card" style={{
        padding: '40px',
        textAlign: 'center',
        marginBottom: '36px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}>
        {/* Decorative Top Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: result.score >= 8 ? 'linear-gradient(90deg, #10b981, #06b6d4)' : result.score >= 5 ? 'linear-gradient(90deg, #f59e0b, #eab308)' : 'linear-gradient(90deg, #f43f5e, #ec4899)',
        }} />

        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: result.score >= 8 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Trophy size={36} color={result.score >= 8 ? '#10b981' : '#f59e0b'} />
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          {result.score >= 8 ? 'Xuất Sắc! Bạn Đã Vượt Qua' : result.score >= 5 ? 'Chúc Mừng! Bạn Đã Đạt Yêu Cầu' : 'Cần Cố Gắng Thêm Lần Sau!'}
        </h2>

        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '28px' }}>
          Thí sinh: <strong style={{ color: '#fff' }}>{result.studentName}</strong> • Bài thi: <strong style={{ color: '#fff' }}>{result.exam?.title}</strong>
        </p>

        {/* Score & Key Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          maxWidth: '700px',
          margin: '0 auto 32px',
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Điểm số</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#8b5cf6' }}>
              {result.score} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>/ 10</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Độ chính xác</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
              {percentage}%
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Số câu đúng</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#06b6d4' }}>
              {result.totalCorrect} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>/ {result.totalQuestions}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Thời gian làm</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {formatDuration(result.durationSeconds)}
            </div>
          </div>
        </div>

        {/* Tab switch anti-cheat info */}
        {result.tabSwitchCount > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '28px',
          }}>
            <AlertTriangle size={15} />
            <span>Phát hiện rời màn hình {result.tabSwitchCount} lần trong lúc làm bài</span>
          </div>
        )}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
          <button onClick={onRetake} className="btn-secondary">
            <RotateCcw size={16} />
            <span>Làm lại đề này</span>
          </button>

          <button onClick={onGoHome} className="btn-primary">
            <Compass size={16} />
            <span>Khám phá đề thi khác</span>
          </button>
        </div>
      </div>

      {/* Chi tiết từng câu hỏi & Lời giải */}
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={22} color="#10b981" />
          <span>Xem lại toàn bộ bài làm & Lời giải chi tiết</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(result.answers || []).map((ans, idx) => {
            const isCorrect = ans.isCorrect;
            const q = ans.question;
            if (!q) return null;

            return (
              <div
                key={ans.id || idx}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderLeft: `4px solid ${isCorrect ? '#10b981' : '#f43f5e'}`,
                }}
              >
                {/* Header câu hỏi */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '13px',
                      color: '#fff',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      Câu {idx + 1}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isCorrect ? '#10b981' : '#f43f5e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {isCorrect ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                      {isCorrect ? 'Trả lời đúng' : 'Trả lời sai'}
                    </span>
                  </div>
                </div>

                {/* Nội dung câu hỏi (KaTeX) */}
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '18px', lineHeight: 1.6 }}>
                  <MathRenderer content={q.content} />
                </div>

                {/* Các phương án */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                  {(q.options || []).map((opt, oIdx) => {
                    const isSelected = ans.selectedOptionId === opt.id;
                    const isCorrectOpt = opt.isCorrect;
                    const letter = String.fromCharCode(65 + oIdx);

                    let borderColor = 'var(--border-subtle)';
                    let bgColor = 'rgba(255, 255, 255, 0.02)';
                    let tag = null;

                    if (isCorrectOpt) {
                      borderColor = '#10b981';
                      bgColor = 'rgba(16, 185, 129, 0.15)';
                      tag = <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 700 }}> (Đáp án đúng)</span>;
                    } else if (isSelected && !isCorrectOpt) {
                      borderColor = '#f43f5e';
                      bgColor = 'rgba(244, 63, 94, 0.15)';
                      tag = <span style={{ color: '#fb7185', fontSize: '11px', fontWeight: 700 }}> (Bạn đã chọn câu này)</span>;
                    }

                    return (
                      <div
                        key={opt.id || oIdx}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${borderColor}`,
                          background: bgColor,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <strong style={{ color: '#fff' }}>{letter}.</strong>
                        <div style={{ flex: 1 }}>
                          <MathRenderer content={opt.content} />
                          {tag}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lời giải thích chi tiết */}
                {q.explanation && (
                  <div style={{
                    background: 'rgba(124, 58, 237, 0.08)',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 18px',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ color: '#c4b5fd', display: 'block', marginBottom: '4px' }}>
                      💡 Lời giải chi tiết:
                    </strong>
                    <MathRenderer content={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
