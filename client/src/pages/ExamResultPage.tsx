import React, { useState, useEffect, useMemo } from 'react';
import { ExamAttempt, LeaderboardEntry } from '../types';
import { api } from '../services/api';
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
  Printer,
  Zap,
  HelpCircle,
  Medal,
  Award,
  ShieldCheck,
  Flame,
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
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showLeaderboardTab, setShowLeaderboardTab] = useState(false);

  // Tải bảng xếp hạng cho đề thi này
  useEffect(() => {
    if (result.examId) {
      setLoadingLeaderboard(true);
      api.getExamLeaderboard(result.examId)
        .then((data) => setLeaderboard(data))
        .catch((err) => console.error('Lỗi tải BXH:', err))
        .finally(() => setLoadingLeaderboard(false));
    }
  }, [result.examId]);

  // Bắn pháo hoa nếu điểm từ trung bình khá trở lên
  useEffect(() => {
    if (result.score >= 5) {
      confetti({
        particleCount: 80,
        spread: 60,
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
  const avgSeconds = Math.round(result.durationSeconds / (result.totalQuestions || 1));

  // Thống kê câu hỏi
  const answers = result.answers || [];
  const correctAnswers = answers.filter((a) => a.isCorrect);
  const incorrectAnswers = answers.filter((a) => !a.isCorrect && a.selectedOptionId);
  const unansweredAnswers = answers.filter((a) => !a.selectedOptionId);

  // Danh sách hiển thị theo bộ lọc
  const filteredAnswers = useMemo(() => {
    if (reviewFilter === 'correct') return correctAnswers;

    if (reviewFilter === 'incorrect') return incorrectAnswers;
    if (reviewFilter === 'unanswered') return unansweredAnswers;
    return answers;
  }, [answers, reviewFilter, correctAnswers, incorrectAnswers, unansweredAnswers]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
      {/* Result Summary Card */}
      <div className="glass-card" style={{
        padding: '36px',
        textAlign: 'center',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}>
        {/* Top Accent Strip */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: result.score >= 8 ? '#059669' : result.score >= 5 ? '#d97706' : '#e11d48',
        }} />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: result.score >= 8 ? 'rgba(5, 150, 105, 0.15)' : 'rgba(217, 119, 6, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Trophy size={32} color={result.score >= 8 ? '#10b981' : '#f59e0b'} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          {result.score >= 8 ? 'Kết Quả Xuất Sắc!' : result.score >= 5 ? 'Đã Hoàn Thành Bài Thi' : 'Cần Tiếp Tục Ôn Luyện!'}
        </h2>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Thí sinh: <strong style={{ color: '#fff' }}>{result.studentName}</strong> • Đề thi: <strong style={{ color: '#fff' }}>{result.exam?.title}</strong>
        </p>

        {/* Score & Key Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          maxWidth: '740px',
          margin: '0 auto 28px',
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Điểm số</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#a5b4fc' }}>
              {result.score} <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>/ 10</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Độ chính xác</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
              {percentage}%
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Thời gian làm</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {formatDuration(result.durationSeconds)}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Tốc độ TB</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              {avgSeconds}s / câu
            </div>
          </div>
        </div>

        {/* Tab switch anti-cheat info */}
        {result.tabSwitchCount > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(225, 29, 72, 0.1)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#fb7185',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '24px',
          }}>
            <AlertTriangle size={15} />
            <span>Phát hiện rời màn hình {result.tabSwitchCount} lần trong lúc làm bài</span>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onRetake} className="btn-secondary">
            <RotateCcw size={16} />
            <span>Làm lại đề này</span>
          </button>

          <button onClick={() => window.print()} className="btn-secondary">
            <Printer size={16} />
            <span>In bảng điểm / Lưu PDF</span>
          </button>

          <button onClick={onGoHome} className="btn-primary">
            <Compass size={16} />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>

      {/* Bảng Vàng Danh Dự (Leaderboard Card) */}
      {leaderboard.length > 0 && (
        <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={20} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Bảng Vàng Danh Dự • Top Thí Sinh Điểm Cao Nhất
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Xếp hạng theo điểm số cao nhất và thời gian hoàn thành nhanh nhất
                </p>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.12)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              {leaderboard.length} thí sinh đã nộp
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)', fontSize: '12px' }}>
                  <th style={{ padding: '10px 14px', width: '70px' }}>Hạng</th>
                  <th style={{ padding: '10px 14px' }}>Thí sinh</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Điểm số</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Số câu đúng</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Thời gian</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Ngày thi</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => {
                  const isCurrentStudent = entry.id === result.id || (entry.studentName === result.studentName && Math.abs(entry.score - result.score) < 0.01);
                  const rankIcons = [
                    <Medal key="gold" size={18} color="#fbbf24" />,
                    <Medal key="silver" size={18} color="#94a3b8" />,
                    <Medal key="bronze" size={18} color="#d97706" />,
                  ];

                  return (
                    <tr
                      key={entry.id || idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isCurrentStudent ? 'rgba(79, 70, 229, 0.12)' : 'transparent',
                        fontWeight: isCurrentStudent ? 700 : 500,
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {idx < 3 ? rankIcons[idx] : <span style={{ color: 'var(--text-dim)', paddingLeft: '4px' }}>#{idx + 1}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: isCurrentStudent ? '#a5b4fc' : '#fff' }}>
                        {entry.studentName}
                        {isCurrentStudent && (
                          <span style={{ fontSize: '11px', marginLeft: '6px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                            (Bài của bạn)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: entry.score >= 8 ? '#10b981' : entry.score >= 5 ? '#f59e0b' : '#fb7185' }}>
                        {entry.score} / 10
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {entry.totalCorrect} / {entry.totalQuestions}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#38bdf8' }}>
                        {formatDuration(entry.durationSeconds)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-dim)', fontSize: '12px' }}>
                        {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Chi tiết từng câu hỏi & Lời giải */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>Xem lại chi tiết bài làm & Lời giải ({filteredAnswers.length} câu)</span>
          </h3>

          {/* Bộ lọc câu hỏi */}
          <div className="no-print" style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setReviewFilter('all')}
              className={`palette-filter-pill ${reviewFilter === 'all' ? 'active' : ''}`}
            >
              Tất cả ({answers.length})
            </button>
            <button
              onClick={() => setReviewFilter('correct')}
              className={`palette-filter-pill ${reviewFilter === 'correct' ? 'active' : ''}`}
            >
              Đúng ({correctAnswers.length})
            </button>
            <button
              onClick={() => setReviewFilter('incorrect')}
              className={`palette-filter-pill ${reviewFilter === 'incorrect' ? 'active' : ''}`}
            >
              Sai ({incorrectAnswers.length})
            </button>
            <button
              onClick={() => setReviewFilter('unanswered')}
              className={`palette-filter-pill ${reviewFilter === 'unanswered' ? 'active' : ''}`}
            >
              Chưa làm ({unansweredAnswers.length})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredAnswers.map((ans, idx) => {
            const isCorrect = ans.isCorrect;
            const isUnanswered = !ans.selectedOptionId;
            const q = ans.question;
            if (!q) return null;

            return (
              <div
                key={ans.id || idx}
                className="glass-card"
                style={{
                  padding: '22px',
                  borderLeft: `4px solid ${isCorrect ? '#059669' : isUnanswered ? '#d97706' : '#e11d48'}`,
                }}
              >
                {/* Header câu hỏi */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '12px',
                      color: '#fff',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      Câu {ans.question?.orderIndex !== undefined ? ans.question.orderIndex + 1 : idx + 1}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isCorrect ? '#10b981' : isUnanswered ? '#f59e0b' : '#fb7185',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {isCorrect ? <CheckCircle2 size={14} /> : isUnanswered ? <HelpCircle size={14} /> : <XCircle size={14} />}
                      {isCorrect ? 'Trả lời đúng' : isUnanswered ? 'Chưa trả lời' : 'Trả lời sai'}
                    </span>
                  </div>
                </div>

                {/* Nội dung câu hỏi (KaTeX) */}
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '16px', lineHeight: 1.6 }}>
                  <MathRenderer content={q.content} />
                </div>

                {/* Các phương án */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {(q.options || []).map((opt, oIdx) => {
                    const isSelected = ans.selectedOptionId === opt.id;
                    const isCorrectOpt = opt.isCorrect;
                    const letter = String.fromCharCode(65 + oIdx);

                    let borderColor = 'var(--border-subtle)';
                    let bgColor = 'rgba(255, 255, 255, 0.02)';
                    let tag = null;

                    if (isCorrectOpt) {
                      borderColor = '#059669';
                      bgColor = 'rgba(5, 150, 105, 0.12)';
                      tag = <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 700 }}> (Đáp án đúng)</span>;
                    } else if (isSelected && !isCorrectOpt) {
                      borderColor = '#e11d48';
                      bgColor = 'rgba(225, 29, 72, 0.12)';
                      tag = <span style={{ color: '#fb7185', fontSize: '11px', fontWeight: 700 }}> (Bạn đã chọn)</span>;
                    }

                    return (
                      <div
                        key={opt.id || oIdx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${borderColor}`,
                          background: bgColor,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
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
                    background: 'rgba(79, 70, 229, 0.06)',
                    border: '1px solid rgba(79, 70, 229, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ color: '#a5b4fc', display: 'block', marginBottom: '3px' }}>
                      Lời giải chi tiết:
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

