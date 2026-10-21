import React, { useState, useEffect } from 'react';
import { Award, Clock, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { ExamAttempt } from '../types';

interface HistoryPageProps {
  onGoExplore: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onGoExplore }) => {
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={26} color="#f59e0b" />
          <span>Lịch Sử Luyện Thi Của Tôi</span>
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Theo dõi tiến độ học tập, điểm số và các bài thi đã hoàn thành
        </p>
      </div>

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
            Bạn chưa làm bài thi nào
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Hãy chọn một đề thi trong kho khám phá để kiểm tra kiến thức và ghi lại điểm số nhé!
          </p>
          <button onClick={onGoExplore} className="btn-primary">
            <span>Bắt đầu thi ngay</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map((item, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {item.examTitle}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
                  <span>Ngày thi: {new Date(item.date).toLocaleDateString('vi-VN')}</span>
                  <span>Thời gian: {item.duration}s</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
                  {item.score} / 10
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Đúng {item.totalCorrect}/{item.totalQuestions} câu
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
