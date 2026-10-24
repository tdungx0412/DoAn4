import React, { useState, useEffect, useRef } from 'react';
import { Exam, Question, AttemptAnswer, ExamAttempt, User } from '../types';
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
  Minimize2,
  CheckCircle,
  HelpCircle,
  Info,
  Keyboard,
  X,
} from 'lucide-react';

interface ExamRunnerPageProps {
  examId: string;
  mode: 'exam' | 'practice';
  currentUser?: User | null;
  onBack: () => void;
  onFinish: (result: ExamAttempt) => void;
}

export const ExamRunnerPage: React.FC<ExamRunnerPageProps> = ({
  examId,
  mode,
  currentUser,
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
  const [showCheatModal, setShowCheatModal] = useState(false);

  // Modal xác nhận nộp bài & Bàn phím tắt
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'answered' | 'unanswered' | 'flagged'>('all');

  // Tên thí sinh
  const [studentName, setStudentName] = useState(currentUser?.name || 'Thí sinh tự do');

  useEffect(() => {
    if (currentUser?.name) {
      setStudentName(currentUser.name);
    }
  }, [currentUser]);

  // 1. Tải đề thi & Khôi phục tiến trình làm bài
  useEffect(() => {
    setLoading(true);
    api.getExamById(examId, mode === 'exam' ? 'exam' : 'review')
      .then((data) => {
        setExam(data);
        const durationSec = (data.durationMinutes || 30) * 60;

        if (mode === 'exam') {
          // Khôi phục mốc thời gian kết thúc hoặc tạo mới nếu lần đầu vào thi
          const storedEndTime = localStorage.getItem(`quiz_end_time_${examId}`);
          let remainingSec = durationSec;

          if (storedEndTime) {
            const parsedEnd = parseInt(storedEndTime, 10);
            const diff = Math.round((parsedEnd - Date.now()) / 1000);
            remainingSec = diff > 0 ? diff : 0;
          } else {
            const newEndTime = Date.now() + durationSec * 1000;
            localStorage.setItem(`quiz_end_time_${examId}`, newEndTime.toString());
          }
          setTimeLeft(remainingSec);
        } else {
          setTimeLeft(durationSec);
        }

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
          setTabWarning(`Cảnh báo: Bạn vừa rời khỏi màn hình thi (${next} lần)!`);
          setShowCheatModal(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mode]);


  // 5. Bàn phím tắt hỗ trợ thao tác nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) return;
      if (!exam || !exam.questions || exam.questions.length === 0) return;

      const currentQ = exam.questions[currentIndex];
      const key = e.key.toUpperCase();

      if (['A', 'B', 'C', 'D'].includes(key)) {
        const optIndex = key.charCodeAt(0) - 65; // 0, 1, 2, 3
        if (currentQ?.options?.[optIndex]) {
          handleSelectOption(currentQ.id!, currentQ.options[optIndex].id!);
        }
      } else if (['1', '2', '3', '4'].includes(key)) {
        const optIndex = parseInt(key, 10) - 1;
        if (currentQ?.options?.[optIndex]) {
          handleSelectOption(currentQ.id!, currentQ.options[optIndex].id!);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(exam.questions!.length - 1, prev + 1));
      } else if (key === 'F') {
        if (currentQ?.id) toggleFlag(currentQ.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exam, currentIndex]);

  // Toggle Toàn Màn Hình
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

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
        studentName: studentName.trim() || 'Thí sinh tự do',
        studentEmail: currentUser?.email || undefined,
        userId: currentUser?.id || undefined,
        durationSeconds,
        tabSwitchCount,
        answers: answersArray,
      });

      // Xóa bộ nhớ tạm sau khi nộp
      localStorage.removeItem(`quiz_answers_${examId}`);
      localStorage.removeItem(`quiz_end_time_${examId}`);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '35%' }}>
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
              {mode === 'exam' ? 'Thi tính giờ chính thức' : 'Ôn luyện tự do'}
            </div>
          </div>
        </div>

        {/* Trung tâm: Đồng hồ đếm ngược, Phím tắt, Toàn màn hình */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {mode === 'exam' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: timeLeft < 300 ? 'rgba(225, 29, 72, 0.15)' : 'rgba(79, 70, 229, 0.12)',
              border: `1px solid ${timeLeft < 300 ? '#e11d48' : 'rgba(79, 70, 229, 0.4)'}`,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              color: timeLeft < 300 ? '#fb7185' : '#a5b4fc',
              fontWeight: 800,
              fontSize: '16px',
              fontFamily: 'var(--font-mono)',
            }}>
              <Clock size={17} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Nút Xem phím tắt */}
          <button
            onClick={() => setShowHotkeysModal(true)}
            className="btn-secondary"
            title="Xem danh sách phím tắt làm bài nhanh"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Keyboard size={15} />
            <span>Phím tắt</span>
          </button>

          {/* Nút Toàn màn hình */}
          <button
            onClick={toggleFullscreen}
            className="btn-secondary"
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
            style={{ padding: '6px 10px' }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Nút Nộp bài thi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Đã làm: <strong style={{ color: '#fff' }}>{answeredCount}</strong>/{questions.length}
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary"
            style={{ padding: '8px 18px', background: '#059669', boxShadow: '0 2px 10px rgba(5, 150, 105, 0.3)' }}
          >
            <Send size={15} />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>

      {/* Thanh Tiến Độ Làm Bài */}
      <div className="exam-progress-bar">
        <div
          className="exam-progress-fill"
          style={{ width: `${Math.round((answeredCount / (questions.length || 1)) * 100)}%` }}
        />
      </div>

      {/* Cảnh báo chuyển tab nếu có */}
      {tabWarning && (
        <div style={{
          background: 'rgba(225, 29, 72, 0.95)',
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
                  background: flaggedQuestions[currentQ.id!] ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${flaggedQuestions[currentQ.id!] ? '#d97706' : 'var(--border-subtle)'}`,
                  color: flaggedQuestions[currentQ.id!] ? '#f59e0b' : 'var(--text-muted)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Flag size={15} fill={flaggedQuestions[currentQ.id!] ? '#f59e0b' : 'none'} />
                <span>{flaggedQuestions[currentQ.id!] ? 'Đã đánh dấu (F)' : 'Đánh dấu xem lại (F)'}</span>
              </button>
            </div>

            {/* Nội dung câu hỏi (KaTeX) */}
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
                    <span className="kbd-key" style={{ opacity: 0.6, fontSize: '10px' }}>
                      {letter}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lời giải chi tiết trong chế độ Practice */}
            {mode === 'practice' && currentSelectedOptId && currentQ.explanation && (
              <div style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
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
                <span>Câu trước (←)</span>
              </button>

              <div style={{ fontSize: '13px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Phím tắt:</span>
                <span className="kbd-key">A-D</span>
                <span>chọn đáp án,</span>
                <span className="kbd-key">←</span>
                <span className="kbd-key">→</span>
                <span>chuyển câu</span>
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="btn-secondary"
                >
                  <span>Câu sau (→)</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="btn-primary"
                  style={{ background: '#059669' }}
                >
                  <Send size={15} />
                  <span>Nộp bài thi</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Bảng Điều Hướng Câu Hỏi */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '88px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
              Bảng điều hướng câu hỏi
            </h3>

            {/* Bộ lọc Palette Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {(['all', 'answered', 'unanswered', 'flagged'] as const).map((tab) => {
                const labels = {
                  all: `Tất cả (${questions.length})`,
                  answered: `Đã làm (${answeredCount})`,
                  unanswered: `Chưa làm (${questions.length - answeredCount})`,
                  flagged: `Cắm cờ (${Object.values(flaggedQuestions).filter(Boolean).length})`,
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setPaletteFilter(tab)}
                    className={`palette-filter-pill ${paletteFilter === tab ? 'active' : ''}`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
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

                // Kiểm tra theo bộ lọc
                if (paletteFilter === 'answered' && !isAnswered) return null;
                if (paletteFilter === 'unanswered' && isAnswered) return null;
                if (paletteFilter === 'flagged' && !isFlagged) return null;

                let bg = 'rgba(255, 255, 255, 0.05)';
                let color = 'var(--text-muted)';
                let border = '1px solid var(--border-subtle)';

                if (isAnswered) {
                  bg = 'var(--primary)';
                  color = '#fff';
                  border = '1px solid var(--primary)';
                }

                if (isFlagged) {
                  bg = '#d97706';
                  color = '#fff';
                  border = '1px solid #d97706';
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
              style={{ width: '100%', marginTop: '20px', background: '#059669' }}
            >
              <CheckCircle size={16} />
              <span>Nộp bài thi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Bàn Phím Tắt (Hotkeys Guide) */}
      {showHotkeysModal && (
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
          zIndex: 110,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Keyboard size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                  Phím tắt làm bài thi
                </h3>
              </div>
              <button onClick={() => setShowHotkeysModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chọn phương án A, B, C, D</span>
                <span style={{ display: 'flex', gap: '4px' }}>
                  <span className="kbd-key">A</span>
                  <span className="kbd-key">B</span>
                  <span className="kbd-key">C</span>
                  <span className="kbd-key">D</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chọn theo số thứ tự 1, 2, 3, 4</span>
                <span style={{ display: 'flex', gap: '4px' }}>
                  <span className="kbd-key">1</span>
                  <span className="kbd-key">2</span>
                  <span className="kbd-key">3</span>
                  <span className="kbd-key">4</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chuyển câu trước / câu sau</span>
                <span style={{ display: 'flex', gap: '4px' }}>
                  <span className="kbd-key">←</span>
                  <span className="kbd-key">→</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cắm cờ / Đánh dấu xem lại</span>
                <span className="kbd-key">F</span>
              </div>
            </div>

            <button
              onClick={() => setShowHotkeysModal(false)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Đã hiểu, quay lại làm bài
            </button>
          </div>
        </div>
      )}

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
              background: 'rgba(5, 150, 105, 0.15)',
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
                style={{ background: '#059669' }}
              >
                {submitting ? 'Đang chấm bài...' : 'Xác nhận nộp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cảnh Báo Gian Lận Rời Tab */}
      {showCheatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '2px solid rgba(225, 29, 72, 0.5)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '480px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(225, 29, 72, 0.25)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(225, 29, 72, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <AlertTriangle size={32} color="#fb7185" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Cảnh Báo Vi Phạm Quy Chế Thi!
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
              Hệ thống phát hiện bạn vừa <strong style={{ color: '#fb7185' }}>chuyển tab hoặc rời khỏi cửa sổ làm bài</strong>.
            </p>

            <div style={{
              background: 'rgba(225, 29, 72, 0.08)',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '22px',
              fontSize: '13px',
              color: '#fda4af',
            }}>
              Số lần vi phạm đã ghi nhận: <strong style={{ color: '#fff', fontSize: '16px' }}>{tabSwitchCount}</strong> lần.
              Thông tin này sẽ được lưu vào biên bản nộp bài và gửi tới giáo viên.
            </div>

            <button
              onClick={() => setShowCheatModal(false)}
              className="btn-primary"
              style={{
                width: '100%',
                height: '42px',
                background: '#e11d48',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Tôi Đã Hiểu & Tiếp Tục Làm Bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


