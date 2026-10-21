import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question, AttemptAnswer, ExamAttempt } from '../types';
import { api } from '../services/api';
import { MathRenderer } from '../components/MathRenderer';
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  Maximize2,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';

interface ExamRunnerPageProps {
  examId: string;
  mode: 'exam' | 'practice';
  onBack: () => void;
  onFinish: (result: ExamAttempt) => void;
}

export const ExamRunnerPage: React.FC<ExamRunnerPageProps> = ({
  examId,
  mode,
  onBack,
  onFinish,
}) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lưu trữ câu trả lời: questionId -> selectedOptionId
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  // Đánh dấu câu hỏi cần xem lại
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Đồng hồ đếm ngược (tính theo giây)
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [tabWarning, setTabWarning] = useState<string | null>(null);

  // Modal xác nhận nộp bài
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tên thí sinh
  const [studentName, setStudentName] = useState('Thí sinh tự do');

  // 1. Tải đề thi
  useEffect(() => {
    setLoading(true);
    api.getExamById(examId, mode === 'exam' ? 'exam' : 'review')
      .then((data) => {
        setExam(data);
        const durationSec = (data.durationMinutes || 30) * 60;
        setTimeLeft(durationSec);

        // Khôi phục câu trả lời từ localStorage nếu có
        const saved = localStorage.getItem(`quiz_answers_${examId}`);
        if (saved) {
          try {
            setSelectedAnswers(JSON.parse(saved));
          } catch {}
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải đề thi:', err);
        alert('Không thể tải đề thi: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, [examId, mode]);

  // 2. Lưu câu trả lời tự động vào localStorage
  useEffect(() => {
    if (Object.keys(selectedAnswers).length > 0) {
      localStorage.setItem(`quiz_answers_${examId}`, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, examId]);

  // 3. Bộ đếm ngược thời gian
  useEffect(() => {
    if (mode !== 'exam' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(); // Tự động nộp bài khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  // 4. Chống gian lận: Cảnh báo chuyển tab (Anti-cheat)
  useEffect(() => {
    if (mode !== 'exam') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setTabWarning(`Cảnh báo: Bạn vừa rời khỏi màn hình thi (${next} lần). Hãy tập trung làm bài!`);
          setTimeout(() => setTabWarning(null), 5000);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mode]);

  // Format thời gian MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chọn đáp án
  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Đánh dấu xem lại
  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Nộp bài thi
  const handleSubmitExam = async () => {
    if (!exam || submitting) return;

    setSubmitting(true);
    try {
      const answersArray = (exam.questions || []).map((q) => ({
        questionId: q.id!,
        selectedOptionId: selectedAnswers[q.id!] || null,
      }));

      const totalSec = (exam.durationMinutes || 30) * 60;
      const durationSeconds = Math.max(0, totalSec - timeLeft);

      const result = await api.submitAttempt({
        examId: exam.id,
        studentName,
        durationSeconds,
        tabSwitchCount,
        answers: answersArray,
      });

      // Xóa bộ nhớ tạm sau khi nộp
      localStorage.removeItem(`quiz_answers_${examId}`);
      onFinish(result);
    } catch (err: any) {
      alert('Lỗi khi nộp bài thi: ' + err.message);
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading || !exam || !exam.questions || exam.questions.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255, 255, 255, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s infinite linear' }} />
        <p style={{ color: 'var(--text-muted)' }}>Đang chuẩn bị phòng thi và ngân hàng câu hỏi...</p>
      </div>
    );
  }

  const questions = exam.questions;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentSelectedOptId = selectedAnswers[currentQ.id!];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Top Bar phòng thi */}
      <div style={{
        height: '64px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Nút thoát & Tên đề thi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '40%' }}>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <ArrowLeft size={16} />
            <span>Thoát</span>
          </button>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {exam.title}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Chế độ: {mode === 'exam' ? 'Thi tính giờ chính thức' : 'Ôn luyện tự do'}
            </div>
          </div>
        </div>

        {/* Đồng hồ đếm ngược */}
        {mode === 'exam' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: timeLeft < 300 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(124, 58, 237, 0.15)',
            border: `1px solid ${timeLeft < 300 ? '#f43f5e' : 'var(--primary)'}`,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            color: timeLeft < 300 ? '#fb7185' : '#c4b5fd',
            fontWeight: 800,
            fontSize: '16px',
            fontFamily: 'var(--font-mono)',
          }}>
            <Clock size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}

        {/* Nút Nộp bài thi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Đã làm: <strong style={{ color: '#fff' }}>{answeredCount}</strong>/{questions.length}
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary"
            style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          >
            <Send size={15} />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>

      {/* Cảnh báo chuyển tab nếu có */}
      {tabWarning && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.95)',
          color: '#fff',
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}>
          <AlertTriangle size={18} />
          <span>{tabWarning}</span>
        </div>
      )}

      {/* Main Body */}
      <div style={{ flex: 1, display: 'flex', maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px', gap: '24px' }}>
        {/* Khung Câu Hỏi Hiện Tại */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="glass-card" style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header Câu Hỏi */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  Câu {currentIndex + 1}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                  (Tổng số {questions.length} câu)
                </span>
              </div>

              {/* Đánh dấu xem lại */}
              <button
                onClick={() => toggleFlag(currentQ.id!)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: flaggedQuestions[currentQ.id!] ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${flaggedQuestions[currentQ.id!] ? '#f59e0b' : 'var(--border-subtle)'}`,
                  color: flaggedQuestions[currentQ.id!] ? '#fbbf24' : 'var(--text-muted)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Flag size={15} fill={flaggedQuestions[currentQ.id!] ? '#f59e0b' : 'none'} />
                <span>{flaggedQuestions[currentQ.id!] ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}</span>
              </button>
            </div>

            {/* Nội dung câu hỏi (có KaTeX) */}
            <div style={{
              fontSize: '17px',
              fontWeight: 600,
              lineHeight: 1.6,
              color: '#fff',
              marginBottom: '28px',
            }}>
              <MathRenderer content={currentQ.content} />
            </div>

            {/* Danh sách các phương án A, B, C, D */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {(currentQ.options || []).map((opt, idx) => {
                const isSelected = currentSelectedOptId === opt.id;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                // Trong chế độ Practice, hiện đáp án đúng/sai ngay lập tức
                const isPracticeMode = mode === 'practice';
                const showCorrect = isPracticeMode && isSelected && opt.isCorrect;
                const showIncorrect = isPracticeMode && isSelected && !opt.isCorrect;

                return (
                  <button
                    key={opt.id || idx}
                    onClick={() => handleSelectOption(currentQ.id!, opt.id!)}
                    className={`option-btn ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showIncorrect ? 'incorrect' : ''}`}
                  >
                    <div className="option-key">
                      {letter}
                    </div>
                    <div style={{ flex: 1, fontSize: '15px' }}>
                      <MathRenderer content={opt.content} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Lời giải chi tiết trong chế độ Practice */}
            {mode === 'practice' && currentSelectedOptId && currentQ.explanation && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  <Info size={16} />
                  <span>Lời giải thích chi tiết:</span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <MathRenderer content={currentQ.explanation} />
                </div>
              </div>
            )}

            {/* Điều hướng Trước / Sau */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="btn-secondary"
                style={{ opacity: currentIndex === 0 ? 0.4 : 1, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                <ArrowLeft size={16} />
                <span>Câu trước</span>
              </button>

              <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                Dùng phím mũi tên hoặc click ô bên phải để chuyển câu
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="btn-secondary"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <Send size={15} />
                  <span>Hoàn thành bài thi</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Bảng Điều Hướng Câu Hỏi (Question Palette) */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '88px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
              Bảng điều hướng câu hỏi
            </h3>

            {/* Chú thích màu sắc */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} />
                <span>Đã làm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)' }} />
                <span>Chưa làm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
                <span>Đánh dấu xem lại</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #8b5cf6' }} />
                <span>Đang xem</span>
              </div>
            </div>

            {/* Grid các nút câu hỏi */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}>
              {questions.map((q, idx) => {
                const isAnswered = Boolean(selectedAnswers[q.id!]);
                const isFlagged = Boolean(flaggedQuestions[q.id!]);
                const isCurrent = idx === currentIndex;

                let bg = 'rgba(255, 255, 255, 0.06)';
                let color = 'var(--text-muted)';
                let border = '1px solid var(--border-subtle)';

                if (isAnswered) {
                  bg = 'var(--primary)';
                  color = '#fff';
                  border = '1px solid var(--primary)';
                }

                if (isFlagged) {
                  bg = '#f59e0b';
                  color = '#000';
                  border = '1px solid #f59e0b';
                }

                if (isCurrent) {
                  border = '2px solid #38bdf8';
                  color = '#fff';
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: bg,
                      color,
                      border,
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '20px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <CheckCircle size={16} />
              <span>Nộp bài ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Xác Nhận Nộp Bài */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
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
            maxWidth: '460px',
            padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <CheckCircle size={32} color="#10b981" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Xác nhận nộp bài thi?
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Bạn đã hoàn thành <strong>{answeredCount}</strong> trên tổng số <strong>{questions.length}</strong> câu hỏi.
              {answeredCount < questions.length && (
                <span style={{ color: '#fbbf24', display: 'block', marginTop: '6px' }}>
                  ⚠️ Bạn vẫn còn {questions.length - answeredCount} câu chưa trả lời!
                </span>
              )}
            </p>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Họ và tên thí sinh hiển thị trên chứng nhận:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nhập họ tên của bạn..."
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn-secondary"
                disabled={submitting}
              >
                Tiếp tục làm bài
              </button>

              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                {submitting ? 'Đang chấm bài...' : 'Xác nhận nộp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
