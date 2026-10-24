import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ArrowRight, BookOpen, Trash2, Eye, Calendar, Award } from 'lucide-react';

interface HistoryPageProps {
  onGoExplore: () => void;
  onViewAttempt?: (attemptId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onGoExplore, onViewAttempt }) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Tải lịch sử thi từ localStorage nếu có
    const saved = localStorage.getItem('user_exam_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thi đã lưu trên trình duyệt?')) {
      localStorage.removeItem('user_exam_history');
      setHistory([]);
    }
  };

  // Thống kê cá nhân
  const stats = useMemo(() => {
    if (history.length === 0) {
      return { totalTests: 0, avgScore: 0, avgAccuracy: 0, maxScore: 0 };
    }
    const totalTests = history.length;
    const totalScores = history.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
    const avgScore = Math.round((totalScores / totalTests) * 10) / 10;
    const maxScore = Math.max(...history.map((item) => Number(item.score) || 0));

    let totalCorrect = 0;
    let totalQuestions = 0;
    history.forEach((item) => {
      totalCorrect += item.totalCorrect || 0;
      totalQuestions += item.totalQuestions || 0;
    });
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return { totalTests, avgScore, avgAccuracy, maxScore };
  }, [history]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px 24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            Hồ Sơ & Lịch Sử Ôn Thi Cá Nhân
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Theo dõi tiến độ học tập, tổng hợp điểm số và xem lại chi tiết từng bài thi đã làm
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn-secondary"
            style={{ color: '#fb7185', borderColor: 'rgba(225, 29, 72, 0.2)', fontSize: '13px' }}
          >
            <Trash2 size={15} />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {/* Analytics Dashboard Grid */}
      {history.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}>
          <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Số bài đã làm
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>
              {stats.totalTests}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Điểm trung bình
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#a5b4fc' }}>
              {stats.avgScore} <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>/ 10</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Độ chính xác TB
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
              {stats.avgAccuracy}%
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Điểm cao nhất
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b' }}>
              {stats.maxScore} <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>/ 10</span>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)',
        }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Chưa có bài thi nào trong lịch sử
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Hãy chọn một đề thi trong kho môn học để bắt đầu làm bài và lưu lại kết quả!
          </p>
          <button onClick={onGoExplore} className="btn-primary">
            <span>Khám phá đề thi ngay</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {history.map((item, idx) => {
            const isGood = (Number(item.score) || 0) >= 8;
            const isPass = (Number(item.score) || 0) >= 5;

            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    {item.examTitle}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} />
                      {new Date(item.date).toLocaleDateString('vi-VN')} {new Date(item.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} />
                      {item.duration} giây
                    </span>
                    <span>
                      Đúng {item.totalCorrect}/{item.totalQuestions} câu
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: isGood ? '#10b981' : isPass ? '#f59e0b' : '#fb7185',
                    }}>
                      {item.score} <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>/ 10</span>
                    </div>
                  </div>

                  {item.id && onViewAttempt && (
                    <button
                      onClick={() => onViewAttempt(item.id)}
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '13px' }}
                    >
                      <Eye size={14} />
                      <span>Xem lại</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
